import { NextRequest } from "next/server";
import { db } from "@/db";
import { decks, deckTags } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth/require-user";

type Context = { params: Promise<{ id: string }> };

// PUT /api/decks/[id]/tags — replace all tags for a deck
export async function PUT(request: NextRequest, { params }: Context) {
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

  const { tagIds }: { tagIds: string[] } = await request.json();

  // Delete existing deck-tag associations
  await db.delete(deckTags).where(eq(deckTags.deckId, deckId));

  // Insert new associations
  if (tagIds && tagIds.length > 0) {
    await db.insert(deckTags).values(
      tagIds.map((tagId) => ({ deckId, tagId }))
    );
  }

  return Response.json({ ok: true });
}
