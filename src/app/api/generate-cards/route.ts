import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Missing text field" },
      { status: 400 }
    );
  }

  const truncated = text.slice(0, 12000);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a study assistant. Given the following text content, generate practical flashcards that help a student learn and retain the key concepts.

Rules:
- Generate between 5 and 15 flashcards depending on content density
- Questions should test understanding, not just recall — use "why", "how", "what happens when" style questions where appropriate
- Answers should be concise but complete (1-3 sentences)
- Cover the most important concepts, definitions, relationships, and processes
- Avoid trivial or overly obvious questions

Respond with ONLY a JSON array of objects with "question" and "answer" fields. No markdown, no explanation, just the JSON array.

Text content:
${truncated}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json(
      { error: "Unexpected response format" },
      { status: 500 }
    );
  }

  try {
    const cards = JSON.parse(content.text);
    return NextResponse.json({ cards });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }
}
