export interface Deck {
  id: string;
  name: string;
  createdAt: string;
  sourceFileName: string;
}

export interface Card {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  createdAt: string;
}

export type RecallQuality = 0 | 1 | 2 | 3 | 4 | 5;

export const RECALL_BUTTON_MAP = {
  again: 0,
  hard: 2,
  good: 4,
  easy: 5,
} as const;

export type RecallButton = keyof typeof RECALL_BUTTON_MAP;

export interface DeckWithCounts {
  id: string;
  name: string;
  sourceFileName: string;
  createdAt: string;
  totalCards: number;
  dueCards: number;
}
