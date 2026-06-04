"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { type DeckWithCounts, type Tag } from "@/types";
import * as api from "@/lib/api";
import DeckCard from "@/components/deck-card";
import EmptyState from "@/components/empty-state";

export default function Dashboard() {
  const [decks, setDecks] = useState<DeckWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    api.getDecks().then((d) => {
      setDecks(d);
      setLoading(false);
    });
  }, []);

  // Collect unique tags across all decks
  const allTags = useMemo(() => {
    const map = new Map<string, Tag>();
    for (const deck of decks) {
      for (const tag of deck.tags) {
        map.set(tag.id, tag);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [decks]);

  const filteredDecks = activeTag
    ? decks.filter((d) => d.tags.some((t) => t.id === activeTag))
    : decks;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  const totalDue = decks.reduce((sum, d) => sum + d.dueCards, 0);

  async function handleRename(id: string, newName: string) {
    await api.renameDeck(id, newName);
    setDecks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name: newName } : d))
    );
  }

  async function handleDelete(id: string) {
    await api.deleteDeck(id);
    setDecks((prev) => prev.filter((d) => d.id !== id));
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

      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeTag === null
                ? "bg-primary text-white"
                : "bg-card text-muted hover:text-foreground border border-border"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() =>
                setActiveTag(activeTag === tag.id ? null : tag.id)
              }
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeTag === tag.id
                  ? "bg-primary text-white"
                  : "bg-card text-muted hover:text-foreground border border-border"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDecks.map((deck) => (
          <DeckCard
            key={deck.id}
            id={deck.id}
            name={deck.name}
            sourceFileName={deck.sourceFileName}
            totalCards={deck.totalCards}
            dueCards={deck.dueCards}
            tags={deck.tags}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
