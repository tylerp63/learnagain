"use client";

import { useEffect } from "react";
import {
  type Card,
  type RecallQuality,
  RECALL_BUTTON_MAP,
} from "@/types";
import { sm2 } from "@/lib/sm2";

interface RecallButtonsProps {
  card: Card;
  onRate: (quality: RecallQuality) => void;
}

const buttons = [
  { key: "again" as const, label: "Again", color: "bg-danger", hotkey: "1" },
  { key: "hard" as const, label: "Hard", color: "bg-warning", hotkey: "2" },
  { key: "good" as const, label: "Good", color: "bg-success", hotkey: "3" },
  {
    key: "easy" as const,
    label: "Easy",
    color: "bg-primary",
    hotkey: "4",
  },
];

function formatInterval(days: number): string {
  if (days === 1) return "1d";
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

export default function RecallButtons({ card, onRate }: RecallButtonsProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const btn = buttons.find((b) => b.hotkey === e.key);
      if (btn) {
        e.preventDefault();
        onRate(RECALL_BUTTON_MAP[btn.key]);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onRate]);

  return (
    <div className="flex gap-3">
      {buttons.map((btn) => {
        const preview = sm2(card, RECALL_BUTTON_MAP[btn.key]);
        return (
          <button
            key={btn.key}
            onClick={() => onRate(RECALL_BUTTON_MAP[btn.key])}
            className={`flex flex-col items-center rounded-lg ${btn.color} px-5 py-2.5 text-white transition-opacity hover:opacity-90`}
          >
            <span className="text-sm font-medium">{btn.label}</span>
            <span className="text-xs opacity-80">
              {formatInterval(preview.interval)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
