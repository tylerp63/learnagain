import { NextRequest } from "next/server";
import { db } from "@/db";
import { decks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth/require-user";

type Context = { params: Promise<{ id: string }> };

// GET /api/decks/[id]
export async function GET(request: NextRequest, { params }: Context) {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, id), eq(decks.userId, user.id)));

  if (!deck) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(deck);
}

// PATCH /api/decks/[id] — rename deck
export async function PATCH(request: NextRequest, { params }: Context) {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(decks)
    .set({ name: body.name })
    .where(and(eq(decks.id, id), eq(decks.userId, user.id)))
    .returning();

  if (!updated) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(updated);
}

// DELETE /api/decks/[id]
export async function DELETE(request: NextRequest, { params }: Context) {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(decks)
    .where(and(eq(decks.id, id), eq(decks.userId, user.id)))
    .returning();

  if (!deleted) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
