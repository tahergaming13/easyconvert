# AGENTS.md — EasyConvert

Free in-browser file converter. **No backend, no uploads** — all conversion runs client-side. Static build deployed on Vercel free tier.

## Stack

- Vite 8 + TypeScript (strict, `verbatimModuleSyntax`, `noUnusedLocals`) + Tailwind CSS v4 (`@tailwindcss/vite`)
- PDF/image libs: `jspdf`, `pdfjs-dist` (v5), `pdf-lib`, `jszip`, `file-saver`
- Hash routing (`#/<tool-id>`) so the static build needs no server rewrites beyond `vercel.json`

## Commands

```bash
npm install     # install deps
npm run dev     # local dev server
npm run build   # typecheck (tsc) + production build -> dist/
npm run preview # preview the production build
```

`npm run build` must pass before committing. Treat `tsc` errors as blocking.

## Architecture

- `src/main.ts` — app shell, hash router, homepage (tool grid + search)
- `src/data/tools.ts` — the 10 tool definitions (single source of truth for nav/cards)
- `src/ui/shell.ts` — topbar, theme toggle, `createDropzone()`, progress, toasts, `toolHeader()`
- `src/lib/files.ts` — `downloadBlob`, `loadImage`, `canvasToBlob`, `parsePageRange`, lazy `getPdfjs()`
- `src/tools/*.ts` — one file per tool, each exports `render(el: HTMLElement): void`
- Adding a tool = add meta in `data/tools.ts` + new file in `tools/` + entry in `RENDERERS` map in `main.ts`

## Conventions

- Import with explicit `.ts` extensions (required by `allowImportingTsExtensions`)
- No emojis in code comments; keep UI copy concise
- Reuse `createDropzone()` + `dz.getFiles()` — never mirror file state by hand
- Clean up object URLs (`URL.revokeObjectURL`) after downloads/previews where practical
- Dark mode via `.dark` class on `<html>` (Tailwind custom variant); test both themes
- Keep bundles lean: lazy-load heavy libs (`getPdfjs()` pattern) instead of top-level imports

## Design rules (anti-slop)

- Type: Outfit (self-hosted via `@fontsource/outfit`, never a Google Fonts `<link>`)
- Icons: inline Phosphor SVGs via `ic('ph-<name>', '<size-class>')` in `src/ui/icons.ts`
  — only the set in `GLYPHS` is bundled; add a `?raw` import to extend it. No emojis in UI.
- Shape lock: cards `rounded-2xl` · controls/inputs `rounded-xl` · pills/badges `rounded-full`
- Accent lock: one indigo→violet gradient, reserved for logo mark + primary CTAs only
- Motion: `.reveal` + `observeReveals()` (transform/opacity only), `btn-press` tactile
  feedback, everything collapses under `prefers-reduced-motion` (see `style.css`)
- One small label per hero max; headlines ≤ 2 lines; a bento grid has exactly as many
  cells as content items — never a blank tile

## Gotchas

- pdf.js v5 render API is `page.render({ canvas, viewport })` — NOT `canvasContext`
- pdf.js worker must be set via `?url` import (see `getPdfjs()` in `lib/files.ts`)
- `pdf-lib` `save()` returns `Uint8Array` — wrap as `new Blob([bytes.buffer as ArrayBuffer], ...)`
- Guardrails: ~100 MB per file, max 50 images per batch (browser memory)
