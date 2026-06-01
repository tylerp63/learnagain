import { NextRequest } from "next/server";
import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth/require-user";

type Context = { params: Promise<{ id: string }> };

// GET /api/decks/[id]/cards — get all cards for a deck
export async function GET(request: NextRequest, { params }: Context) {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: deckId } = await params;

  // Verify deck ownership
  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)));

  if (!deck) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId))
    .orderBy(cards.createdAt);

  return Response.json(rows);
}

// POST /api/decks/[id]/cards — batch create cards
export async function POST(request: NextRequest, { params }: Context) {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: deckId } = await params;

  // Verify deck ownership
  const [deck] = await db
    .select({ id: decks.id })
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, user.id)));

  if (!deck) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const cardData: Array<{
    id: string;
    question: string;
    answer: string;
    nextReviewDate: string;
    easinessFactor?: number;
    interval?: number;
    repetitions?: number;
  }> = Array.isArray(body) ? body : body.cards;

  if (!cardData || cardData.length === 0) {
    return Response.json({ error: "No cards provided" }, { status: 400 });
  }

  const rows = await db
    .insert(cards)
    .values(
      cardData.map((c) => ({
        id: c.id,
        deckId,
        question: c.question,
        answer: c.answer,
        easinessFactor: c.easinessFactor ?? 2.5,
        interval: c.interval ?? 0,
        repetitions: c.repetitions ?? 0,
        nextReviewDate: c.nextReviewDate,
      }))
    )
    .returning();

  return Response.json(rows, { status: 201 });
}
