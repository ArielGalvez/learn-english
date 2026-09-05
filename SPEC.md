# SPEC.md

## Learn English Verbs — Flashcard App

### Objetivo
App móvil-first (instalable PWA) para aprender verbos irregulares en inglés. Sin login. Sin API keys de pago.

### Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router, Turbopack, TypeScript, Tailwind) |
| Animaciones | `motion` (framer-motion `motion/react`) |
| Conjugaciones | `english-verbs-helper`, `english-verbs-irregular`, `english-verbs-gerunds` (npm, build) |
| Definición EN | `freedictionaryapi.com` (sin key, cacheadas en build) |
| Imágenes | Wikimedia Commons API vía route handler SSR (sin key) + fallback |
| Pronunciación | Web Speech API (`speechSynthesis`) |
| Persistencia | localStorage |
| Deploy | Vercel (free) |

### Tema (dark/light)
- Tema inicial: **sigue el tema del dispositivo** (`prefers-color-scheme`)
- Toggle manual en UI para forzar **light** o **dark** (persistido en localStorage, prioridad sobre el sistema)
- CSS: Tailwind dark mode **con selector de clase** (`class` en `<html>`) + script anti-flash inline en el head

### Datos
Pipeline de build → `lib/verbs-data.ts` (frozen, sin IO en runtime):

1. Lista curada de **236 verbos** ordenados por frecuencia (50 irregulares esenciales + verbos de acción cotidianos: cook, walk, dance, climb, wash...) — definida en `data/verbs-source.json`
2. `english-verbs-helper` genera los **12 tiempos** por verbo
3. Free Dictionary API (build-time, cacheada) → `meaning_en` + oración de ejemplo
4. `meaning_es` curado manualmente en el JSON fuente

```ts
type Verb = {
  base: string
  meaning_en: string
  meaning_es: string
  example: string
  image_query: string
  frequency: number
  tenses: {
    present: string            // run / runs
    past: string               // ran
    past_participle: string    // run
    present_continuous: string // running
    future: string             // will run
    present_perfect: string    // have/has run
    // + progressive & perfect de past/future
  }
}
```

### Rutas

| Ruta | Función |
|------|---------|
| `/` | Home: modo Estudio / Evaluarme, progreso `X/236`, toggle "solo no aprendidos", toggle tema |
| `/study` | Swipe deck (cards de estudio) |
| `/quiz` | Swipe deck (preguntas MC) |
| `/quiz/summary` | Resumen de resultados + stats |
| `/api/verb-image?q=...` | SSR proxy a Wikimedia Commons (oculta lógica) |

### Modo Estudio
- Deck swipe **drag-x** (`motion`): `drag="x"`, escala/rotación según offset, spring al soltar, `AnimatePresence` para entrada/salida
- Card: imagen arriba (skeleton shimmer), verbo base grande, 🔊 pronunciar (verbo y cada tiempo), oración ejemplo
- Reveal progresivo: botón "🤔 What does it mean?" → `meaning_en` (colapsable animado); botón "🇪🇸 En español" → `meaning_es` (último recurso, siempre oculto)
- Botón **"✓ Lo sé"** flotante: card vuela a la derecha con fade + check, marca en `known`, pasa a la siguiente
- Filtro: toggle "solo no aprendidos" (si activo, los `known` se saltan)

### Modo Quiz
- Mismo deck swipe, transformado en pregunta
- **3 tipos rotando** (generados en runtime a partir de los datos):
  1. "¿Cuál es el pasado de 'run'?" → 4 opciones (distractores = past de otros verbos)
  2. Imagen → "¿Qué verbo es?" → 4 opciones en inglés
  3. "¿Qué significa 'run'?" → 4 opciones en español
- Feedback animado:
  - Correcto → opción **verde + scale pulse + ✓**, contador up
  - Incorrecto → opción **roja + shake**, destella la correcta en verde, "Era: ran"
- Al final: `/quiz/summary` con X/Y, % y animación de barra de progreso

### Estado (localStorage)
```ts
{
  theme?: "light" | "dark"    // undefined = seguir sistema
  known: string[]             // verbos aprendidos
  results: Record<string, "correct" | "wrong"> // ÚLTIMO resultado por verbo (sobreescribe)
}
```

### Fases de implementación

| # | Entregable |
|---|-----------|
| 1 | Scaffold + tema light/dark (sistema + toggle, anti-flash) |
| 2 | Datos: lista curada de verbos + script de build (librerías npm + diccionario) → `verbs.json` |
| 3 | Home + hooks `useProgress`, `useSpeech`, `useTheme` |
| 4 | Modo Estudio: swipe + pronunciación + reveals + "Lo sé" |
| 5 | Modo Quiz: generador MC + feedback + summary |
| 6 | Wikimedia API + skeleton + fallback |
| 7 | Deploy Vercel + manifest PWA instalable |