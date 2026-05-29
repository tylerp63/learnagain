import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { decks, cards } from "@/lib/db/schema";
import { getAuthUserId } from "@/lib/auth-guard";

export async function GET() {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: decks.id,
      name: decks.name,
      sourceFileName: decks.sourceFileName,
      createdAt: decks.createdAt,
      totalCards: sql<number>`count(${cards.id})::int`,
      dueCards: sql<number>`count(case when ${cards.nextReviewDate} <= ${new Date().toISOString().split("T")[0]} then 1 end)::int`,
    })
    .from(decks)
    .leftJoin(cards, eq(cards.deckId, decks.id))
    .where(eq(decks.userId, userId))
    .groupBy(decks.id)
    .orderBy(decks.createdAt);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  await db.insert(decks).values({
    id: body.id,
    userId,
    name: body.name,
    sourceFileName: body.sourceFileName,
    createdAt: body.createdAt,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
