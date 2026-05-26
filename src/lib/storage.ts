import { type Deck, type Card } from "@/types";

const DECKS_KEY = "learnagain_decks";
const CARDS_KEY = "learnagain_cards";

function readJSON<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function writeJSON<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getDecks(): Deck[] {
  return readJSON<Deck>(DECKS_KEY);
}

export function getDeck(id: string): Deck | undefined {
  return getDecks().find((d) => d.id === id);
}

export function saveDeck(deck: Deck): void {
  const decks = getDecks();
  const idx = decks.findIndex((d) => d.id === deck.id);
  if (idx >= 0) {
    decks[idx] = deck;
  } else {
    decks.push(deck);
  }
  writeJSON(DECKS_KEY, decks);
}

export function deleteDeck(id: string): void {
  writeJSON(
    DECKS_KEY,
    getDecks().filter((d) => d.id !== id)
  );
  writeJSON(
    CARDS_KEY,
    getCards().filter((c) => c.deckId !== id)
  );
}

export function getCards(): Card[] {
  return readJSON<Card>(CARDS_KEY);
}

export function getCardsByDeck(deckId: string): Card[] {
  return getCards().filter((c) => c.deckId === deckId);
}

export function getCardsDueToday(today?: Date): Card[] {
  const t = today ?? new Date();
  const todayStr = t.toISOString().split("T")[0];
  return getCards().filter((c) => c.nextReviewDate <= todayStr);
}

export function saveCard(card: Card): void {
  const cards = getCards();
  const idx = cards.findIndex((c) => c.id === card.id);
  if (idx >= 0) {
    cards[idx] = card;
  } else {
    cards.push(card);
  }
  writeJSON(CARDS_KEY, cards);
}

export function saveCards(newCards: Card[]): void {
  const cards = getCards();
  for (const card of newCards) {
    const idx = cards.findIndex((c) => c.id === card.id);
    if (idx >= 0) {
      cards[idx] = card;
    } else {
      cards.push(card);
    }
  }
  writeJSON(CARDS_KEY, cards);
}

export function updateCard(id: string, updates: Partial<Card>): void {
  const cards = getCards();
  const idx = cards.findIndex((c) => c.id === id);
  if (idx >= 0) {
    cards[idx] = { ...cards[idx], ...updates };
    writeJSON(CARDS_KEY, cards);
  }
}

export function deleteCard(id: string): void {
  writeJSON(
    CARDS_KEY,
    getCards().filter((c) => c.id !== id)
  );
}
