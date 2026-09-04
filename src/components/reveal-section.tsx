"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function RevealSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left font-medium text-card-foreground"
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 text-sm leading-relaxed text-card-foreground">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!open && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}