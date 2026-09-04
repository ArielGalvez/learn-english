"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizDeck } from "@/components/quiz-deck";
import { useProgress } from "@/hooks/use-progress";
import { VERBS, shuffle } from "@/lib/verbs";

export default function QuizPage() {
  const router = useRouter();
  const { ready, known, onlyUnlearned } = useProgress();

  const verbs = useMemo(() => {
    if (!ready) return [];
    const source = onlyUnlearned
      ? VERBS.filter((v) => !known.includes(v.base))
      : VERBS;
    if (source.length === 0) return [];
    return shuffle(source).slice(0, 10);
  }, [ready, known, onlyUnlearned]);

  if (!ready) {
    return <div className="p-10 text-center text-muted-foreground">Cargando…</div>;
  }

  if (verbs.length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-5xl">🏆</span>
        <p className="text-lg font-semibold text-card-foreground">
          No hay verbos por evaluar
        </p>
        <p className="text-sm text-muted-foreground">
          {onlyUnlearned
            ? "Filtro activo y ya dominaste todos. ¡Genial!"
            : "No hay verbos disponibles."}
        </p>
        <Link
          href="/"
          className="mt-2 rounded-2xl bg-accent px-6 py-3 font-semibold text-accent-foreground"
        >
          ← Ir al inicio
        </Link>
      </div>
    );
  }

  return (
    <QuizDeck
      verbs={verbs}
      onFinish={(score, total) => {
        router.replace(`/quiz/summary?score=${score}&total=${total}`);
      }}
    />
  );
}