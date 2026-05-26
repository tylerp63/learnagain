"use client";

import { useState } from "react";
import Link from "next/link";

interface DeckCardProps {
  id: string;
  name: string;
  sourceFileName: string;
  totalCards: number;
  dueCards: number;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export default function DeckCard({
  id,
  name,
  sourceFileName,
  totalCards,
  dueCards,
  onRename,
  onDelete,
}: DeckCardProps) {
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(name);

  function commitRename() {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== name) {
      onRename(id, trimmed);
    } else {
      setNameValue(name);
    }
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      {editing ? (
        <input
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setNameValue(name);
              setEditing(false);
            }
          }}
          autoFocus
          className="rounded border border-border bg-background px-2 py-0.5 font-semibold focus:border-primary focus:outline-none"
        />
      ) : (
        <Link href={`/decks/${id}`} className="font-semibold hover:text-primary">
          {name}
        </Link>
      )}
      <p className="truncate text-xs text-muted">{sourceFileName}</p>
      <div className="flex gap-4 text-sm">
        <span className="text-muted">{totalCards} cards</span>
        {dueCards > 0 && (
          <span className="font-medium text-primary">{dueCards} due</span>
        )}
      </div>
      <div className="flex gap-3 border-t border-border pt-3">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-muted hover:text-foreground"
        >
          Rename
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${name}" and all its cards?`)) {
              onDelete(id);
            }
          }}
          className="text-xs text-muted hover:text-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
