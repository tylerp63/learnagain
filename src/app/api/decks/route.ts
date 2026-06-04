import { NextRequest } from "next/server";
import { db } from "@/db";
import { decks, cards, tags, deckTags } from "@/db/schema";
import { eq, sql, and, lte, count, inArray } from "drizzle-orm";
import { requireUser } from "@/lib/auth/require-user";

// GET /api/decks — list all decks with card counts and tags
export async function GET() {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  const rows = await db
    .select({
      id: decks.id,
      name: decks.name,
      sourceFileName: decks.sourceFileName,
      createdAt: decks.createdAt,
      totalCards: sql<number>`cast(count(${cards.id}) as int)`,
      dueCards: sql<number>`cast(count(case when ${cards.nextReviewDate} <= ${today} then 1 end) as int)`,
    })
    .from(decks)
    .leftJoin(cards, eq(cards.deckId, decks.id))
    .where(eq(decks.userId, user.id))
    .groupBy(decks.id)
    .orderBy(decks.createdAt);

  // Fetch tags for all decks in one query
  const deckIds = rows.map((r) => r.id);
  let tagsByDeck: Record<string, { id: string; name: string; createdAt: string }[]> = {};

  if (deckIds.length > 0) {
    const tagRows = await db
      .select({
        deckId: deckTags.deckId,
        tagId: tags.id,
        tagName: tags.name,
        tagCreatedAt: tags.createdAt,
      })
      .from(deckTags)
      .innerJoin(tags, eq(tags.id, deckTags.tagId))
      .where(inArray(deckTags.deckId, deckIds));

    for (const row of tagRows) {
      if (!tagsByDeck[row.deckId]) tagsByDeck[row.deckId] = [];
      tagsByDeck[row.deckId].push({
        id: row.tagId,
        name: row.tagName,
        createdAt: row.tagCreatedAt as string,
      });
    }
  }

  const result = rows.map((row) => ({
    ...row,
    tags: tagsByDeck[row.id] || [],
  }));

  return Response.json(result);
}

// POST /api/decks — create a new deck
export async function POST(request: NextRequest) {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, sourceFileName } = body;

  if (!id || !name || !sourceFileName) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [deck] = await db
    .insert(decks)
    .values({
      id,
      userId: user.id,
      name,
      sourceFileName,
    })
    .returning();

  return Response.json(deck, { status: 201 });
}
