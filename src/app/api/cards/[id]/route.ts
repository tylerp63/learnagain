import { NextRequest } from "next/server";
import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth/require-user";

type Context = { params: Promise<{ id: string }> };

// Helper: verify card ownership through deck
async function getOwnedCard(cardId: string, userId: string) {
  const [row] = await db
    .select({
      cardId: cards.id,
      deckId: cards.deckId,
    })
    .from(cards)
    .innerJoin(decks, eq(decks.id, cards.deckId))
    .where(and(eq(cards.id, cardId), eq(decks.userId, userId)));

  return row ?? null;
}

// PATCH /api/cards/[id] — update card (SM-2 fields, edit Q/A)
export async function PATCH(request: NextRequest, { params }: Context) {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const owned = await getOwnedCard(id, user.id);
  if (!owned) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  // Only allow updating these fields
  const allowed: Partial<{
    question: string;
    answer: string;
    illustration: string | null;
    easinessFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
  }> = {};

  if (body.question !== undefined) allowed.question = body.question;
  if (body.answer !== undefined) allowed.answer = body.answer;
  if (body.illustration !== undefined) allowed.illustration = body.illustration;
  if (body.easinessFactor !== undefined) allowed.easinessFactor = body.easinessFactor;
  if (body.interval !== undefined) allowed.interval = body.interval;
  if (body.repetitions !== undefined) allowed.repetitions = body.repetitions;
  if (body.nextReviewDate !== undefined) allowed.nextReviewDate = body.nextReviewDate;

  const [updated] = await db
    .update(cards)
    .set(allowed)
    .where(eq(cards.id, id))
    .returning();

  return Response.json(updated);
}

// DELETE /api/cards/[id]
export async function DELETE(request: NextRequest, { params }: Context) {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const owned = await getOwnedCard(id, user.id);
  if (!owned) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(cards).where(eq(cards.id, id));

  return Response.json({ ok: true });
}
