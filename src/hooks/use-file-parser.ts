"use client";

import { useState, useCallback } from "react";

export function useFileParser() {
  const [text, setText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setText(null);

    try {
      const { parseFile: parse } = await import("@/lib/parsers");
      const result = await parse(file);
      setText(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse file"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setText(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { text, isLoading, error, parseFile, reset };
}
