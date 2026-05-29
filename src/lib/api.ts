import { type Deck, type Card } from "@/types";

interface DeckWithCounts extends Deck {
  totalCards: number;
  dueCards: number;
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getDecks(): Promise<DeckWithCounts[]> {
  return fetchJSON("/api/decks");
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  try {
    return await fetchJSON(`/api/decks/${id}`);
  } catch {
    return undefined;
  }
}

export async function saveDeck(deck: Deck): Promise<void> {
  await fetchJSON("/api/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deck),
  });
}

export async function updateDeck(
  id: string,
  updates: { name: string }
): Promise<void> {
  await fetchJSON(`/api/decks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export async function deleteDeck(id: string): Promise<void> {
  await fetchJSON(`/api/decks/${id}`, { method: "DELETE" });
}

export async function getCardsByDeck(deckId: string): Promise<Card[]> {
  return fetchJSON(`/api/cards?deckId=${deckId}`);
}

export async function getCardsDueToday(): Promise<Card[]> {
  return fetchJSON("/api/cards/due");
}

export async function saveCard(card: Card): Promise<void> {
  await fetchJSON("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });
}

export async function saveCards(cards: Card[]): Promise<void> {
  await fetchJSON("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cards),
  });
}

export async function updateCard(
  id: string,
  updates: Partial<Card>
): Promise<void> {
  await fetchJSON(`/api/cards/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export async function deleteCard(id: string): Promise<void> {
  await fetchJSON(`/api/cards/${id}`, { method: "DELETE" });
}
