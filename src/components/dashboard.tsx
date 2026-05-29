"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type Deck, type Card } from "@/types";
import * as storage from "@/lib/storage";
import DeckCard from "@/components/deck-card";
import EmptyState from "@/components/empty-state";

export default function Dashboard() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDecks(storage.getDecks());
    setCards(storage.getCards());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const dueCards = cards.filter(
    (c) => c.nextReviewDate <= new Date().toISOString().split("T")[0]
  );

  function handleRename(id: string, newName: string) {
    const deck = decks.find((d) => d.id === id);
    if (deck) {
      storage.saveDeck({ ...deck, name: newName });
      setDecks(storage.getDecks());
    }
  }

  function handleDelete(id: string) {
    storage.deleteDeck(id);
    setDecks(storage.getDecks());
    setCards(storage.getCards());
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
            {dueCards.length > 0
              ? `${dueCards.length} card${dueCards.length === 1 ? "" : "s"} due for review`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex gap-3">
          {dueCards.length > 0 && (
            <Link
              href="/study"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Start Study ({dueCards.length})
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
        {decks.map((deck) => {
          const deckCards = cards.filter((c) => c.deckId === deck.id);
          const deckDue = deckCards.filter(
            (c) => c.nextReviewDate <= new Date().toISOString().split("T")[0]
          );
          return (
            <DeckCard
              key={deck.id}
              id={deck.id}
              name={deck.name}
              sourceFileName={deck.sourceFileName}
              totalCards={deckCards.length}
              dueCards={deckDue.length}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          );
        })}
      </div>
    </div>
  );
}
