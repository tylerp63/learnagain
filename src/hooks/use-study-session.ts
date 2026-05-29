"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { type Card, type RecallQuality } from "@/types";
import { sm2 } from "@/lib/sm2";
import * as api from "@/lib/api";

interface SessionStats {
  total: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
}

const MAX_RETRIES = 3;

export function useStudySession() {
  const [queue, setQueue] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<SessionStats>({
    total: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  useEffect(() => {
    api.getCardsDueToday().then((due) => {
      setQueue(shuffle(due));
      setLoading(false);
    });
  }, []);

  const currentCard = useMemo(
    () => (currentIndex < queue.length ? queue[currentIndex] : null),
    [queue, currentIndex]
  );

  const isComplete = !loading && currentIndex >= queue.length;
  const remainingCount = Math.max(0, queue.length - currentIndex);
  const completedCount = currentIndex;

  const rateCard = useCallback(
    async (quality: RecallQuality) => {
      if (!currentCard) return;

      const result = sm2(currentCard, quality);
      await api.updateCard(currentCard.id, result);

      const statKey =
        quality === 0
          ? "again"
          : quality <= 2
            ? "hard"
            : quality <= 4
              ? "good"
              : "easy";
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        [statKey]: prev[statKey] + 1,
      }));

      if (quality < 3) {
        const cardRetries = retryCount[currentCard.id] ?? 0;
        if (cardRetries < MAX_RETRIES) {
          setRetryCount((prev) => ({
            ...prev,
            [currentCard.id]: cardRetries + 1,
          }));
          setQueue((prev) => [...prev, { ...currentCard, ...result }]);
        }
      }

      setCurrentIndex((prev) => prev + 1);
    },
    [currentCard, retryCount]
  );

  return {
    currentCard,
    remainingCount,
    completedCount,
    isComplete,
    sessionStats: stats,
    rateCard,
    totalCards: queue.length,
    loading,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
