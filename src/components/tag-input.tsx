"use client";

import { useState, useRef, useEffect } from "react";
import { type Tag } from "@/types";

interface TagInputProps {
  selectedTags: Tag[];
  allTags: Tag[];
  onAdd: (tag: Tag) => void;
  onCreate: (name: string) => Promise<Tag>;
  onRemove: (tagId: string) => void;
}

export default function TagInput({
  selectedTags,
  allTags,
  onAdd,
  onCreate,
  onRemove,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selectedTags.map((t) => t.id));

  const filtered = allTags.filter(
    (t) =>
      !selectedIds.has(t.id) &&
      t.name.toLowerCase().includes(input.toLowerCase())
  );

  const exactMatch = allTags.some(
    (t) => t.name.toLowerCase() === input.trim().toLowerCase()
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();

      // If typed name matches an existing unselected tag, add it
      const match = allTags.find(
        (t) =>
          t.name.toLowerCase() === input.trim().toLowerCase() &&
          !selectedIds.has(t.id)
      );

      if (match) {
        onAdd(match);
      } else if (!exactMatch) {
        // Create new tag
        setCreating(true);
        const tag = await onCreate(input.trim());
        onAdd(tag);
        setCreating(false);
      }
      setInput("");
      setShowDropdown(false);
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => onRemove(tag.id)}
              className="text-primary/60 hover:text-primary"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? "Add subject tag..." : ""}
          disabled={creating}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      {showDropdown && (input.length > 0 || filtered.length > 0) && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                onAdd(tag);
                setInput("");
                setShowDropdown(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-primary/5"
            >
              {tag.name}
            </button>
          ))}
          {input.trim() && !exactMatch && (
            <button
              type="button"
              onClick={async () => {
                setCreating(true);
                const tag = await onCreate(input.trim());
                onAdd(tag);
                setCreating(false);
                setInput("");
                setShowDropdown(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-primary hover:bg-primary/5"
            >
              Create &ldquo;{input.trim()}&rdquo;
            </button>
          )}
          {filtered.length === 0 && (exactMatch || !input.trim()) && (
            <div className="px-3 py-2 text-sm text-muted">No tags found</div>
          )}
        </div>
      )}
    </div>
  );
}
