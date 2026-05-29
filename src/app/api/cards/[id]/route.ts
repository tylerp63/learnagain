import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cards, decks } from "@/lib/db/schema";
import { getAuthUserId } from "@/lib/auth-guard";

async function verifyCardOwnership(cardId: string, userId: string) {
  const rows = await db
    .select({ cardId: cards.id })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(eq(cards.id, cardId), eq(decks.userId, userId)));
  return rows.length > 0;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!(await verifyCardOwnership(id, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.question !== undefined) updates.question = body.question;
  if (body.answer !== undefined) updates.answer = body.answer;
  if (body.easinessFactor !== undefined)
    updates.easinessFactor = body.easinessFactor;
  if (body.interval !== undefined) updates.interval = body.interval;
  if (body.repetitions !== undefined) updates.repetitions = body.repetitions;
  if (body.nextReviewDate !== undefined)
    updates.nextReviewDate = body.nextReviewDate;

  await db.update(cards).set(updates).where(eq(cards.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!(await verifyCardOwnership(id, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(cards).where(eq(cards.id, id));

  return NextResponse.json({ ok: true });
}
