"use client";

interface TextViewerProps {
  text: string;
  onTextSelected?: (text: string) => void;
}

export default function TextViewer({ text, onTextSelected }: TextViewerProps) {
  function handleMouseUp() {
    if (!onTextSelected) return;
    const selection = window.getSelection()?.toString().trim();
    if (selection) {
      onTextSelected(selection);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted">
        Select text to pre-fill the answer field
      </p>
      <div
        onMouseUp={handleMouseUp}
        className="max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap"
      >
        {text}
      </div>
    </div>
  );
}
