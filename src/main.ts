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
import { ic, observeReveals, renderFooter, renderSidebar, tileIcon } from './ui/shell.ts'
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

function shell(): { side: HTMLElement; view: HTMLElement; foot: HTMLElement } {
  const app = document.querySelector<HTMLElement>('#app')!
  app.innerHTML = `
    <div id="toasts" class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2"></div>
    <div class="mx-auto max-w-[1400px] p-2 sm:p-4">
      <div class="overflow-hidden rounded-2xl bg-[#eef1f7] shadow-2xl shadow-blue-900/30 dark:bg-zinc-950 dark:shadow-black/50">
        <div id="side"></div>
      <div class="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-start lg:gap-5">
        <div id="side" class="min-w-0 lg:w-60 lg:shrink-0 lg:self-stretch"></div>
        <main id="view" class="min-w-0 flex-1"></main>
      </div>
        <div id="foot"></div>
      </div>
    </div>`
  return {
    side: app.querySelector<HTMLElement>('#side')!,
    view: app.querySelector<HTMLElement>('#view')!,
    foot: app.querySelector<HTMLElement>('#foot')!,
  }
}

const { side, view, foot } = shell()
renderFooter(foot)

function route(): void {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  const id = hash.replace(/^\//, '').split('?')[0]
  window.scrollTo({ top: 0 })
  renderSidebar(side, !id || id === '/' ? undefined : id)
  if (!id || id === '/') {
    renderHome(view)
  } else {
    const meta = getTool(id)
    if (!meta || !RENDERERS[id]) {
      view.innerHTML = `<div class="rounded-2xl bg-white p-10 text-center dark:bg-zinc-900"><div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5">${ic('ph-file-x', 'text-2xl')}</div><h1 class="mt-4 text-xl font-bold">Tool not found</h1><a href="#/" class="btn-press mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-zinc-950">${ic('ph-arrow-left', 'text-base')} Back home</a></div>`
    } else {
      view.innerHTML = `
        <div class="rounded-2xl bg-white p-4 sm:p-6 dark:bg-zinc-900">
          <div id="toolHead"></div>
          <div id="toolBody" class="mt-4"></div>
        </div>
        <div class="mt-4 rounded-2xl bg-white p-4 sm:p-5 dark:bg-zinc-900">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-zinc-900 dark:text-white">Related tools</h2>
          </div>
          <div class="mt-3 grid gap-2 sm:grid-cols-3">
            ${suggest(id).map((t) => rowCard(t)).join('')}
          </div>
        </div>`
      const head = view.querySelector<HTMLElement>('#toolHead')!
      const metaFull = getTool(id)!
      head.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-lg font-bold tracking-tight text-zinc-900 md:text-xl dark:text-white">${metaFull.name}</h1>
          <span class="grid h-8 w-8 place-items-center rounded-lg text-zinc-400" title="${metaFull.desc}">${ic('ph-info', 'text-lg')}</span>
        </div>
        <p class="mt-0.5 max-w-xl text-[13px] text-zinc-500 dark:text-zinc-400">${metaFull.desc}</p>`
      RENDERERS[id](view.querySelector<HTMLElement>('#toolBody')!)
    }
  }
  observeReveals(view)
}

function suggest(id: string): typeof TOOLS {
  const cur = getTool(id)!
  return TOOLS.filter((t) => t.id !== id && t.category === cur.category).slice(0, 3)
}

function rowCard(t: (typeof TOOLS)[number]): string {
  return `
  <a href="#/${t.id}" data-toolcard data-name="${t.name} ${t.tagline} ${t.desc} ${t.id}" class="tool-card group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 hover:border-blue-400 hover:shadow-md hover:shadow-blue-600/5 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-blue-400/60">
    ${tileIcon(t, 'h-10 w-10 text-xl')}
    <span class="min-w-0 flex-1"><span class="block truncate text-sm font-bold text-zinc-900 dark:text-white">${t.name}</span><span class="block truncate font-mono text-[11px] text-zinc-400">${t.tagline}</span></span>
    <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-950 text-sm text-white transition-colors group-hover:bg-blue-600 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-blue-500 dark:group-hover:text-white">${ic('ph-arrow-right', 'text-base')}</span>
  </a>`
}

function renderHome(v: HTMLElement): void {
  const popularIds = ['image-to-pdf', 'pdf-to-image', 'pdf-merge', 'image-compress']
  const popular = popularIds.map((id) => getTool(id)!)
  const rest = TOOLS.filter((t) => !popularIds.includes(t.id))

  v.innerHTML = `
  <div class="grid items-start gap-4 xl:grid-cols-[1fr_300px]">
    <div class="rounded-2xl bg-white p-4 sm:p-6 dark:bg-zinc-900">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-bold tracking-tight text-zinc-900 md:text-xl dark:text-white">What do you want to convert today?</h1>
          <p class="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">Ten free tools. Files never leave your device.</p>
        </div>
        <div class="flex w-full max-w-xs items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 sm:w-64 dark:bg-white/5">
          <span class="text-zinc-400">${ic('ph-magnifying-glass', 'text-base')}</span>
          <input id="search" placeholder="Search tools…" aria-label="Search tools" class="w-full bg-transparent font-mono text-xs text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white" />
        </div>
      </div>
      <div class="mt-4 grid gap-2 sm:grid-cols-2">
        ${popular.map((t) => `
        <a href="#/${t.id}" data-toolcard data-name="${t.name} ${t.tagline} ${t.desc} ${t.id}" class="tool-card reveal group flex items-center gap-3 rounded-xl border border-zinc-200 p-3.5 hover:border-blue-400 hover:shadow-md hover:shadow-blue-600/5 dark:border-white/10 dark:hover:border-blue-400/60">
          ${tileIcon(t, 'h-11 w-11 text-2xl')}
          <span class="min-w-0 flex-1"><span class="flex items-center gap-1.5 text-sm font-bold text-zinc-900 dark:text-white">${t.name} ${t.badge ? `<span class="rounded-full bg-blue-600/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:text-blue-300">${t.badge}</span>` : ''}</span><span class="mt-0.5 block truncate font-mono text-[11px] text-zinc-400">${t.tagline}</span></span>
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-950 text-sm text-white transition-colors group-hover:bg-blue-600 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-blue-500 dark:group-hover:text-white">${ic('ph-arrow-right', 'text-base')}</span>
        </a>`).join('')}
      </div>
      <div class="mb-2 mt-5 flex items-center justify-between">
        <h2 class="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">All tools · ${TOOLS.length}</h2>
      </div>
      <div id="allGrid" class="grid gap-2 sm:grid-cols-2">
        ${rest.map((t) => `<div class="reveal">${rowCard(t)}</div>`).join('')}
      </div>
      <div id="noResults" class="hidden rounded-xl border border-dashed border-zinc-300 p-6 text-center font-mono text-xs text-zinc-400">no matches — clear the search.</div>
      <ol class="mt-5 grid gap-2 border-t border-zinc-100 pt-4 sm:grid-cols-3 dark:border-white/10">
        ${[
          ['01', 'Pick a tool', 'Every page guides you.'],
          ['02', 'Drop files', 'Reorder, tune options.'],
          ['03', 'Download', 'Save result or ZIP.'],
        ].map(([n, title, body]) => `<li class="flex items-center gap-3 rounded-xl bg-zinc-100 px-3.5 py-3 dark:bg-white/5"><span class="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">${n}</span><span><span class="block text-[13px] font-bold text-zinc-800 dark:text-zinc-100">${title}</span><span class="block text-xs text-zinc-400">${body}</span></span></li>`).join('')}
      </ol>
    </div>
    <div class="grid gap-4">
      <div class="reveal aurora overflow-hidden rounded-2xl p-5 text-white">
        <span class="inline-block rounded-full bg-white/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]">New</span>
        <h2 class="mt-3 text-xl font-extrabold tracking-tight">Batch mode</h2>
        <p class="mt-1 text-[13px] leading-relaxed text-blue-50">Convert up to 50 files at once and download everything as a single ZIP.</p>
        <a href="#/image-convert" class="btn-press mt-4 block rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold text-zinc-900 hover:bg-blue-50">Try it now</a>
      </div>
      <div class="reveal rounded-2xl bg-white p-4 dark:bg-zinc-900" style="--reveal-delay:100ms">
        <h2 class="px-1 text-sm font-bold text-zinc-900 dark:text-white">Popular right now</h2>
        <div class="mt-2 grid gap-1">
          ${['pdf-to-text', 'image-to-pdf', 'pdf-split', 'text-to-pdf'].map((id) => {
            const t = getTool(id)!
            return `<a href="#/${t.id}" class="group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-zinc-100 dark:hover:bg-white/5">${tileIcon(t, 'h-9 w-9 text-lg')}<span class="min-w-0 flex-1"><span class="block truncate text-[13px] font-bold text-zinc-800 dark:text-zinc-100">${t.name}</span><span class="block truncate font-mono text-[11px] text-zinc-400">${t.tagline}</span></span><span class="text-zinc-300 transition-colors group-hover:text-blue-600 dark:text-zinc-600 dark:group-hover:text-blue-400">${ic('ph-arrow-right', 'text-base')}</span></a>`
          }).join('')}
        </div>
      </div>
      <div class="reveal rounded-2xl bg-zinc-950 p-4 text-white dark:bg-lime-300 dark:text-zinc-950" style="--reveal-delay:160ms">
        <div class="flex items-center gap-2 text-sm font-bold">${ic('ph-shield-check', 'text-lg')} 100% private</div>
        <p class="mt-1 text-xs leading-relaxed opacity-70">No uploads, no accounts, no watermarks. Conversion runs on your device.</p>
      </div>
    </div>
  </div>`

  const search = v.querySelector<HTMLInputElement>('#search')!
  const noResults = v.querySelector<HTMLElement>('#noResults')!

  v.querySelectorAll<HTMLElement>('[data-toolcard]').forEach((a) => {
    const wrap = a.classList.contains('reveal') ? a : a.parentElement!
    wrap.setAttribute('data-search', (a.getAttribute('data-name') ?? '').toLowerCase())
    if (wrap !== a) a.removeAttribute('data-toolcard')
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
