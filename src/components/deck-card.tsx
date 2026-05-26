import Link from "next/link";

interface DeckCardProps {
  id: string;
  name: string;
  sourceFileName: string;
  totalCards: number;
  dueCards: number;
}

export default function DeckCard({
  id,
  name,
  sourceFileName,
  totalCards,
  dueCards,
}: DeckCardProps) {
  return (
    <Link
      href={`/decks/${id}`}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <h3 className="font-semibold">{name}</h3>
      <p className="truncate text-xs text-muted">{sourceFileName}</p>
      <div className="flex gap-4 text-sm">
        <span className="text-muted">{totalCards} cards</span>
        {dueCards > 0 && (
          <span className="font-medium text-primary">{dueCards} due</span>
        )}
      </div>
    </Link>
  );
}
