"use client";

import { useCallback, useEffect, useState } from "react";
import { TOTAL_VERBS } from "@/lib/verbs";

type Results = Record<string, "correct" | "wrong">;

const KNOWN_KEY = "known";
const RESULTS_KEY = "results";
const ONLY_UNLEARNED_KEY = "only-unlearned";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function useProgress() {
  const [known, setKnown] = useState<string[]>([]);
  const [results, setResults] = useState<Results>({});
  const [onlyUnlearned, setOnlyUnlearned] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setKnown(read<string[]>(KNOWN_KEY, []));
    setResults(read<Results>(RESULTS_KEY, {}));
    setOnlyUnlearned(read<boolean>(ONLY_UNLEARNED_KEY, false));
    setReady(true);
  }, []);

  const markKnown = useCallback((base: string) => {
    setKnown((prev) => {
      if (prev.includes(base)) return prev;
      const next = [...prev, base];
      write(KNOWN_KEY, next);
      return next;
    });
  }, []);

  const unmarkKnown = useCallback((base: string) => {
    setKnown((prev) => {
      const next = prev.filter((v) => v !== base);
      write(KNOWN_KEY, next);
      return next;
    });
  }, []);

  const recordResult = useCallback((base: string, result: "correct" | "wrong") => {
    setResults((prev) => {
      const next = { ...prev, [base]: result };
      write(RESULTS_KEY, next);
      return next;
    });
  }, []);

  const toggleOnlyUnlearned = useCallback(() => {
    setOnlyUnlearned((prev) => {
      write(ONLY_UNLEARNED_KEY, !prev);
      return !prev;
    });
  }, []);

  const correctCount = Object.values(results).filter((r) => r === "correct").length;

  return {
    ready,
    known,
    results,
    correctCount,
    knownCount: known.length,
    totalCount: TOTAL_VERBS,
    onlyUnlearned,
    markKnown,
    unmarkKnown,
    recordResult,
    toggleOnlyUnlearned,
  };
}