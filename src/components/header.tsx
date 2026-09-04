"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const pathname = usePathname();
  const canGoBack = pathname !== "/";

  return (
    <header className="flex items-center justify-between px-4 pt-4">
      <nav className="flex items-center gap-2">
        {canGoBack && (
          <Link href="/" aria-label="Volver al inicio">
            <motion.span
              whileTap={{ scale: 0.85 }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-base shadow-sm"
            >
              ←
            </motion.span>
          </Link>
        )}
        <span className="text-sm font-semibold tracking-tight text-muted-foreground">
          English Verbs
        </span>
      </nav>
      <ThemeToggle />
    </header>
  );
}