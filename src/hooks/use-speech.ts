"use client";

import { useCallback } from "react";

export function useSpeech() {
  const speak = useCallback((text: string, rate = 1) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const clean = text.replaceAll(" / ", ". ");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-US";
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak };
}