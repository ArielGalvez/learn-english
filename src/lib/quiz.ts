import { VERBS, shuffle } from "./verbs";
import type { Verb } from "./types";

export type QuestionType = "past" | "image" | "meaning-es";

export type Question = {
  type: QuestionType;
  verb: Verb;
  prompt: string;
  options: string[];
  correct: string;
};

const OPTION_COUNT = 4;

function pickDistractors(
  pool: string[],
  correctValue: string,
  count: number,
): string[] {
  const uniq = Array.from(new Set(pool.filter((v) => v !== correctValue)));
  return shuffle(uniq).slice(0, count);
}

function buildOptions(correct: string, distractors: string[]): string[] {
  return shuffle([correct, ...distractors.slice(0, OPTION_COUNT - 1)]);
}

export function generateQuestion(verb: Verb, type: QuestionType): Question {
  if (type === "past") {
    const correct = verb.tenses.past;
    const pool = VERBS.map((v) => v.tenses.past).filter(
      (p) => !p.includes(","),
    );
    return {
      type,
      verb,
      prompt: `¿Cuál es el PASADO de "${verb.base}"?`,
      options: buildOptions(correct, pickDistractors(pool, correct, 3)),
      correct,
    };
  }

  if (type === "image") {
    const correct = verb.base;
    return {
      type,
      verb,
      prompt: "¿Qué acción muestra la imagen?",
      options: buildOptions(
        correct,
        pickDistractors(VERBS.map((v) => v.base), correct, 3),
      ),
      correct,
    };
  }

  // meaning-es
  const correct = verb.meaning_es.split(" / ")[0].trim();
  return {
    type,
    verb,
    prompt: `¿Qué significa "${verb.base}" en español?`,
    options: buildOptions(
      correct,
      pickDistractors(
        VERBS.map((v) => v.meaning_es.split(" / ")[0].trim()),
        correct,
        3,
      ),
    ),
    correct,
  };
}

const CYCLE: QuestionType[] = ["past", "image", "meaning-es"];

export function generateQuestionSequence(
  verbs: Verb[],
  bankSize: number,
): Question[] {
  const bank = shuffle(verbs).slice(0, bankSize);
  return bank.map((verb, i) => generateQuestion(verb, CYCLE[i % CYCLE.length]));
}