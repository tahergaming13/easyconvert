import { TOOLS } from '../data/tools.ts'
import { formatBytes } from '../lib/files.ts'
import { ic } from './icons.ts'

export { ic }

/** Ink chip tile: black square + lime glyph, inverted in dark mode. */
export function tile(cls = 'h-10 w-10 text-xl'): string {
  return `grid ${cls} shrink-0 place-items-center rounded-xl bg-zinc-950 text-lime-300 dark:bg-lime-300 dark:text-zinc-950`
}

export function toast(msg: string, kind: 'ok' | 'err' | 'info' = 'info'): void {
  const wrap = document.getElementById('toasts')
  if (!wrap) return
  const el = document.createElement('div')
  const color =
    kind === 'ok'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : kind === 'err'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
        : 'border-zinc-300 bg-white text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300'
  const icon = kind === 'ok' ? 'ph-check-circle' : kind === 'err' ? 'ph-warning-circle' : 'ph-info'
  const iconColor = kind === 'info' ? 'text-lime-700 dark:text-lime-300' : ''
  el.className = `toast pointer-events-auto flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${color}`
  el.innerHTML = `<span class="mt-0.5 text-base ${iconColor}">${ic(icon, 'text-base')}</span><span class="font-medium">${msg}</span>`
  wrap.appendChild(el)
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s'
    el.style.opacity = '0'
    el.style.transform = 'translateY(8px)'
    setTimeout(() => el.remove(), 320)
  }, 3400)
}

export function renderTopbar(root: HTMLElement, activeId?: string): void {
  const pdfTools = TOOLS.filter((t) => t.category === 'PDF')
  const imgTools = TOOLS.filter((t) => t.category === 'Image')

  const dropItem = (id: string, icon: string, name: string, tagline: string, active: boolean): string =>
    `<a href="#/${id}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 ${active ? 'bg-lime-300/25 dark:bg-lime-300/10' : ''}"><span class="${tile('h-9 w-9 text-lg')}">${ic(icon, 'text-lg')}</span><span class="min-w-0"><span class="block truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">${name}</span><span class="block truncate text-xs text-zinc-500">${tagline}</span></span></a>`

  root.innerHTML = `
  <header class="sticky top-0 z-40 border-b border-zinc-200/80 bg-[#fafaf9]/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#09090b]/85">
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
      <a href="#/" class="btn-press flex items-center gap-2.5">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-lg text-lime-300 dark:bg-lime-300 dark:text-zinc-950">${ic('ph-lightning', 'text-lg')}</span>
        <span class="font-mono text-base font-bold tracking-tight text-zinc-900 dark:text-white">easy<span class="text-lime-700 dark:text-lime-300">convert</span></span>
      </a>
      <nav class="ml-3 hidden items-center gap-1 md:flex" aria-label="Tools">
        <div class="group relative">
          <button class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white">${ic('ph-image', 'text-base')} Images ${ic('ph-caret-down', 'text-xs')}</button>
          <div class="invisible absolute left-0 top-full w-72 tranzinc-y-1 rounded-2xl border border-zinc-200 bg-white p-2 opacity-0 shadow-xl shadow-zinc-950/5 transition-all group-hover:visible group-hover:tranzinc-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-zinc-900">
            ${imgTools.map((t) => dropItem(t.id, t.icon, t.name, t.tagline, activeId === t.id)).join('')}
          </div>
        </div>
        <div class="group relative">
          <button class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white">${ic('ph-file-pdf', 'text-base')} PDF ${ic('ph-caret-down', 'text-xs')}</button>
          <div class="invisible absolute left-0 top-full w-72 tranzinc-y-1 rounded-2xl border border-zinc-200 bg-white p-2 opacity-0 shadow-xl shadow-zinc-950/5 transition-all group-hover:visible group-hover:tranzinc-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-zinc-900">
            ${pdfTools.map((t) => dropItem(t.id, t.icon, t.name, t.tagline, activeId === t.id)).join('')}
          </div>
        </div>
        <a href="#/" class="rounded-xl px-3 py-2 font-mono text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white">index</a>
      </nav>
      <div class="ml-auto flex items-center gap-2">
        <span class="hidden items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1 font-mono text-[11px] font-medium text-zinc-500 lg:inline-flex dark:border-white/10 dark:text-zinc-400">${ic('ph-shield-check', 'text-sm')} no-upload architecture</span>
        <button id="themeBtn" title="Toggle color theme" aria-label="Toggle color theme" class="btn-press grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5">${ic(document.documentElement.classList.contains('dark') ? 'ph-sun' : 'ph-moon', 'text-lg')}</button>
        <button id="menuBtn" aria-label="Open menu" class="btn-press grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 text-zinc-600 md:hidden dark:border-white/10 dark:text-zinc-300">${ic('ph-list', 'text-lg')}</button>
      </div>
    </div>
    <div id="mobileMenu" class="hidden border-t border-zinc-200 px-4 py-3 md:hidden dark:border-white/10">
      <div class="grid gap-1">
        ${TOOLS.map((t) => `<a href="#/${t.id}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-white/5"><span class="${tile('h-8 w-8 text-base')}">${ic(t.icon, 'text-base')}</span><span class="text-sm font-semibold">${t.name}</span><span class="ml-auto truncate font-mono text-[11px] text-zinc-400">${t.tagline}</span></a>`).join('')}
      </div>
    </div>
  </header>`

  const themeBtn = root.querySelector<HTMLButtonElement>('#themeBtn')!
  themeBtn.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark')
    document.documentElement.classList.toggle('light', !dark)
    try {
      localStorage.setItem('easyconvert-theme', dark ? 'dark' : 'light')
    } catch { /* ignore */ }
    themeBtn.innerHTML = ic(dark ? 'ph-sun' : 'ph-moon', 'text-lg')
  })
  const menuBtn = root.querySelector<HTMLButtonElement>('#menuBtn')!
  const mobileMenu = root.querySelector<HTMLElement>('#mobileMenu')!
  menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'))
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => mobileMenu.classList.add('hidden')))
}

export function renderFooter(root: HTMLElement): void {
  root.innerHTML = `
  <footer class="border-t border-zinc-200 py-12 dark:border-white/10">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.2fr_1fr_1fr]">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="grid h-8 w-8 place-items-center rounded-xl bg-zinc-950 text-lime-300 dark:bg-lime-300 dark:text-zinc-950">${ic('ph-lightning', 'text-base')}</span>
          <span class="font-mono text-sm font-bold text-zinc-900 dark:text-white">easyconvert</span>
        </div>
        <p class="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">Free in-browser file conversion. No uploads, no accounts, no watermarks. Your files stay on your device.</p>
      </div>
      <nav aria-label="PDF tools">
        <div class="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">PDF tools</div>
        <div class="mt-3 grid gap-2 text-sm">${TOOLS.filter((t) => t.category === 'PDF').map((t) => `<a class="flex items-center gap-2 text-zinc-500 transition-colors hover:text-lime-700 dark:text-zinc-400 dark:hover:text-lime-300" href="#/${t.id}">${ic(t.icon, 'text-base')} ${t.name}</a>`).join('')}</div>
      </nav>
      <nav aria-label="Image tools">
        <div class="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">Image tools</div>
        <div class="mt-3 grid gap-2 text-sm">${TOOLS.filter((t) => t.category === 'Image').map((t) => `<a class="flex items-center gap-2 text-zinc-500 transition-colors hover:text-lime-700 dark:text-zinc-400 dark:hover:text-lime-300" href="#/${t.id}">${ic(t.icon, 'text-base')} ${t.name}</a>`).join('')}</div>
      </nav>
    </div>
    <div class="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-4 pt-6 font-mono text-[11px] text-zinc-400 dark:border-white/10">
      <span>easyconvert — runs entirely in your browser</span>
      <span>static site · no backend</span>
    </div>
  </footer>`
}

export interface DropState {
  files: File[]
  setFiles: (f: File[]) => void
  getFiles: () => File[]
}

function fileIcon(f: File): string {
  if (f.type.startsWith('image/')) return 'ph-image'
  if (f.type === 'application/pdf') return 'ph-file-pdf'
  return 'ph-file-text'
}

/** Creates a dropzone + file list UI inside container, returns control object. */
export function createDropzone(opts: {
  container: HTMLElement
  accept: string
  multiple: boolean
  maxMB?: number
  hint?: string
}): DropState & { listEl: HTMLElement } {
  const { container, accept, multiple, maxMB = 100 } = opts
  let files: File[] = []

  container.innerHTML = `
    <div id="dz" class="dz cursor-pointer rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-100/60 p-8 text-center hover:border-lime-500 hover:bg-lime-300/10 sm:p-10 dark:border-white/15 dark:bg-white/[0.03] dark:hover:border-lime-300 dark:hover:bg-lime-300/5">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-zinc-950 text-2xl text-lime-300 dark:bg-lime-300 dark:text-zinc-950">${ic('ph-upload-simple', 'text-2xl')}</div>
      <div class="mt-4 text-base font-bold text-zinc-800 dark:text-zinc-100">Drag and drop files here</div>
      <div class="mt-1 text-sm text-zinc-500">or <span class="font-semibold text-lime-700 dark:text-lime-300">browse your files</span> · ${opts.hint ?? accept}</div>
      <div class="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-[11px] font-medium text-zinc-500 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400">${ic('ph-lock-key', 'text-xs')} max ${maxMB} MB / file · never uploaded</div>
      <input id="dzInput" type="file" accept="${accept}" ${multiple ? 'multiple' : ''} class="hidden" />
    </div>
    <div id="dzList" class="mt-4 grid gap-2"></div>`

  const dz = container.querySelector<HTMLElement>('#dz')!
  const input = container.querySelector<HTMLInputElement>('#dzInput')!
  const listEl = container.querySelector<HTMLElement>('#dzList')!

  function renderList(): void {
    if (files.length === 0) {
      listEl.innerHTML = ''
      return
    }
    listEl.innerHTML = ''
    files.forEach((f, i) => {
      const row = document.createElement('div')
      row.className = 'flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-zinc-900'
      const badge = document.createElement('span')
      badge.className = 'grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-300'
      badge.innerHTML = ic(fileIcon(f), 'text-lg')
      const mid = document.createElement('span')
      mid.className = 'min-w-0 flex-1'
      const name = document.createElement('span')
      name.className = 'block truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100'
      name.textContent = f.name
      const size = document.createElement('span')
      size.className = 'block font-mono text-[11px] text-zinc-400'
      size.textContent = formatBytes(f.size)
      mid.appendChild(name)
      mid.appendChild(size)
      row.appendChild(badge)
      row.appendChild(mid)
      if (multiple) {
        const up = document.createElement('button')
        up.className = 'btn-press rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/5 dark:hover:text-zinc-200'
        up.title = 'Move up'
        up.setAttribute('aria-label', `Move ${f.name} up`)
        up.innerHTML = ic('ph-arrow-up', 'text-base')
        up.addEventListener('click', (e) => {
          e.stopPropagation()
          move(i, -1)
        })
        const down = document.createElement('button')
        down.className = 'btn-press rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/5 dark:hover:text-zinc-200'
        down.title = 'Move down'
        down.setAttribute('aria-label', `Move ${f.name} down`)
        down.innerHTML = ic('ph-arrow-down', 'text-base')
        down.addEventListener('click', (e) => {
          e.stopPropagation()
          move(i, 1)
        })
        row.appendChild(up)
        row.appendChild(down)
      }
      const del = document.createElement('button')
      del.className = 'btn-press rounded-lg px-2 py-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400'
      del.title = 'Remove'
      del.setAttribute('aria-label', `Remove ${f.name}`)
      del.innerHTML = ic('ph-x', 'text-base')
      del.addEventListener('click', (e) => {
        e.stopPropagation()
        setFiles(files.filter((_, j) => j !== i))
      })
      row.appendChild(del)
      listEl.appendChild(row)
    })
  }

  function move(i: number, d: number): void {
    const j = i + d
    if (j < 0 || j >= files.length) return
    const copy = [...files]
    const [item] = copy.splice(i, 1)
    copy.splice(j, 0, item)
    setFiles(copy)
  }

  function setFiles(f: File[]): void {
    files = f
    renderList()
    container.dispatchEvent(new CustomEvent('files-changed', { bubbles: true }))
  }

  function addIncoming(incoming: FileList | File[]): void {
    const arr = [...incoming]
    const ok: File[] = []
    for (const f of arr) {
      if (f.size > maxMB * 1024 * 1024) {
        toast(`"${f.name}" exceeds the ${maxMB} MB limit and was skipped.`, 'err')
        continue
      }
      ok.push(f)
    }
    if (ok.length === 0) return
    setFiles(multiple ? [...files, ...ok].slice(0, 50) : [ok[0]])
  }

  dz.addEventListener('click', () => input.click())
  input.addEventListener('change', () => {
    if (input.files) addIncoming(input.files)
    input.value = ''
  })
  ;['dragenter', 'dragover'].forEach((ev) =>
    dz.addEventListener(ev, (e) => {
      e.preventDefault()
      dz.classList.add('dz-active')
    }),
  )
  ;['dragleave', 'drop'].forEach((ev) =>
    dz.addEventListener(ev, (e) => {
      e.preventDefault()
      dz.classList.remove('dz-active')
    }),
  )
  dz.addEventListener('drop', (e) => {
    const dt = e.dataTransfer
    if (dt?.files?.length) addIncoming(dt.files)
  })

  return { files: [], setFiles: (f: File[]) => setFiles(f), getFiles: () => [...files], listEl }
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

export function toolHeader(meta: { icon: string; name: string; desc: string; tagline: string }): string {
  return `
  <div class="flex items-start gap-4">
    <span class="${tile('h-14 w-14 text-3xl')}">${ic(meta.icon, 'text-3xl')}</span>
    <div class="min-w-0">
      <div class="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-lime-700 dark:text-lime-300">${meta.tagline}</div>
      <h1 class="mt-1 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl dark:text-white">${meta.name}</h1>
      <p class="mt-1 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">${meta.desc}</p>
    </div>
  </div>`
}

export function progressBarHTML(): string {
  return `
  <div id="progWrap" class="mt-4 hidden" role="status" aria-live="polite">
    <div class="flex justify-between font-mono text-[11px] font-medium text-zinc-500 dark:text-zinc-400"><span id="progLabel">Working…</span><span id="progPct">0%</span></div>
    <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
      <div id="progBar" class="h-full w-0 rounded-full bg-lime-500 transition-all dark:bg-lime-300"></div>
    </div>
  </div>`
}

export function setProgress(pct: number, label?: string): void {
  const wrap = document.getElementById('progWrap')
  const bar = document.getElementById('progBar')
  const txt = document.getElementById('progPct')
  const lab = document.getElementById('progLabel')
  if (!wrap || !bar || !txt) return
  wrap.classList.remove('hidden')
  bar.style.width = `${Math.max(0, Math.min(100, pct))}%`
  txt.textContent = `${Math.round(pct)}%`
  if (label && lab) lab.textContent = label
}

export function hideProgress(): void {
  document.getElementById('progWrap')?.classList.add('hidden')
}

/** Fades `.reveal` children in on scroll. Safe no-op with reduced motion (CSS handles it). */
export function observeReveals(scope: ParentNode = document): void {
  const els = [...scope.querySelectorAll<HTMLElement>('.reveal:not([data-observed])')]
  if (els.length === 0) return
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add('in')
          io.unobserve(en.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )
  els.forEach((el) => {
    el.setAttribute('data-observed', '1')
    io.observe(el)
  })
}
