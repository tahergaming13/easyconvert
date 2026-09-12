import './style.css'
import { TOOLS, getTool } from './data/tools.ts'
import { renderTopbar, renderFooter } from './ui/shell.ts'
import { render as rImageToPdf } from './tools/imageToPdf.ts'
import { render as rPdfToImage } from './tools/pdfToImage.ts'
import { render as rImageConvert } from './tools/imageConvert.ts'
import { render as rImageCompress } from './tools/imageCompress.ts'
import { render as rPdfMerge } from './tools/pdfMerge.ts'
import { render as rPdfSplit } from './tools/pdfSplit.ts'
import { render as rPdfCompress } from './tools/pdfCompress.ts'
import { render as rPdfRotate } from './tools/pdfRotate.ts'
import { render as rPdfToText } from './tools/pdfToText.ts'
import { render as rTextToPdf } from './tools/textToPdf.ts'

const RENDERERS: Record<string, (el: HTMLElement) => void> = {
  'image-to-pdf': rImageToPdf,
  'pdf-to-image': rPdfToImage,
  'image-convert': rImageConvert,
  'image-compress': rImageCompress,
  'pdf-merge': rPdfMerge,
  'pdf-split': rPdfSplit,
  'pdf-compress': rPdfCompress,
  'pdf-rotate': rPdfRotate,
  'pdf-to-text': rPdfToText,
  'text-to-pdf': rTextToPdf,
}

function shell(): { top: HTMLElement; view: HTMLElement; foot: HTMLElement } {
  const app = document.querySelector<HTMLElement>('#app')!
  app.innerHTML = `
    <div id="toasts" class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2"></div>
    <div id="top"></div>
    <main id="view" class="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-8"></main>
    <div id="foot"></div>`
  return {
    top: app.querySelector<HTMLElement>('#top')!,
    view: app.querySelector<HTMLElement>('#view')!,
    foot: app.querySelector<HTMLElement>('#foot')!,
  }
}

const { top, view, foot } = shell()
renderFooter(foot)

function route(): void {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  const id = hash.replace(/^\//, '').split('?')[0]
  window.scrollTo({ top: 0 })
  if (!id || id === '/') {
    renderTopbar(top, undefined)
    renderHome(view)
  } else {
    const meta = getTool(id)
    if (!meta || !RENDERERS[id]) {
      renderTopbar(top, undefined)
      view.innerHTML = `<div class="mx-auto max-w-lg py-20 text-center"><div class="text-5xl">🔍</div><h1 class="mt-4 text-2xl font-extrabold">Tool not found</h1><a href="#/" class="mt-4 inline-block rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white">← Back to all tools</a></div>`
      return
    }
    renderTopbar(top, id)
    view.innerHTML = `
      <a href="#/" class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-500">← All tools</a>
      <div id="toolBody" class="rounded-3xl border border-slate-200 bg-white/60 p-5 shadow-sm md:p-8 dark:border-slate-800 dark:bg-slate-950/40"></div>
      <div class="mt-6 grid gap-3 sm:grid-cols-3">
        ${suggest(id).map((t) => `<a href="#/${t.id}" class="rounded-2xl border border-slate-200 bg-white p-4 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"><div class="text-xl">${t.icon}</div><div class="mt-1 text-sm font-bold">${t.name}</div><div class="text-xs text-slate-400">${t.tagline}</div></a>`).join('')}
      </div>`
    RENDERERS[id](view.querySelector<HTMLElement>('#toolBody')!)
  }
}

function suggest(id: string): typeof TOOLS {
  const cur = getTool(id)!
  return TOOLS.filter((t) => t.id !== id && t.category === cur.category).slice(0, 3)
}

function renderHome(v: HTMLElement): void {
  v.innerHTML = `
  <section class="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.08] via-fuchsia-500/[0.06] to-transparent p-8 md:p-12 dark:border-indigo-400/20">
    <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/25 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 blur-3xl"></div>
    <div class="relative">
      <div class="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-white/70 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-slate-900/70 dark:text-indigo-300">⚡ 10 free tools • no uploads • no watermarks</div>
      <h1 class="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl dark:text-white">Convert <span class="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">anything to anything</span>, right in your browser.</h1>
      <p class="mt-3 max-w-xl text-sm text-slate-500 md:text-base dark:text-slate-400">Images ↔ PDF, merge, split, compress, rotate, extract text. Pick a tool below — files never leave your device, so it's fast and private.</p>
      <div class="mt-5 flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 pl-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <span>🔍</span>
        <input id="search" placeholder="Search tools… (try 'pdf', 'jpg', 'merge')" class="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
      </div>
      <div class="mt-5 flex flex-wrap gap-2">
        <a href="#/image-to-pdf" class="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95">🖼️ Image → PDF</a>
        <a href="#/pdf-to-image" class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900">📄 PDF → Images</a>
        <a href="#/pdf-merge" class="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900">🧩 Merge PDF</a>
      </div>
    </div>
  </section>

  <div class="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><span>📄 PDF tools</span></div>
  <section id="gridPdf" class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"></section>
  <div class="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><span>🖼️ Image tools</span></div>
  <section id="gridImg" class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"></section>

  <section class="mt-10 grid gap-4 md:grid-cols-3">
    <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div class="text-2xl">🔒</div><div class="mt-2 text-sm font-bold">Private by design</div><p class="mt-1 text-sm text-slate-500">No server, no uploads. Conversion runs with local JS libraries (pdf.js, pdf-lib, jsPDF).</p></div>
    <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div class="text-2xl">💸</div><div class="mt-2 text-sm font-bold">Free forever & fast</div><p class="mt-1 text-sm text-slate-500">Static site — deploy free on Vercel. No API costs, works on any device.</p></div>
    <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div class="text-2xl">📦</div><div class="mt-2 text-sm font-bold">Batch + ZIP</div><p class="mt-1 text-sm text-slate-500">Convert many files at once, reorder with ↑ ↓, download everything as ZIP.</p></div>
  </section>`

  const gridPdf = v.querySelector<HTMLElement>('#gridPdf')!
  const gridImg = v.querySelector<HTMLElement>('#gridImg')!
  const search = v.querySelector<HTMLInputElement>('#search')!

  function card(t: (typeof TOOLS)[number]): string {
    return `
    <a href="#/${t.id}" class="tool-card group rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50">
      <div class="flex items-start justify-between">
        <span class="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${t.gradient} text-2xl text-white shadow-md">${t.icon}</span>
        ${t.badge ? `<span class="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-300">★ ${t.badge}</span>` : ''}
      </div>
      <div class="mt-3 font-bold text-slate-900 dark:text-white">${t.name}</div>
      <div class="text-xs font-semibold text-indigo-500">${t.tagline}</div>
      <p class="clamp-2 mt-1.5 text-sm text-slate-500 dark:text-slate-400">${t.desc}</p>
      <div class="mt-3 text-sm font-bold text-slate-700 group-hover:text-indigo-500 dark:text-slate-300">Open tool →</div>
    </a>`
  }

  function paint(filter = ''): void {
    const f = filter.trim().toLowerCase()
    const match = (t: (typeof TOOLS)[number]) =>
      !f || `${t.name} ${t.tagline} ${t.desc} ${t.id}`.toLowerCase().includes(f)
    gridPdf.innerHTML = TOOLS.filter((t) => t.category === 'PDF' && match(t)).map(card).join('') || emptyMsg()
    gridImg.innerHTML = TOOLS.filter((t) => t.category === 'Image' && match(t)).map(card).join('') || emptyMsg()
  }
  function emptyMsg(): string {
    return `<div class="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-400">No tools match your search.</div>`
  }
  search.addEventListener('input', () => paint(search.value))
  paint()
}

window.addEventListener('hashchange', route)
route()
