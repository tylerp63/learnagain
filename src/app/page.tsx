"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import DeckCard from "@/components/deck-card";
import EmptyState from "@/components/empty-state";

interface DeckRow {
  id: string;
  name: string;
  sourceFileName: string;
  createdAt: string;
  totalCards: number;
  dueCards: number;
}

export default function Dashboard() {
  const [decks, setDecks] = useState<DeckRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDecks().then((d) => {
      setDecks(d);
      setLoading(false);
    });
  }, []);

  const totalDue = decks.reduce((sum, d) => sum + d.dueCards, 0);

  async function handleRename(id: string, newName: string) {
    await api.updateDeck(id, { name: newName });
    setDecks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name: newName } : d))
    );
  }

  async function handleDelete(id: string) {
    await api.deleteDeck(id);
    setDecks((prev) => prev.filter((d) => d.id !== id));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <EmptyState
          title="No decks yet"
          description="Upload a PDF or DOCX document to create your first deck of flashcards."
          actionLabel="Upload a document"
          actionHref="/upload"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            {totalDue > 0
              ? `${totalDue} card${totalDue === 1 ? "" : "s"} due for review`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex gap-3">
          {totalDue > 0 && (
            <Link
              href="/study"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Start Study ({totalDue})
            </Link>
          )}
          <Link
            href="/upload"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-card"
          >
            Upload
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            id={deck.id}
            name={deck.name}
            sourceFileName={deck.sourceFileName}
            totalCards={deck.totalCards}
            dueCards={deck.dueCards}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
