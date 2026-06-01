import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { requireUser } from "@/lib/auth/require-user";

// GET /api/cards/due — cards due today across all user's decks
export async function GET() {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  const rows = await db
    .select({
      id: cards.id,
      deckId: cards.deckId,
      question: cards.question,
      answer: cards.answer,
      easinessFactor: cards.easinessFactor,
      interval: cards.interval,
      repetitions: cards.repetitions,
      nextReviewDate: cards.nextReviewDate,
      createdAt: cards.createdAt,
    })
    .from(cards)
    .innerJoin(decks, eq(decks.id, cards.deckId))
    .where(and(eq(decks.userId, user.id), lte(cards.nextReviewDate, today)));

  return Response.json(rows);
}
