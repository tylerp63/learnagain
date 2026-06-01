"use client";

import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { type Card } from "@/types";
import * as api from "@/lib/api";

interface CardCreatorFormProps {
  deckId: string;
  onCardCreated: (card: Card) => void;
  prefillAnswer?: string;
}

export default function CardCreatorForm({
  deckId,
  onCardCreated,
  prefillAnswer,
}: CardCreatorFormProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefillAnswer) setAnswer(prefillAnswer);
  }, [prefillAnswer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || saving) return;

    setSaving(true);
    const today = new Date().toISOString().split("T")[0];

    try {
      const [saved] = await api.saveCard(deckId, {
        id: uuid(),
        question: question.trim(),
        answer: answer.trim(),
        nextReviewDate: today,
      });
      onCardCreated(saved);
      setQuestion("");
      setAnswer("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          Question
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you want to remember?"
          rows={3}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">
          Answer
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="The answer..."
          rows={3}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={!question.trim() || !answer.trim() || saving}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {saving ? "Adding..." : "Add Card"}
      </button>
    </form>
  );
}
