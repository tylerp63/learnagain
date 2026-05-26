"use client";

import { useState, useEffect } from "react";
import { type Card, type RecallQuality } from "@/types";
import RecallButtons from "./recall-buttons";

interface FlashcardProps {
  card: Card;
  onRate: (quality: RecallQuality) => void;
}

export default function Flashcard({ card, onRate }: FlashcardProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [card.id]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code === "Space" && !revealed) {
        e.preventDefault();
        setRevealed(true);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [revealed]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 shadow-sm">
        {!revealed ? (
          <div className="flex flex-col items-center gap-6">
            <p className="text-center text-lg font-medium">{card.question}</p>
            <button
              onClick={() => setRevealed(true)}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Show Answer
            </button>
            <p className="text-xs text-muted">or press Space</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-1 text-xs font-medium text-muted">Question</p>
              <p className="text-sm">{card.question}</p>
            </div>
            <hr className="border-border" />
            <div>
              <p className="mb-1 text-xs font-medium text-muted">Answer</p>
              <p className="text-lg">{card.answer}</p>
            </div>
          </div>
        )}
      </div>

      {revealed && <RecallButtons card={card} onRate={onRate} />}
    </div>
  );
}
