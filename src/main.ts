import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import '@fontsource/outfit/800.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'
import './style.css'
import { TOOLS, getTool } from './data/tools.ts'
import { ic, observeReveals, renderFooter, renderTopbar, tile } from './ui/shell.ts'
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
      view.innerHTML = `<div class="mx-auto max-w-lg py-20 text-center"><div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5">${ic('ph-file-x', 'text-3xl')}</div><h1 class="mt-4 text-2xl font-bold">Tool not found</h1><a href="#/" class="btn-press mt-5 inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-lime-200">${ic('ph-arrow-left', 'text-base')} Back to all tools</a></div>`
      return
    }
    renderTopbar(top, id)
    view.innerHTML = `
      <a href="#/" class="btn-press mb-5 inline-flex items-center gap-1.5 font-mono text-[13px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">${ic('ph-arrow-left', 'text-base')} index</a>
      <div id="toolBody" class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-950/5 md:p-8 dark:border-white/10 dark:bg-zinc-900"></div>
      <h2 class="mt-10 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">Related tools</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-3">
        ${suggest(id).map((t) => `<a href="#/${t.id}" class="tool-card rounded-2xl border border-zinc-200 bg-white p-4 hover:border-lime-500 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-lime-300/60"><span class="${tile('h-10 w-10 text-xl')}">${ic(t.icon, 'text-xl')}</span><span class="mt-2.5 block text-sm font-bold text-zinc-900 dark:text-white">${t.name}</span><span class="block font-mono text-[11px] text-zinc-400">${t.tagline}</span></a>`).join('')}
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
  <a href="#/${t.id}" data-toolcard data-name="${t.name} ${t.tagline} ${t.desc} ${t.id}" class="tool-card group flex ${large ? 'flex-col justify-between gap-6 p-6 md:p-7' : 'flex-col p-5'} rounded-2xl border border-zinc-200 bg-white hover:border-lime-500 hover:shadow-xl hover:shadow-lime-500/10 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-lime-300/60">
    <div class="flex items-start justify-between gap-3">
      <span class="${tile(large ? 'h-14 w-14 text-3xl' : 'h-12 w-12 text-2xl')}">${ic(t.icon, large ? 'text-3xl' : 'text-2xl')}</span>
      ${t.badge ? `<span class="inline-flex items-center gap-1 rounded-full bg-lime-300/25 px-2.5 py-1 font-mono text-[11px] font-bold text-lime-700 dark:bg-lime-300/15 dark:text-lime-300">${ic('ph-star', 'text-xs')} ${t.badge}</span>` : ''}
    </div>
    <div>
      <div class="${large ? 'text-xl' : 'text-base'} mt-4 font-bold tracking-tight text-zinc-900 dark:text-white">${t.name}</div>
      <div class="font-mono text-[11px] font-medium text-zinc-400">${t.tagline}</div>
      <p class="clamp-2 mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">${t.desc}</p>
      <div class="mt-3 inline-flex items-center gap-1.5 font-mono text-[13px] font-bold text-zinc-700 transition-colors group-hover:text-lime-700 dark:text-zinc-300 dark:group-hover:text-lime-300">open_${t.id.replace(/-/g, '_')} ${ic('ph-arrow-right', 'text-base')}</div>
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
      <div class="reveal inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 dark:border-white/10 dark:text-zinc-400"><span class="h-1.5 w-1.5 rounded-full bg-lime-500"></span>10 tools · zero uploads · zero watermark</div>
      <h1 class="reveal mt-4 text-4xl font-extrabold leading-[1.02] tracking-tight text-zinc-900 md:text-6xl dark:text-white" style="--reveal-delay:60ms">Convert files<br/>without <em class="text-lime-700 dark:text-lime-300">uploading</em> them.</h1>
      <p class="reveal mt-4 max-w-md text-base leading-relaxed text-zinc-500 dark:text-zinc-400" style="--reveal-delay:120ms">Images, PDFs and text — transformed privately, inside your own browser tab.</p>
      <div class="reveal mt-6 flex max-w-md items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 pl-3.5 shadow-sm focus-within:border-lime-600 dark:border-white/10 dark:bg-zinc-900" style="--reveal-delay:180ms">
        <span class="text-zinc-400">${ic('ph-magnifying-glass', 'text-lg')}</span>
        <input id="search" placeholder="Search tools — try merge, jpg, text" aria-label="Search tools" class="w-full bg-transparent py-1.5 font-mono text-[13px] text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white" />
        <kbd class="hidden rounded-md border border-zinc-200 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400 sm:block dark:border-white/10">/</kbd>
      </div>
      <div class="reveal mt-4 flex flex-wrap gap-2.5" style="--reveal-delay:240ms">
        <a href="#/image-to-pdf" class="btn-press inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-lime-200">Start converting ${ic('ph-arrow-right', 'text-base')}</a>
        <a href="#/pdf-merge" class="btn-press inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-transparent px-5 py-2.5 font-mono text-[13px] font-bold text-zinc-700 hover:border-zinc-950 dark:border-white/15 dark:text-zinc-200 dark:hover:border-lime-300">merge_pdfs</a>
      </div>
    </div>
    <div class="reveal rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/5 sm:p-5 dark:border-white/10 dark:bg-zinc-900" style="--reveal-delay:200ms">
      <div class="flex items-center justify-between px-1 pb-3">
        <span class="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">quick_launch</span>
        <span class="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-500"></span>local</span>
      </div>
      <div class="grid grid-cols-2 gap-2.5">
        ${['image-to-pdf', 'pdf-to-image', 'pdf-merge', 'image-compress'].map((id) => {
          const t = getTool(id)!
          return `<a href="#/${t.id}" class="btn-press group rounded-xl border border-zinc-200 p-3.5 text-left transition-colors hover:border-lime-500 hover:bg-lime-300/10 dark:border-white/10 dark:hover:border-lime-300/60 dark:hover:bg-lime-300/5"><span class="${tile('h-10 w-10 text-xl')}">${ic(t.icon, 'text-xl')}</span><span class="mt-2.5 block text-sm font-bold leading-tight text-zinc-800 dark:text-zinc-100">${t.name}</span><span class="mt-0.5 block font-mono text-[11px] text-zinc-400">${t.tagline}</span></a>`
        }).join('')}
      </div>
      <div class="mt-3 grid grid-cols-3 divide-x divide-zinc-200 rounded-xl bg-zinc-100 py-3 text-center dark:divide-white/10 dark:bg-black/40">
        <div><div class="font-mono text-lg font-bold text-zinc-900 dark:text-white">10</div><div class="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">tools</div></div>
        <div><div class="font-mono text-lg font-bold text-zinc-900 dark:text-white">0</div><div class="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">uploads</div></div>
        <div><div class="font-mono text-lg font-bold text-lime-700 dark:text-lime-300">100%</div><div class="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400">private</div></div>
      </div>
    </div>
  </section>

  <section class="mt-12 md:mt-16">
    <div class="reveal flex flex-wrap items-end justify-between gap-2">
      <h2 class="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">01 — most_used</h2>
    </div>
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      ${popular.map((t) => `<div class="reveal">${toolCard(t, true)}</div>`).join('')}
    </div>
  </section>

  <section class="mt-10 md:mt-12">
    <h2 class="reveal font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">02 — pdf_tools</h2>
    <div id="gridPdf" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      ${pdfRest.map((t, i) => `<div class="reveal" style="--reveal-delay:${(i % 3) * 70}ms">${toolCard(t)}</div>`).join('')}
    </div>
  </section>

  <section class="mt-10 md:mt-12">
    <h2 class="reveal font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">03 — image_tools</h2>
    <div id="gridImg" class="mt-4 grid gap-4 sm:grid-cols-2">
      ${imgRest.map((t, i) => `<div class="reveal" style="--reveal-delay:${i * 70}ms">${toolCard(t)}</div>`).join('')}
    </div>
  </section>

  <section class="reveal mt-12 grid gap-8 rounded-2xl bg-zinc-950 p-6 sm:p-8 md:mt-16 lg:grid-cols-2 lg:gap-12 dark:bg-lime-300">
    <div>
      <div class="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-lime-300 dark:text-zinc-700">why_local</div>
      <h2 class="mt-2 text-xl font-bold tracking-tight text-white md:text-2xl dark:text-zinc-950">Private by design, not by promise.</h2>
      <p class="mt-2 max-w-md text-sm leading-relaxed text-zinc-400 dark:text-zinc-700">Most converters upload your files to a server. EasyConvert runs the conversion libraries directly on your device — nothing to intercept, store, or leak.</p>
    </div>
    <ul class="grid content-center gap-2.5">
      ${[
        ['ph-shield-check', 'No uploads, ever', 'Processed in memory. Nothing touches a network.'],
        ['ph-lightning', 'Instant, no queues', 'No waiting rooms — conversion starts immediately.'],
        ['ph-x', 'No accounts or watermarks', 'Open the site, convert, download. Nothing else.'],
      ].map(([icon, title, body]) => `<li class="flex items-start gap-3 rounded-xl bg-white/5 p-3.5 dark:bg-zinc-950/10"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime-300 text-zinc-950 dark:bg-zinc-950 dark:text-lime-300">${ic(icon, 'text-lg')}</span><span><span class="block text-sm font-bold text-white dark:text-zinc-950">${title}</span><span class="mt-0.5 block text-sm text-zinc-400 dark:text-zinc-700">${body}</span></span></li>`).join('')}
    </ul>
  </section>

  <section class="mt-10 md:mt-12">
    <h2 class="reveal font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">04 — how_it_works</h2>
    <ol class="mt-4 grid gap-4 md:grid-cols-3">
      ${[
        ['01', 'Pick a tool', 'Choose one of the ten converters above. Each page guides you.'],
        ['02', 'Drop your files', 'Drag files in, reorder with one click, tune the options.'],
        ['03', 'Download', 'Convert in one click and save the result or a ZIP.'],
      ].map(([n, title, body], i) => `<li class="reveal rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900" style="--reveal-delay:${i * 70}ms"><div class="font-mono text-sm font-bold text-lime-700 dark:text-lime-300">${n}</div><div class="mt-1.5 text-base font-bold text-zinc-900 dark:text-white">${title}</div><p class="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">${body}</p></li>`).join('')}
    </ol>
  </section>

  <div id="noResults" class="hidden rounded-2xl border border-dashed border-zinc-300 p-8 text-center font-mono text-[13px] text-zinc-400">no matches — clear the search.</div>`

  const search = v.querySelector<HTMLInputElement>('#search')!
  const noResults = v.querySelector<HTMLElement>('#noResults')!

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

// Global `/` shortcut focuses the home search box (attached once).
window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== '/') return
  const active = document.activeElement
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return
  const s = document.getElementById('search')
  if (s) {
    e.preventDefault()
    ;(s as HTMLInputElement).focus()
  }
})

route()
