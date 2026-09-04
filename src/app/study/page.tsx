"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { StudyDeck } from "@/components/study-deck";
import { useProgress } from "@/hooks/use-progress";
import { VERBS, shuffle } from "@/lib/verbs";

export default function StudyPage() {
  const { ready, known, onlyUnlearned, markKnown } = useProgress();
  const router = useRouter();

  const verbs = useMemo(() => {
    if (!ready) return [];
    const filtered = onlyUnlearned
      ? VERBS.filter((v) => !known.includes(v.base))
      : [...VERBS];
    return shuffle(filtered);
  }, [ready, known, onlyUnlearned]);

  if (!ready) return <div className="p-10 text-center text-muted-foreground">Cargando…</div>;

  if (verbs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-6xl"
        >
          🏆
        </motion.span>
        <p className="text-lg font-semibold text-card-foreground">
          ¡Dominaste todos los verbos!
        </p>
        <p className="text-sm text-muted-foreground">
          {onlyUnlearned
            ? "Ya no quedan verbos por aprender. ¡Buen trabajo!"
            : "Las tarjetas están listas. ¡Empieza!"}
        </p>
        <button
          onClick={() =>
            onlyUnlearned ? router.push("/quiz") : router.push("/")
          }
          className="mt-2 rounded-2xl bg-accent px-6 py-3 font-semibold text-accent-foreground"
        >
          {onlyUnlearned ? "✏️ Evaluarme" : "← Volver"}
        </button>
      </motion.div>
    );
  }

  return (
    <StudyDeck
      verbs={verbs}
      onMarkKnown={(verb) => {
        markKnown(verb.base);
      }}
    />
  );
}