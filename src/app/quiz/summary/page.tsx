"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useProgress } from "@/hooks/use-progress";

function SummaryInner() {
  const params = useSearchParams();
  const score = Number(params.get("score") ?? 0);
  const total = Number(params.get("total") ?? 1);
  const percent = total ? Math.round((score / total) * 100) : 0;

  const { knownCount, totalCount } = useProgress();

  const status =
    percent >= 80
      ? { icon: "🌟", title: "¡Excelente!" }
      : percent >= 50
        ? { icon: "🙂", title: "Buen intento" }
        : { icon: "💪", title: "Sigue practicando" };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="flex h-28 w-28 items-center justify-center rounded-full bg-muted text-6xl"
      >
        {status.icon}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h1 className="text-2xl font-bold text-card-foreground">{status.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acertaste {score} de {total} preguntas
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full max-w-[280px]"
      >
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Precisión</span>
          <span className="font-medium tabular-nums">{percent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
            className="h-full rounded-full bg-accent"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3"
      >
        <Link
          href="/quiz"
          className="rounded-2xl bg-accent px-8 py-3 font-semibold text-accent-foreground shadow-lg shadow-accent/20"
        >
          ↩ Repetir quiz
        </Link>
        <Link
          href="/"
          className="rounded-2xl border border-border bg-card px-8 py-3 font-semibold text-card-foreground"
        >
          ← Inicio
        </Link>
      </motion.div>

      <p className="text-xs text-muted-foreground">
        Llevas {knownCount}/{totalCount} verbos aprendidos
      </p>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground">Cargando…</div>}>
      <SummaryInner />
    </Suspense>
  );
}