export type VerbTenses = {
  present: string;
  past: string;
  past_participle: string;
  present_continuous: string;
  present_continuous_with_aux: string;
  past_continuous: string;
  present_perfect: string;
  past_perfect: string;
  future: string;
  future_perfect: string;
};

export type Verb = {
  base: string;
  meaning_en: string;
  meaning_es: string;
  example: string;
  image_query: string;
  frequency: number;
  tenses: VerbTenses;
};

export type TenseKey = keyof VerbTenses;

export const TENSE_LABELS: Record<TenseKey, string> = {
  present: "Present simple",
  past: "Past simple",
  past_participle: "Past participle",
  present_continuous: "Present continuous (-ing)",
  present_continuous_with_aux: "Present continuous",
  past_continuous: "Past continuous",
  present_perfect: "Present perfect",
  past_perfect: "Past perfect",
  future: "Future",
  future_perfect: "Future perfect",
};