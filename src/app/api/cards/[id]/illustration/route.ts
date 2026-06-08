import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth/require-user";

const client = new Anthropic();

type Context = { params: Promise<{ id: string }> };

// POST /api/cards/[id]/illustration — generate an SVG illustration for a card
export async function POST(_request: Request, { params }: Context) {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership through deck join
  const [card] = await db
    .select({
      id: cards.id,
      question: cards.question,
      answer: cards.answer,
    })
    .from(cards)
    .innerJoin(decks, eq(decks.id, cards.deckId))
    .where(and(eq(cards.id, id), eq(decks.userId, user.id)));

  if (!card) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are generating a small educational SVG illustration for a flashcard.

Flashcard question: ${card.question}
Flashcard answer: ${card.answer}

Rules:
- Generate a SINGLE self-contained <svg> element
- Use viewBox="0 0 300 200" and set width="300" height="200"
- Use simple shapes, arrows, labels, and colors to visualize the concept
- Use readable font sizes (12-16px) with font-family="system-ui, sans-serif"
- Use a clean educational style with soft colors (no harsh primaries)
- Do NOT use any external references, images, or links
- Do NOT include <script> tags or event handlers
- The illustration should help the student UNDERSTAND the concept visually
- If the concept is abstract (like a definition), use a simple diagram, icon-style drawing, or labeled relationship map
- For math/science: show formulas, diagrams, or processes
- For vocabulary/history: show a meaningful icon or relationship

Respond with ONLY the raw <svg>...</svg> markup. No markdown, no code fences, no explanation.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return Response.json(
      { error: "Unexpected response format" },
      { status: 500 }
    );
  }

  // Extract just the SVG from the response (in case there's extra whitespace)
  const svgMatch = content.text.match(/<svg[\s\S]*<\/svg>/i);
  if (!svgMatch) {
    return Response.json(
      { error: "Failed to generate valid SVG" },
      { status: 500 }
    );
  }

  const svg = svgMatch[0];

  // Save to database
  const [updated] = await db
    .update(cards)
    .set({ illustration: svg })
    .where(eq(cards.id, id))
    .returning();

  return Response.json(updated);
}
