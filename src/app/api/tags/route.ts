import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth/require-user";

// GET /api/tags — list all tags for the user
export async function GET() {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(tags)
    .where(eq(tags.userId, user.id))
    .orderBy(tags.name);

  return Response.json(rows);
}

// POST /api/tags — create a tag (upsert: return existing if name matches)
export async function POST(request: NextRequest) {
  const { user } = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Missing tag name" }, { status: 400 });
  }

  const trimmed = name.trim();

  // Check if tag already exists for this user
  const [existing] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.userId, user.id), eq(tags.name, trimmed)));

  if (existing) {
    return Response.json(existing);
  }

  const [created] = await db
    .insert(tags)
    .values({ id: uuid(), userId: user.id, name: trimmed })
    .returning();

  return Response.json(created, { status: 201 });
}
