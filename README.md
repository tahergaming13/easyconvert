# ⚡ EasyConvert — Free In-Browser File Converter

Convert images and PDFs without uploading anything. **10 tools, no backend, no watermarks, 100% private** — everything runs locally in your browser.

🔗 **Live demo:** https://easyconvert-ukew.vercel.app/
📦 **Stack:** Vite + TypeScript + Tailwind CSS · `jspdf` · `pdfjs-dist` · `pdf-lib` · `jszip`

## ✨ Features

- **10 tools in one site** with a top-bar picker (Images ▾ / PDF ▾), search, and mobile menu
- **Light / dark mode** with beautiful modern UI
- **Drag & drop** + click to browse + reorder files (↑ ↓)
- **Batch conversion + Download as ZIP**
- **Progress bars, previews, toasts** — great UX on desktop and mobile
- **Private by design:** files never leave the device (no server, no uploads)
- **Free hosting:** static build, deploys on Vercel free tier

## 🧰 Tools

| # | Tool | Route | What it does |
|---|------|-------|--------------|
| 1 | 🖼️ Image to PDF | `#/image-to-pdf` | JPG/PNG/WebP… → one PDF (Fit/A4/Letter, quality, reorder) |
| 2 | 📄 PDF to Images | `#/pdf-to-image` | PDF pages → JPG/PNG (1.5x/2x/3x), single or ZIP |
| 3 | 🔄 Image Converter | `#/image-convert` | JPG ↔ PNG ↔ WebP, batch + ZIP |
| 4 | 🗜️ Compress & Resize | `#/image-compress` | Quality slider + max W/H, shows % saved |
| 5 | 🧩 Merge PDF | `#/pdf-merge` | Join N PDFs in your order |
| 6 | ✂️ Split PDF | `#/pdf-split` | Extract range (`1-3,5`) or every page → ZIP |
| 7 | 📦 Compress PDF | `#/pdf-compress` | 3 levels, re-render for scanned PDFs |
| 8 | 🔁 Rotate PDF | `#/pdf-rotate` | 90°/180°/270° on all or selected pages |
| 9 | 🔤 PDF to Text | `#/pdf-to-text` | Extract selectable text → `.txt`, copy button |
| 10 | 📝 Text to PDF | `#/text-to-pdf` | Paste text / drop `.txt`/`.md` → styled A4 PDF |

## 🚀 Run locally

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173` link.

## 🏗️ Build

```bash
npm run build
npm run preview
```

Output goes to `dist/` (ignored by git, deployed by Vercel).

## ☁️ Deploy free on Vercel

1. Push this repo to GitHub (see below)
2. [vercel.com](https://vercel.com) → **Add New → Project** → Import `easyconvert`
3. Settings: Framework **Vite** · Build command `npm run build` · Output `dist`
4. **Deploy** — no env vars needed. `vercel.json` already rewrites SPA routes.

## ⬆️ Push to GitHub (first time)

```bash
git init
git add .
git commit -m "feat: EasyConvert v1 — 10 in-browser tools"
git branch -M main
git remote add origin https://github.com/tahergaming13/easyconvert.git
git push -u origin main
```

## 🔒 Privacy & limits

- No uploads, no accounts, no tracking. Conversion uses local canvas + PDF libraries.
- Sensible guardrails: ~100 MB per file, max 50 images per batch (avoids tab OOM).
- Scanned PDFs have no selectable text → `PDF to Text` will tell you.

## 🗺️ Roadmap

- [ ] HEIC support (`heic2any`) for iPhone photos
- [ ] Code-split PDF libs for faster first load
- [ ] FR language toggle, PWA offline mode
- [ ] OCR (would need backend or WASM — out of scope for free static)

## 📄 License

MIT — free for personal and commercial use.
