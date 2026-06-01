import { type Deck, type Card, type DeckWithCounts } from "@/types";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// ---- Decks ----

export async function getDecks(): Promise<DeckWithCounts[]> {
  return fetchJSON("/api/decks");
}

export async function getDeck(id: string): Promise<Deck> {
  return fetchJSON(`/api/decks/${id}`);
}

export async function createDeck(deck: {
  id: string;
  name: string;
  sourceFileName: string;
}): Promise<Deck> {
  return fetchJSON("/api/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deck),
  });
}

export async function renameDeck(id: string, name: string): Promise<Deck> {
  return fetchJSON(`/api/decks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function deleteDeck(id: string): Promise<void> {
  await fetchJSON(`/api/decks/${id}`, { method: "DELETE" });
}

// ---- Cards ----

export async function getCardsByDeck(deckId: string): Promise<Card[]> {
  return fetchJSON(`/api/decks/${deckId}/cards`);
}

export async function getCardsDueToday(): Promise<Card[]> {
  return fetchJSON("/api/cards/due");
}

export async function saveCards(
  deckId: string,
  cards: Array<{
    id: string;
    question: string;
    answer: string;
    nextReviewDate: string;
    easinessFactor?: number;
    interval?: number;
    repetitions?: number;
  }>
): Promise<Card[]> {
  return fetchJSON(`/api/decks/${deckId}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cards }),
  });
}

export async function saveCard(
  deckId: string,
  card: {
    id: string;
    question: string;
    answer: string;
    nextReviewDate: string;
  }
): Promise<Card[]> {
  return saveCards(deckId, [card]);
}

export async function updateCard(
  id: string,
  updates: Partial<Card>
): Promise<Card> {
  return fetchJSON(`/api/cards/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export async function deleteCard(id: string): Promise<void> {
  await fetchJSON(`/api/cards/${id}`, { method: "DELETE" });
}
