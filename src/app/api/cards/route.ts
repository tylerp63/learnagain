import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { getAuthUserId } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deckId = req.nextUrl.searchParams.get("deckId");
  if (!deckId) {
    return NextResponse.json(
      { error: "deckId query param required" },
      { status: 400 }
    );
  }

  // Verify deck belongs to user
  const deck = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)));

  if (deck.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId));

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
  const items: Array<{
    id: string;
    deckId: string;
    question: string;
    answer: string;
    easinessFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
    createdAt: string;
  }> = Array.isArray(body) ? body : [body];

  if (items.length === 0) {
    return NextResponse.json({ error: "No cards provided" }, { status: 400 });
  }

  // Verify deck belongs to user
  const deckId = items[0].deckId;
  const deck = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)));

  if (deck.length === 0) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  await db.insert(cards).values(
    items.map((c) => ({
      id: c.id,
      deckId: c.deckId,
      question: c.question,
      answer: c.answer,
      easinessFactor: c.easinessFactor,
      interval: c.interval,
      repetitions: c.repetitions,
      nextReviewDate: c.nextReviewDate,
      createdAt: c.createdAt,
    }))
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
