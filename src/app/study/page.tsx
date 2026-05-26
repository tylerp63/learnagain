"use client";

import Link from "next/link";
import { useStudySession } from "@/hooks/use-study-session";
import Flashcard from "@/components/flashcard";

export default function StudyPage() {
  const {
    currentCard,
    remainingCount,
    completedCount,
    isComplete,
    sessionStats,
    rateCard,
    totalCards,
  } = useStudySession();

  if (totalCards === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <svg
            className="h-16 w-16 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <h1 className="text-2xl font-bold">All caught up!</h1>
          <p className="text-sm text-muted">No cards due for review today.</p>
          <Link
            href="/"
            className="mt-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <svg
            className="h-16 w-16 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
          <h1 className="text-2xl font-bold">Session Complete!</h1>
          <p className="text-sm text-muted">
            You reviewed {sessionStats.total} card
            {sessionStats.total !== 1 ? "s" : ""}
          </p>

          <div className="flex gap-6 text-sm">
            {sessionStats.again > 0 && (
              <span className="text-danger">
                Again: {sessionStats.again}
              </span>
            )}
            {sessionStats.hard > 0 && (
              <span className="text-warning">
                Hard: {sessionStats.hard}
              </span>
            )}
            {sessionStats.good > 0 && (
              <span className="text-success">
                Good: {sessionStats.good}
              </span>
            )}
            {sessionStats.easy > 0 && (
              <span className="text-primary">
                Easy: {sessionStats.easy}
              </span>
            )}
          </div>

          <Link
            href="/"
            className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          &larr; Dashboard
        </Link>
        <span className="text-sm text-muted">
          Card {completedCount + 1} of {totalCards}
        </span>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${(completedCount / totalCards) * 100}%`,
          }}
        />
      </div>

      {currentCard && <Flashcard card={currentCard} onRate={rateCard} />}
    </div>
  );
}
