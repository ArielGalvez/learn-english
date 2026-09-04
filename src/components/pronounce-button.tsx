"use client";

import { motion } from "motion/react";
import { useSpeech } from "@/hooks/use-speech";

export function PronounceButton({
  text,
  small = false,
  label,
}: {
  text: string;
  small?: boolean;
  label?: string;
}) {
  const { speak } = useSpeech();

  return (
    <motion.button
      onClick={() => speak(text)}
      whileTap={{ scale: 0.8 }}
      aria-label={label ?? `Pronunciar ${text}`}
      className={
        small
          ? "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm"
          : "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-lg"
      }
    >
      🔊
    </motion.button>
  );
}