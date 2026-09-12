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

## Design rules (anti-slop, dashboard edition)

- Layout: dashboard shell — royal-blue canvas `#2b5cf6`, floating app card
  (`#eef1f7` light / `zinc-950` dark), sticky grouped sidebar, workspace cards,
  right rail on home. Mobile: top bar + drawer, single column.
- Type: Outfit for UI, JetBrains Mono for labels/numerals/kbd (both self-hosted
  via `@fontsource`, never a Google Fonts `<link>`)
- Color: one royal-blue accent (`blue-600`, `blue-700` text on light) + ink-black
  primary buttons (white buttons in dark mode). File-type tiles are pastel
  (see `tile` in `data/tools.ts`). No purple, no orange, no lime branding.
- Icons: inline Phosphor SVGs via `ic('ph-<name>', '<size-class>')` in `src/ui/icons.ts`
  — only the set in `GLYPHS` is bundled; add a `?raw` import to extend it. No emojis in UI.
- Shape lock: shell + cards `rounded-2xl` · controls/inputs `rounded-xl` ·
  pills/badges `rounded-full` · sidebar nav `rounded-xl`
- Motion: `.reveal` + `observeReveals()` (transform/opacity only), `btn-press` tactile
  feedback, everything collapses under `prefers-reduced-motion` (see `style.css`)
- Queue rows mirror the dashboard pattern: pastel type icon, name, mono
  `size · ready` line, reorder + remove actions

## Gotchas

- pdf.js v5 render API is `page.render({ canvas, viewport })` — NOT `canvasContext`
- pdf.js worker must be set via `?url` import (see `getPdfjs()` in `lib/files.ts`)
- `pdf-lib` `save()` returns `Uint8Array` — wrap as `new Blob([bytes.buffer as ArrayBuffer], ...)`
- Guardrails: ~100 MB per file, max 50 images per batch (browser memory)
