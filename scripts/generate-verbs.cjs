const fs = require("fs");
const path = require("path");
const h = require("english-verbs-helper");
const Irregular = require("english-verbs-irregular/dist/verbs.json");
const Gerunds = require("english-verbs-gerunds/dist/gerunds.json");

const VERBS_INFO = h.mergeVerbsData(Irregular, Gerunds);

const PAST_OVERRIDES = {
  hug: "hugged",
  pet: "petted",
  shop: "shopped",
};

const SOURCE = path.join(__dirname, "..", "data", "verbs-source.json");
const CACHE = path.join(__dirname, "..", "data", "dictionary-cache.json");
const OUT = path.join(__dirname, "..", "src", "data", "verbs.json");

const source = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const cache = fs.existsSync(CACHE)
  ? JSON.parse(fs.readFileSync(CACHE, "utf8"))
  : {};

function conjugation(base, tense, person) {
  try {
    return h.getConjugation(VERBS_INFO, base, tense, person) ?? "";
  } catch {
    return "";
  }
}

function pastFor(base) {
  return PAST_OVERRIDES[base] ?? conjugation(base, "SIMPLE_PAST", 0);
}

function tensesFor(base) {
  const present = conjugation(base, "SIMPLE_PRESENT", 0);
  const present3 = conjugation(base, "SIMPLE_PRESENT", 2);
  const past = pastFor(base);
  return {
    present: present3 === present ? present : `${present} / ${present3}`,
    past,
    past_participle:
      PAST_OVERRIDES[base] ?? conjugation(base, "PARTICIPLE_PAST", 0),
    present_continuous: conjugation(base, "PARTICIPLE_PRESENT", 0),
    present_continuous_with_aux: conjugation(base, "PROGRESSIVE_PRESENT", 0),
    past_continuous: conjugation(base, "PROGRESSIVE_PAST", 0),
    present_perfect: `have/has ${PAST_OVERRIDES[base] ?? conjugation(base, "PARTICIPLE_PAST", 0)}`,
    past_perfect: conjugation(base, "PERFECT_PAST", 0),
    future: conjugation(base, "SIMPLE_FUTURE", 0),
    future_perfect: conjugation(base, "PERFECT_FUTURE", 0),
  };
}

function extractMeaning(data) {
  const entries = (Array.isArray(data) ? data[0]?.entries : data?.entries) ?? [];
  const verbEntry = entries.find((e) => e.partOfSpeech === "verb");
  const senses = (verbEntry ?? entries[0])?.senses ?? [];
  if (!senses.length) return null;

  const collect = (sense) => {
    const subs = sense.subsenses ?? [];
    for (const sub of subs) {
      if (sub.definition) {
        return {
          meaning_en: sub.definition.replace(/^\([^)]*\)\s*/, "").trim(),
          example: sub.examples?.[0] ?? null,
        };
      }
    }
    if (sense.definition) {
      return {
        meaning_en: sense.definition.replace(/^\([^)]*\)\s*/, "").trim(),
        example: sense.examples?.[0] ?? null,
      };
    }
    return null;
  };

  for (const sense of senses) {
    const hit = collect(sense);
    if (hit && hit.example) return hit;
  }
  for (const sense of senses) {
    const hit = collect(sense);
    if (hit) return hit;
  }
  return null;
}

async function fetchMeaning(base) {
  if (cache[base]) return cache[base];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`https://freedictionaryapi.com/api/v1/entries/en/${base}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const extracted = extractMeaning(data);
    const result = extracted ?? { meaning_en: `To ${base}.`, example: null };
    cache[base] = result;
    return result;
  } catch (err) {
    console.warn(`  ⚠ ${base}: ${err.message} — usando fallback`);
    const result = { meaning_en: `To ${base}.`, example: null };
    cache[base] = result;
    return result;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const out = [];
  let processed = 0;
  let skipped = 0;
  for (const item of source) {
    processed += 1;
    process.stdout.write(`[${processed}/${source.length}] ${item.base} ... `);

    if (!conjugation(item.base, "SIMPLE_PRESENT", 0)) {
      console.log("skipped (no en la librería de conjugación)");
      skipped += 1;
      continue;
    }

    const meaning = await fetchMeaning(item.base);
    const gerund = conjugation(item.base, "PARTICIPLE_PRESENT", 0);
    out.push({
      base: item.base,
      meaning_en: meaning.meaning_en,
      meaning_es: item.meaning_es,
      example: meaning.example ?? `They ${item.base} every day.`,
      image_query: item.image_query ?? gerund,
      frequency: out.length + 1,
      tenses: tensesFor(item.base),
    });
    console.log("ok");
    await new Promise((r) => setTimeout(r, 75));
  }

  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\n✓ Escritos ${out.length} verbos en ${OUT} (${skipped} omitidos)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});