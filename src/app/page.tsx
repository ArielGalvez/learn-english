"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useProgress } from "@/hooks/use-progress";
import { TOTAL_VERBS } from "@/lib/verbs";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const { ready, knownCount, onlyUnlearned, toggleOnlyUnlearned } = useProgress();
  const progress = ready ? (knownCount / TOTAL_VERBS) * 100 : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-8 px-6 pb-24 pt-12 text-center"
    >
      <motion.div variants={item} className="flex flex-col items-center gap-3">
        <span className="text-6xl select-none">📚</span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Learn English Verbs
        </h1>
        <p className="max-w-[260px] text-sm text-muted-foreground">
          50 verbos irregulares esenciales. Estudia, evalúa y domínalos.
        </p>
      </motion.div>

      <motion.div variants={item} className="w-full max-w-[300px]">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progreso</span>
          {ready && (
            <span className="font-medium tabular-nums">
              {knownCount}/{TOTAL_VERBS}
            </span>
          )}
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="h-full rounded-full bg-accent"
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="flex w-full max-w-[300px] flex-col gap-3">
        <Link href="/study" className="no-underline">
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="w-full rounded-2xl bg-accent px-6 py-4 text-lg font-semibold text-accent-foreground shadow-lg shadow-accent/20"
          >
            📖 Aprender
          </motion.button>
        </Link>
        <Link href="/quiz" className="no-underline">
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="w-full rounded-2xl border border-border bg-card px-6 py-4 text-lg font-semibold text-card-foreground shadow-sm"
          >
            ✏️ Evaluarme
          </motion.button>
        </Link>
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-3">
        <button
          onClick={toggleOnlyUnlearned}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={onlyUnlearned ? "on" : "off"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {onlyUnlearned ? "✅" : "⬜"}
            </motion.span>
          </AnimatePresence>
          Solo los que no sé
        </button>
      </motion.div>
    </motion.div>
  );
}