const fs = require("fs");
const path = require("path");
const h = require("english-verbs-helper");
const Irregular = require("english-verbs-irregular/dist/verbs.json");
const Gerunds = require("english-verbs-gerunds/dist/gerunds.json");

const VERBS_INFO = h.mergeVerbsData(Irregular, Gerunds);

const SOURCE = path.join(__dirname, "..", "data", "verbs-source.json");
const CACHE = path.join(__dirname, "..", "data", "dictionary-cache.json");
const OUT = path.join(__dirname, "..", "src", "data", "verbs.json");

const source = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const cache = fs.existsSync(CACHE)
  ? JSON.parse(fs.readFileSync(CACHE, "utf8"))
  : {};

function tensesFor(base) {
  const present = h.getConjugation(VERBS_INFO, base, "SIMPLE_PRESENT", 0);
  const present3 = h.getConjugation(VERBS_INFO, base, "SIMPLE_PRESENT", 2);
  return {
    present: present3 === present ? present : `${present} / ${present3}`,
    past: h.getConjugation(VERBS_INFO, base, "SIMPLE_PAST", 0),
    past_participle: h.getConjugation(VERBS_INFO, base, "PARTICIPLE_PAST", 0),
    present_continuous: h.getConjugation(VERBS_INFO, base, "PARTICIPLE_PRESENT", 0),
    present_continuous_with_aux: h.getConjugation(VERBS_INFO, base, "PROGRESSIVE_PRESENT", 0),
    past_continuous: h.getConjugation(VERBS_INFO, base, "PROGRESSIVE_PAST", 0),
    present_perfect: `have/has ${h.getConjugation(VERBS_INFO, base, "PARTICIPLE_PAST", 0)}`,
    past_perfect: h.getConjugation(VERBS_INFO, base, "PERFECT_PAST", 0),
    future: h.getConjugation(VERBS_INFO, base, "SIMPLE_FUTURE", 0),
    future_perfect: h.getConjugation(VERBS_INFO, base, "PERFECT_FUTURE", 0),
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
  let i = 0;
  for (const item of source) {
    i += 1;
    process.stdout.write(`[${i}/${source.length}] ${item.base} ... `);
    const meaning = await fetchMeaning(item.base);
    out.push({
      base: item.base,
      meaning_en: meaning.meaning_en,
      meaning_es: item.meaning_es,
      example: meaning.example ?? `They ${item.base} every day.`,
      image_query: item.image_query,
      frequency: i,
      tenses: tensesFor(item.base),
    });
    console.log("ok");
    await new Promise((r) => setTimeout(r, 75));
  }

  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\n✓ Escrito ${out.length} verbos en ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});