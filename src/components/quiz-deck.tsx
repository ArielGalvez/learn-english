"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { generateQuestionSequence } from "@/lib/quiz";
import { playCorrect, playWrong } from "@/lib/sounds";
import { useProgress } from "@/hooks/use-progress";
import { PronounceButton } from "./pronounce-button";
import { VerbImage } from "./verb-image";
import { Confetti } from "./confetti";
import type { Verb } from "@/lib/types";

export function QuizDeck({
  verbs,
  onFinish,
}: {
  verbs: Verb[];
  onFinish: (score: number, total: number) => void;
}) {
  const { recordResult } = useProgress();

  const questions = useMemo(() => generateQuestionSequence(verbs, 10), [verbs]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [confetti, setConfetti] = useState(false);

  const question = questions[index];
  const isFinished = index >= questions.length;

  useEffect(() => {
    if (isFinished) {
      onFinish(score, questions.length);
    }
  }, [isFinished, score, questions.length, onFinish]);

  if (isFinished) return null;

  const answered = selected !== null;

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    const isCorrect = option === question.correct;
    recordResult(question.verb.base, isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setScore((s) => s + 1);
      playCorrect();
      setConfetti(true);
    } else {
      playWrong();
    }
  };

  const next = () => {
    setSelected(null);
    setIndex((i) => i + 1);
  };

  return (
    <div className="px-5 pb-24 pt-4">
      <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
        <span className="tabular-nums">
          {index + 1} / {questions.length}
        </span>
        <span className="font-medium text-accent">
          ✓ {score}
        </span>
      </div>

      <motion.div
        key={index}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/10 dark:shadow-black/40"
      >
        {confetti && <Confetti onDone={() => setConfetti(false)} />}
        <div className="border-b border-border p-5">
          {question.type === "image" ? (
            <div className="mb-4">
              <VerbImage
                imageQuery={question.verb.image_query}
                letter={question.verb.base[0]}
                className="h-40"
              />
            </div>
          ) : (
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="text-4xl font-bold capitalize text-card-foreground">
                {question.type === "past" ? question.verb.base : "?"}
              </span>
              {question.type === "past" && (
                <PronounceButton text={question.verb.base} />
              )}
            </div>
          )}
          <h2 className="text-center text-lg font-semibold text-card-foreground">
            {question.prompt}
          </h2>
        </div>

        <div className="flex flex-col gap-2 p-5">
          {question.options.map((option) => {
            const isCorrectOption = option === question.correct;
            const isSelected = option === selected;
            let stateClass = "border-border bg-muted/40 text-card-foreground";
            let pulse = false;
            if (answered) {
              if (isCorrectOption) {
                stateClass = "border-success/50 bg-success/10 text-success";
                pulse = true;
              } else if (isSelected) {
                stateClass = "border-error/50 bg-error/10 text-error";
              } else {
                stateClass = "border-border bg-muted/30 text-muted-foreground";
              }
            }
            return (
              <motion.button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={answered}
                whileTap={!answered ? { scale: 0.97 } : undefined}
                animate={
                  pulse
                    ? { scale: [1, 1.04, 1] }
                    : isSelected && !isCorrectOption
                      ? { x: [0, -8, 8, -6, 6, -2, 0] }
                      : undefined
                }
                transition={{ duration: 0.45 }}
                className={`flex items-center justify-start rounded-xl border px-4 py-3 text-left font-medium transition-colors ${stateClass}`}
              >
                {answered && isCorrectOption && <span className="mr-2">✅</span>}
                {answered && isSelected && !isCorrectOption && (
                  <span className="mr-2">❌</span>
                )}
                {option}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <div
              className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${
                selected === question.correct
                  ? "bg-success/10 text-success"
                  : "bg-error/10 text-error"
              }`}
            >
              {selected === question.correct ? (
                "¡Correcto! 🎉"
              ) : (
                <>Incorrecto — era&nbsp;“{question.correct}”</>
              )}
            </div>
            <button
              onClick={next}
              className="mt-3 w-full rounded-2xl bg-accent px-4 py-4 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20"
            >
              Siguiente →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}