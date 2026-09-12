import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import '@fontsource/outfit/800.css'
import './style.css'
import { TOOLS, getTool } from './data/tools.ts'
import { ic, observeReveals, renderFooter, renderTopbar } from './ui/shell.ts'
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
    <main id="view" class="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-8 md:py-12"></main>
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
      view.innerHTML = `<div class="mx-auto max-w-lg py-20 text-center"><div class="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-3xl text-slate-400 mx-auto dark:bg-slate-800">${ic('ph-file-x', 'text-3xl')}</div><h1 class="mt-4 text-2xl font-bold">Tool not found</h1><a href="#/" class="btn-press mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white">${ic('ph-arrow-left', 'text-base')} Back to all tools</a></div>`
      return
    }
    renderTopbar(top, id)
    view.innerHTML = `
      <a href="#/" class="btn-press mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">${ic('ph-arrow-left', 'text-base')} All tools</a>
      <div id="toolBody" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 md:p-8 dark:border-slate-800 dark:bg-slate-950"></div>
      <h2 class="mt-10 text-lg font-bold text-slate-900 dark:text-white">Related tools</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-3">
        ${suggest(id).map((t) => `<a href="#/${t.id}" class="tool-card rounded-2xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-600/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/40"><span class="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">${ic(t.icon, 'text-xl')}</span><span class="mt-2.5 block text-sm font-bold text-slate-900 dark:text-white">${t.name}</span><span class="block text-xs text-slate-400">${t.tagline}</span></a>`).join('')}
      </div>`
    RENDERERS[id](view.querySelector<HTMLElement>('#toolBody')!)
  }
  observeReveals(view)
}

function suggest(id: string): typeof TOOLS {
  const cur = getTool(id)!
  return TOOLS.filter((t) => t.id !== id && t.category === cur.category).slice(0, 3)
}

function toolCard(t: (typeof TOOLS)[number], large = false): string {
  return `
  <a href="#/${t.id}" data-toolcard data-name="${t.name} ${t.tagline} ${t.desc} ${t.id}" class="tool-card group flex ${large ? 'flex-col justify-between gap-6 p-6 md:p-7' : 'flex-col p-5'} rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-600/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/40">
    <div class="flex items-start justify-between gap-3">
      <span class="grid ${large ? 'h-14 w-14' : 'h-12 w-12'} place-items-center rounded-2xl bg-gradient-to-br ${t.gradient} text-white shadow-md ${large ? 'text-3xl' : 'text-2xl'}">${ic(t.icon, large ? 'text-3xl' : 'text-2xl')}</span>
      ${t.badge ? `<span class="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">${ic('ph-star', 'text-xs')} ${t.badge}</span>` : ''}
    </div>
    <div>
      <div class="${large ? 'text-xl' : 'text-base'} mt-4 font-bold text-slate-900 dark:text-white">${t.name}</div>
      <div class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">${t.tagline}</div>
      <p class="clamp-2 mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">${t.desc}</p>
      <div class="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 transition-colors group-hover:text-indigo-600 dark:text-slate-300 dark:group-hover:text-indigo-400">Open tool ${ic('ph-arrow-right', 'text-base')}</div>
    </div>
  </a>`
}

function renderHome(v: HTMLElement): void {
  const popular = ['image-to-pdf', 'pdf-to-image'].map((id) => getTool(id)!)
  const pdfRest = TOOLS.filter((t) => t.category === 'PDF' && !popular.some((p) => p.id === t.id))
  const imgRest = TOOLS.filter((t) => t.category === 'Image' && !popular.some((p) => p.id === t.id))

  v.innerHTML = `
  <section class="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
    <div>
      <div class="reveal inline-flex items-center gap-1.5 rounded-full border border-indigo-600/20 bg-indigo-600/5 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">${ic('ph-lightning', 'text-sm')} 10 free tools · no uploads · no watermarks</div>
      <h1 class="reveal mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 md:text-5xl dark:text-white" style="--reveal-delay:60ms">Convert files without uploading them.</h1>
      <p class="reveal mt-3 max-w-md text-base leading-relaxed text-slate-500 dark:text-slate-400" style="--reveal-delay:120ms">Images, PDFs and text — transformed privately in your browser.</p>
      <div class="reveal mt-5 flex max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 pl-3.5 shadow-sm focus-within:border-indigo-400 dark:border-slate-700 dark:bg-slate-900" style="--reveal-delay:180ms">
        <span class="text-slate-400">${ic('ph-magnifying-glass', 'text-lg')}</span>
        <input id="search" placeholder="Search tools — try merge, jpg, text" aria-label="Search tools" class="w-full bg-transparent py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />
      </div>
      <div class="reveal mt-4 flex flex-wrap gap-2.5" style="--reveal-delay:240ms">
        <a href="#/image-to-pdf" class="btn-press inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700">Start converting ${ic('ph-arrow-right', 'text-base')}</a>
        <a href="#/pdf-merge" class="btn-press inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300">Merge PDFs</a>
      </div>
    </div>
    <div class="reveal rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5 dark:border-slate-800 dark:bg-slate-900" style="--reveal-delay:200ms">
      <div class="flex items-center justify-between px-1 pb-3">
        <span class="text-sm font-bold text-slate-800 dark:text-slate-100">Quick launch</span>
        <a href="#/" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View all</a>
      </div>
      <div class="grid grid-cols-2 gap-2.5">
        ${['image-to-pdf', 'pdf-to-image', 'pdf-merge', 'image-compress'].map((id) => {
          const t = getTool(id)!
          return `<a href="#/${t.id}" class="btn-press group rounded-xl border border-slate-200 p-3.5 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/30"><span class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${t.gradient} text-white">${ic(t.icon, 'text-xl')}</span><span class="mt-2.5 block text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">${t.name}</span><span class="mt-0.5 block text-xs text-slate-400">${t.tagline}</span></a>`
        }).join('')}
      </div>
      <div class="mt-3 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-3 text-center dark:divide-slate-800 dark:bg-slate-950/60">
        <div><div class="text-lg font-extrabold text-slate-900 dark:text-white">10</div><div class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tools</div></div>
        <div><div class="text-lg font-extrabold text-slate-900 dark:text-white">0</div><div class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Uploads</div></div>
        <div><div class="text-lg font-extrabold text-slate-900 dark:text-white">100%</div><div class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Private</div></div>
      </div>
    </div>
  </section>

  <section class="mt-12 md:mt-16">
    <div class="reveal flex flex-wrap items-end justify-between gap-2">
      <h2 class="text-xl font-bold tracking-tight text-slate-900 md:text-2xl dark:text-white">Most used</h2>
    </div>
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      ${popular.map((t) => `<div class="reveal">${toolCard(t, true)}</div>`).join('')}
    </div>
  </section>

  <section class="mt-10 md:mt-12">
    <h2 class="reveal text-xl font-bold tracking-tight text-slate-900 md:text-2xl dark:text-white">PDF tools</h2>
    <div id="gridPdf" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      ${pdfRest.map((t, i) => `<div class="reveal" style="--reveal-delay:${(i % 3) * 70}ms">${toolCard(t)}</div>`).join('')}
    </div>
  </section>

  <section class="mt-10 md:mt-12">
    <h2 class="reveal text-xl font-bold tracking-tight text-slate-900 md:text-2xl dark:text-white">Image tools</h2>
    <div id="gridImg" class="mt-4 grid gap-4 sm:grid-cols-2">
      ${imgRest.map((t, i) => `<div class="reveal" style="--reveal-delay:${i * 70}ms">${toolCard(t)}</div>`).join('')}
    </div>
  </section>

  <section class="reveal mt-12 grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:mt-16 lg:grid-cols-2 lg:gap-12 dark:border-slate-800 dark:bg-slate-900">
    <div>
      <h2 class="text-xl font-bold tracking-tight text-slate-900 md:text-2xl dark:text-white">Private by design, not by promise.</h2>
      <p class="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">Most converters upload your files to a server. EasyConvert runs the conversion libraries directly on your device — nothing to intercept, store, or leak.</p>
    </div>
    <ul class="grid content-center gap-3">
      ${[
        ['ph-shield-check', 'No uploads, ever', 'Files are processed in memory and never touch a network.'],
        ['ph-lightning', 'Instant and offline-tolerant', 'No queues, no waiting rooms — conversion starts immediately.'],
        ['ph-x', 'No accounts or watermarks', 'Open the site, convert, download. Nothing else.'],
      ].map(([icon, title, body]) => `<li class="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/60"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600/10 text-indigo-700 dark:text-indigo-300">${ic(icon, 'text-lg')}</span><span><span class="block text-sm font-bold text-slate-800 dark:text-slate-100">${title}</span><span class="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">${body}</span></span></li>`).join('')}
    </ul>
  </section>

  <section class="mt-10 md:mt-12">
    <h2 class="reveal text-xl font-bold tracking-tight text-slate-900 md:text-2xl dark:text-white">How it works</h2>
    <ol class="mt-4 grid gap-4 md:grid-cols-3">
      ${[
        ['01', 'Pick a tool', 'Choose one of the ten converters above — each page guides you.'],
        ['02', 'Drop your files', 'Drag files in, reorder with one click, tune the options.'],
        ['03', 'Download', 'Convert in one click and save the result or a ZIP.'],
      ].map(([n, title, body], i) => `<li class="reveal rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" style="--reveal-delay:${i * 70}ms"><div class="text-sm font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400">${n}</div><div class="mt-1.5 text-base font-bold text-slate-900 dark:text-white">${title}</div><p class="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">${body}</p></li>`).join('')}
    </ol>
  </section>

  <div id="noResults" class="hidden rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">No tools match your search.</div>`

  const search = v.querySelector<HTMLInputElement>('#search')!
  const noResults = v.querySelector<HTMLElement>('#noResults')!

  // Tag cards for search filtering (wrappers carry data, inner anchor stays intact)
  v.querySelectorAll<HTMLElement>('[data-toolcard]').forEach((a) => {
    const wrap = a.parentElement!
    wrap.setAttribute('data-search', (a.getAttribute('data-name') ?? '').toLowerCase())
  })

  search.addEventListener('input', () => {
    const f = search.value.trim().toLowerCase()
    let visible = 0
    v.querySelectorAll<HTMLElement>('[data-search]').forEach((wrap) => {
      const hit = !f || (wrap.getAttribute('data-search') ?? '').includes(f)
      wrap.classList.toggle('hidden', !hit)
      if (hit) visible++
    })
    noResults.classList.toggle('hidden', visible > 0)
  })
  observeReveals(v)
}

window.addEventListener('hashchange', route)
route()
