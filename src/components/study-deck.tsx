"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "motion/react";
import type { Verb } from "@/lib/types";
import { TENSE_LABELS } from "@/lib/types";
import { PronounceButton } from "./pronounce-button";
import { RevealSection } from "./reveal-section";
import { VerbImage } from "./verb-image";

function TenseList({ verb }: { verb: Verb }) {
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(verb.tenses)
        .slice(0, 6)
        .map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2"
          >
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {TENSE_LABELS[key as keyof typeof verb.tenses]}
              </div>
              <div className="font-medium text-card-foreground">{value}</div>
            </div>
            <PronounceButton text={value} small />
          </div>
        ))}
    </div>
  );
}

export function StudyDeck({
  verbs,
  onMarkKnown,
}: {
  verbs: Verb[];
  onMarkKnown: (verb: Verb) => void;
}) {
  const [index, setIndex] = useState(0);
  const [side, setSide] = useState<"tense" | "meaning">("tense");
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const opacity = useTransform(x, [-220, 220], [1, 0.7]);

  const verb = verbs[index];
  const isFinished = index >= verbs.length;

  useEffect(() => {
    setSide("tense");
    setLeaving(null);
  }, [index]);

  const advance = (dir: "left" | "right", known?: boolean) => {
    setLeaving(dir);
    window.setTimeout(() => {
      if (known && verb) onMarkKnown(verb);
      setIndex((i) => i + 1);
    }, 320);
  };

  if (isFinished) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="text-6xl"
        >
          🎉
        </motion.span>
        <p className="text-lg font-semibold text-card-foreground">
          ¡Terminaste la sesión!
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
    <div className="px-5 pb-24 pt-4">
      <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
        <span className="tabular-nums">
          {index + 1} / {verbs.length}
        </span>
        <div className="flex gap-1 rounded-full bg-muted p-1 text-xs font-medium">
          <button
            onClick={() => setSide("tense")}
            className={`rounded-full px-3 py-1 transition-colors ${
              side === "tense"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Tiempos
          </button>
          <button
            onClick={() => setSide("meaning")}
            className={`rounded-full px-3 py-1 transition-colors ${
              side === "meaning"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Significado
          </button>
        </div>
      </div>

      <div className="relative h-[68vh]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={index}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              const { offset, velocity } = info;
              const power = Math.abs(offset.x) + Math.abs(velocity.x) * 0.4;
              if (power < 120) return;
              if (offset.x < 0) advance("left");
              else advance("right", true);
            }}
            animate={
              leaving === "left"
                ? { x: -420, opacity: 0, rotate: -18, transition: { duration: 0.3 } }
                : leaving === "right"
                  ? { x: 420, opacity: 0, rotate: 18, transition: { duration: 0.3 } }
                  : { x: 0 }
            }
            className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/10 dark:shadow-black/40"
          >
            {side === "tense" ? (
              <div className="flex h-full flex-col">
                <VerbImage imageQuery={verb.image_query} letter={verb.base[0]} className="h-56" />
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
                  <div className="flex items-center justify-center gap-3">
                    <h2 className="text-4xl font-bold capitalize text-card-foreground">
                      {verb.base}
                    </h2>
                    <PronounceButton text={verb.base} />
                  </div>
                  <TenseList verb={verb} />
                  <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm italic text-muted-foreground">
                    “{verb.example}”
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col overflow-y-auto bg-card p-6">
                <div className="mb-4 flex items-center justify-center gap-3">
                  <h2 className="text-3xl font-bold capitalize text-card-foreground">
                    {verb.base}
                  </h2>
                  <PronounceButton text={verb.base} />
                </div>
                <RevealSection
                  title="🤔 What does it mean?"
                  hint="Toca para ver la definición en inglés"
                >
                  <p className="text-card-foreground">{verb.meaning_en}</p>
                </RevealSection>
                <div className="h-px w-full bg-border" />
                <RevealSection
                  title="🇪🇸 ¿Qué significa en español?"
                  hint="Último recurso — intenta recordarlo primero"
                >
                  <p className="text-lg font-semibold capitalize text-card-foreground">
                    {verb.meaning_es}
                  </p>
                </RevealSection>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => advance("left")}
          className="flex-1 rounded-2xl border border-border bg-card px-4 py-4 text-base font-semibold text-muted-foreground shadow-sm"
        >
          ← No lo sé
        </button>
        <button
          onClick={() => advance("right", true)}
          className="flex-1 rounded-2xl bg-accent px-4 py-4 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20"
        >
          ✓ Lo sé
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Desliza la tarjeta: derecha = lo sé · izquierda = no lo sé
      </p>
    </div>
  );
}