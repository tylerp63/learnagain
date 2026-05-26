"use client";

import { useState, useCallback } from "react";
import { type Deck } from "@/types";
import * as storage from "@/lib/storage";

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>(() => storage.getDecks());

  const refresh = useCallback(() => {
    setDecks(storage.getDecks());
  }, []);

  const createDeck = useCallback(
    (deck: Deck) => {
      storage.saveDeck(deck);
      refresh();
    },
    [refresh]
  );

  const updateDeck = useCallback(
    (deck: Deck) => {
      storage.saveDeck(deck);
      refresh();
    },
    [refresh]
  );

  const removeDeck = useCallback(
    (id: string) => {
      storage.deleteDeck(id);
      refresh();
    },
    [refresh]
  );

  return { decks, createDeck, updateDeck, removeDeck, refresh };
}
