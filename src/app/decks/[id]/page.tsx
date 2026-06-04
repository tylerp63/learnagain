"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { type Deck, type Card, type Tag } from "@/types";
import * as api from "@/lib/api";
import TagInput from "@/components/tag-input";

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [deckTags, setDeckTags] = useState<Tag[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [d, c, decksWithTags, userTags] = await Promise.all([
          api.getDeck(deckId),
          api.getCardsByDeck(deckId),
          api.getDecks(),
          api.getTags(),
        ]);
        setDeck(d);
        setNameValue(d.name);
        setCards(c);
        setAllTags(userTags);
        // Find this deck's tags from the decks list
        const thisDeck = decksWithTags.find((dk) => dk.id === deckId);
        if (thisDeck) setDeckTags(thisDeck.tags);
      } catch {
        // deck not found
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [deckId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 text-center">
        <p className="text-muted">Deck not found.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const dueCount = cards.filter((c) => c.nextReviewDate <= today).length;

  async function saveName() {
    if (deck && nameValue.trim() && nameValue !== deck.name) {
      const updated = await api.renameDeck(deck.id, nameValue.trim());
      setDeck(updated);
    }
    setEditingName(false);
  }

  async function handleAddTag(tag: Tag) {
    const next = [...deckTags, tag];
    setDeckTags(next);
    await api.setDeckTags(deckId, next.map((t) => t.id));
  }

  async function handleRemoveTag(tagId: string) {
    const next = deckTags.filter((t) => t.id !== tagId);
    setDeckTags(next);
    await api.setDeckTags(deckId, next.map((t) => t.id));
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const [saved] = await api.saveCard(deckId, {
      id: uuid(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      nextReviewDate: today,
    });
    setCards((prev) => [...prev, saved]);
    setNewQuestion("");
    setNewAnswer("");
    setShowAddForm(false);
  }

  async function handleDeleteCard(cardId: string) {
    await api.deleteCard(cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }

  function startEdit(card: Card) {
    setEditingCard(card.id);
    setEditQ(card.question);
    setEditA(card.answer);
  }

  async function saveEdit(cardId: string) {
    if (editQ.trim() && editA.trim()) {
      const updated = await api.updateCard(cardId, {
        question: editQ.trim(),
        answer: editA.trim(),
      });
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? updated : c))
      );
    }
    setEditingCard(null);
  }

  async function handleDeleteDeck() {
    if (confirm("Delete this deck and all its cards?")) {
      await api.deleteDeck(deckId);
      router.push("/");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            {editingName ? (
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus
                className="rounded border border-border bg-card px-2 py-1 text-2xl font-bold focus:border-primary focus:outline-none"
              />
            ) : (
              <h1
                onClick={() => setEditingName(true)}
                className="cursor-pointer text-2xl font-bold hover:text-primary"
              >
                {deck.name}
              </h1>
            )}
            <p className="mt-1 text-sm text-muted">
              {deck.sourceFileName} &middot; {cards.length} card
              {cards.length !== 1 ? "s" : ""}
              {dueCount > 0 && (
                <span className="ml-2 font-medium text-primary">
                  {dueCount} due
                </span>
            )}
          </p>
        </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Add Card
            </button>
            <button
              onClick={handleDeleteDeck}
              className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              Delete Deck
            </button>
          </div>
        </div>

        <div className="max-w-md">
          <label className="mb-1 block text-xs font-medium text-muted">
            Subject Tags
          </label>
          <TagInput
            selectedTags={deckTags}
            allTags={allTags}
            onAdd={handleAddTag}
            onCreate={async (name) => {
              const tag = await api.createTag(name);
              setAllTags((prev) =>
                [...prev, tag].sort((a, b) => a.name.localeCompare(b.name))
              );
              return tag;
            }}
            onRemove={handleRemoveTag}
          />
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddCard}
          className="mb-6 rounded-xl border border-border bg-card p-4"
        >
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted">
              Question
            </label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted">
              Answer
            </label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!newQuestion.trim() || !newAnswer.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-background"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {cards.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No cards yet. Add one above.
        </p>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              {editingCard === card.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editQ}
                    onChange={(e) => setEditQ(e.target.value)}
                    rows={2}
                    className="rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
                  />
                  <textarea
                    value={editA}
                    onChange={(e) => setEditA(e.target.value)}
                    rows={2}
                    className="rounded border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(card.id)}
                      className="rounded bg-primary px-3 py-1 text-xs font-medium text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCard(null)}
                      className="rounded border border-border px-3 py-1 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{card.question}</p>
                    <p className="mt-1 text-sm text-muted">{card.answer}</p>
                    <p className="mt-2 text-xs text-muted">
                      Next review: {card.nextReviewDate} &middot; EF:{" "}
                      {card.easinessFactor} &middot; Interval: {card.interval}d
                    </p>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => startEdit(card)}
                      className="text-xs text-muted hover:text-foreground"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-xs text-muted hover:text-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
