"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { type Card, type Deck } from "@/types";
import * as api from "@/lib/api";
import { useFileParser } from "@/hooks/use-file-parser";
import DropZone from "@/components/drop-zone";
import TextViewer from "@/components/text-viewer";
import CardCreatorForm from "@/components/card-creator-form";

export default function UploadPage() {
  const router = useRouter();
  const { text, isLoading, error, parseFile, reset } = useFileParser();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [deckName, setDeckName] = useState("");
  const [createdCards, setCreatedCards] = useState<Card[]>([]);
  const [selectedText, setSelectedText] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    const name = file.name.replace(/\.[^.]+$/, "");
    const newDeck: Deck = {
      id: uuid(),
      name,
      createdAt: new Date().toISOString(),
      sourceFileName: file.name,
    };
    setDeck(newDeck);
    setDeckName(name);
    await api.createDeck({
      id: newDeck.id,
      name: newDeck.name,
      sourceFileName: newDeck.sourceFileName,
    });
    await parseFile(file);
  }

  async function handleDeckNameBlur() {
    if (deck && deckName.trim() && deckName !== deck.name) {
      const updated = { ...deck, name: deckName.trim() };
      setDeck(updated);
      await api.renameDeck(deck.id, deckName.trim());
    }
  }

  function handleCardCreated(card: Card) {
    setCreatedCards((prev) => [...prev, card]);
    setSelectedText("");
  }

  async function handleDeleteCard(cardId: string) {
    await api.deleteCard(cardId);
    setCreatedCards((prev) => prev.filter((c) => c.id !== cardId));
  }

  async function handleGenerate() {
    if (!text || !deck) return;
    setGenerating(true);
    setGenError(null);

    try {
      const res = await fetch("/api/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error (${res.status})`);
      }

      const { cards: generated } = await res.json();
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();

      const newCards = generated.map(
        (g: { question: string; answer: string }) => ({
          id: uuid(),
          deckId: deck.id,
          question: g.question,
          answer: g.answer,
          easinessFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: today,
          createdAt: now,
        })
      );

      const saved = await api.saveCards(deck.id, newCards);
      setCreatedCards((prev) => [...prev, ...saved]);
    } catch (err) {
      setGenError(
        err instanceof Error ? err.message : "Failed to generate cards"
      );
    } finally {
      setGenerating(false);
    }
  }

  function handleFinish() {
    if (deck) {
      router.push(`/decks/${deck.id}`);
    }
  }

  function handleReset() {
    reset();
    setDeck(null);
    setDeckName("");
    setCreatedCards([]);
    setSelectedText("");
    setGenError(null);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Upload Document</h1>

      {!text && !isLoading && !error && (
        <DropZone onFileSelected={handleFileSelected} />
      )}

      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted">
            Extracting text from {deck?.sourceFileName}...
          </p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={handleReset}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-card"
          >
            Try another file
          </button>
        </div>
      )}

      {text && deck && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <input
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              onBlur={handleDeckNameBlur}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-lg font-semibold focus:border-primary focus:outline-none"
            />
            <span className="text-sm text-muted">{deck.sourceFileName}</span>
            <button
              onClick={handleReset}
              className="ml-auto text-sm text-muted hover:text-foreground"
            >
              Upload different file
            </button>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  AI Flashcard Generation
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Automatically generate study cards from the extracted
                  text
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                {generating && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {generating ? "Generating..." : "Generate Cards"}
              </button>
            </div>
            {genError && (
              <p className="mt-3 text-sm text-danger">{genError}</p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TextViewer text={text} onTextSelected={setSelectedText} />

            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold">
                Add Cards Manually
              </h2>
              <CardCreatorForm
                deckId={deck.id}
                onCardCreated={handleCardCreated}
                prefillAnswer={selectedText}
              />
            </div>
          </div>

          {createdCards.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Cards ({createdCards.length})
                </h3>
                <button
                  onClick={handleFinish}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Finish — View Deck
                </button>
              </div>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {createdCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-start justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{card.question}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {card.answer}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="ml-3 shrink-0 text-xs text-muted hover:text-danger"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
