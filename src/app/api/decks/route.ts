import { NextRequest } from "next/server";
import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, sql, and, lte, count } from "drizzle-orm";
import { requireUser } from "@/lib/auth/require-user";

// GET /api/decks — list all decks with card counts
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

  return Response.json(rows);
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
