import { NextResponse } from "next/server";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { getAuthUserId } from "@/lib/auth-guard";

export async function GET() {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(decks.userId, userId), lte(cards.nextReviewDate, today)));

  return NextResponse.json(rows);
}
