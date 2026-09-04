"use client";

import { useEffect, useMemo } from "react";
import { motion } from "motion/react";

const COLORS = [
  "#f472b6",
  "#facc15",
  "#4ade80",
  "#38bdf8",
  "#a78bfa",
  "#fb923c",
  "#f87171",
];

type Piece = {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  delay: number;
  duration: number;
  color: string;
  round: boolean;
};

export function Confetti({ onDone }: { onDone: () => void }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 380,
        y: -Math.random() * 460 - 60,
        rotate: Math.random() * 720 - 360,
        scale: 0.6 + Math.random() * 0.9,
        delay: Math.random() * 0.15,
        duration: 1.1 + Math.random() * 0.5,
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    [],
  );

  useEffect(() => {
    const t = window.setTimeout(onDone, 1700);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            rotate: p.rotate,
            scale: p.scale,
          }}
          transition={{
            duration: p.duration,
            ease: "easeOut",
            delay: p.delay,
          }}
          className={`absolute left-1/2 top-1/3 h-3 w-2 ${p.round ? "rounded-full" : ""}`}
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}