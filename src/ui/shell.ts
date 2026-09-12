import { TOOLS } from '../data/tools.ts'
import { formatBytes } from '../lib/files.ts'
import { ic } from './icons.ts'

export { ic }

export function toast(msg: string, kind: 'ok' | 'err' | 'info' = 'info'): void {
  const wrap = document.getElementById('toasts')
  if (!wrap) return
  const el = document.createElement('div')
  const color =
    kind === 'ok'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : kind === 'err'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
        : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
  const icon = kind === 'ok' ? 'ph-check-circle' : kind === 'err' ? 'ph-warning-circle' : 'ph-info'
  el.className = `toast pointer-events-auto flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${color} bg-white dark:bg-slate-900`
  el.innerHTML = `<span class="mt-0.5 text-base">${ic(icon, 'text-base')}</span><span class="font-medium">${msg}</span>`
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
  const isDark = document.documentElement.classList.contains('dark')

  const dropItem = (id: string, icon: string, name: string, tagline: string, active: boolean): string =>
    `<a href="#/${id}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${active ? 'bg-indigo-50 dark:bg-indigo-950/50' : ''}"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">${ic(icon, 'text-lg')}</span><span class="min-w-0"><span class="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">${name}</span><span class="block truncate text-xs text-slate-500">${tagline}</span></span></a>`

  root.innerHTML = `
  <header class="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
      <a href="#/" class="btn-press flex items-center gap-2.5">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg text-white shadow-md shadow-indigo-500/25">${ic('ph-lightning', 'text-lg')}</span>
        <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Easy<span class="text-indigo-600 dark:text-indigo-400">Convert</span></span>
      </a>
      <nav class="ml-3 hidden items-center gap-1 md:flex" aria-label="Tools">
        <div class="group relative">
          <button class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">${ic('ph-image', 'text-base')} Images ${ic('ph-caret-down', 'text-xs')}</button>
          <div class="invisible absolute left-0 top-full w-72 translate-y-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl shadow-slate-900/5 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900">
            ${imgTools.map((t) => dropItem(t.id, t.icon, t.name, t.tagline, activeId === t.id)).join('')}
          </div>
        </div>
        <div class="group relative">
          <button class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">${ic('ph-file-pdf', 'text-base')} PDF ${ic('ph-caret-down', 'text-xs')}</button>
          <div class="invisible absolute left-0 top-full w-72 translate-y-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl shadow-slate-900/5 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900">
            ${pdfTools.map((t) => dropItem(t.id, t.icon, t.name, t.tagline, activeId === t.id)).join('')}
          </div>
        </div>
        <a href="#/" class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">All tools</a>
      </nav>
      <div class="ml-auto flex items-center gap-2">
        <span class="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 lg:inline-flex dark:text-emerald-300">${ic('ph-shield-check', 'text-sm')} Private — files never leave your device</span>
        <button id="themeBtn" title="Toggle color theme" aria-label="Toggle color theme" class="btn-press grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">${ic(isDark ? 'ph-sun' : 'ph-moon', 'text-lg')}</button>
        <button id="menuBtn" aria-label="Open menu" class="btn-press grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 md:hidden dark:border-slate-700 dark:text-slate-300">${ic('ph-list', 'text-lg')}</button>
      </div>
    </div>
    <div id="mobileMenu" class="hidden border-t border-slate-200 px-4 py-3 dark:border-slate-800 md:hidden">
      <div class="grid gap-1">
        ${TOOLS.map((t) => `<a href="#/${t.id}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">${ic(t.icon, 'text-base')}</span><span class="text-sm font-semibold">${t.name}</span><span class="ml-auto truncate text-xs text-slate-400">${t.tagline}</span></a>`).join('')}
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
  <footer class="border-t border-slate-200 py-12 dark:border-slate-800">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.2fr_1fr_1fr]">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">${ic('ph-lightning', 'text-base')}</span>
          <span class="font-bold text-slate-900 dark:text-white">EasyConvert</span>
        </div>
        <p class="mt-3 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">Free in-browser file conversion. No uploads, no accounts, no watermarks. Your files stay on your device.</p>
      </div>
      <nav aria-label="PDF tools">
        <div class="text-sm font-bold text-slate-700 dark:text-slate-200">PDF tools</div>
        <div class="mt-3 grid gap-2 text-sm">${TOOLS.filter((t) => t.category === 'PDF').map((t) => `<a class="flex items-center gap-2 text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400" href="#/${t.id}">${ic(t.icon, 'text-base')} ${t.name}</a>`).join('')}</div>
      </nav>
      <nav aria-label="Image tools">
        <div class="text-sm font-bold text-slate-700 dark:text-slate-200">Image tools</div>
        <div class="mt-3 grid gap-2 text-sm">${TOOLS.filter((t) => t.category === 'Image').map((t) => `<a class="flex items-center gap-2 text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400" href="#/${t.id}">${ic(t.icon, 'text-base')} ${t.name}</a>`).join('')}</div>
      </nav>
    </div>
    <div class="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 pt-6 text-xs text-slate-400 dark:border-slate-800/60">
      <span>EasyConvert — runs entirely in your browser</span>
      <span>Static site, free hosting, no backend</span>
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
    <div id="dz" class="dz cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 sm:p-10 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-md shadow-indigo-600/25">${ic('ph-upload-simple', 'text-2xl')}</div>
      <div class="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">Drag and drop files here</div>
      <div class="mt-1 text-sm text-slate-500">or <span class="font-semibold text-indigo-600 dark:text-indigo-400">browse your files</span> · ${opts.hint ?? accept}</div>
      <div class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">${ic('ph-lock-key', 'text-xs')} Max ${maxMB} MB per file · never uploaded</div>
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
      row.className = 'flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900'
      const badge = document.createElement('span')
      badge.className = 'grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
      badge.innerHTML = ic(fileIcon(f), 'text-lg')
      const mid = document.createElement('span')
      mid.className = 'min-w-0 flex-1'
      const name = document.createElement('span')
      name.className = 'block truncate text-sm font-semibold text-slate-800 dark:text-slate-100'
      name.textContent = f.name
      const size = document.createElement('span')
      size.className = 'block text-xs text-slate-400'
      size.textContent = formatBytes(f.size)
      mid.appendChild(name)
      mid.appendChild(size)
      row.appendChild(badge)
      row.appendChild(mid)
      if (multiple) {
        const up = document.createElement('button')
        up.className = 'btn-press rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
        up.title = 'Move up'
        up.setAttribute('aria-label', `Move ${f.name} up`)
        up.innerHTML = ic('ph-arrow-up', 'text-base')
        up.addEventListener('click', (e) => {
          e.stopPropagation()
          move(i, -1)
        })
        const down = document.createElement('button')
        down.className = 'btn-press rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
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
      del.className = 'btn-press rounded-lg px-2 py-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400'
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
    <span class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">${ic(meta.icon, 'text-3xl')}</span>
    <div class="min-w-0">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">${meta.name}</h1>
      <p class="mt-1 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">${meta.desc}</p>
      <div class="mt-2.5 flex flex-wrap gap-2 text-xs">
        <span class="inline-flex items-center gap-1 rounded-full bg-indigo-600/10 px-2.5 py-1 font-semibold text-indigo-700 dark:text-indigo-300">${meta.tagline}</span>
        <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-700 dark:text-emerald-300">${ic('ph-lock-key', 'text-xs')} In-browser and private</span>
      </div>
    </div>
  </div>`
}

export function progressBarHTML(): string {
  return `
  <div id="progWrap" class="mt-4 hidden" role="status" aria-live="polite">
    <div class="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400"><span id="progLabel">Working…</span><span id="progPct">0%</span></div>
    <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div id="progBar" class="h-full w-0 rounded-full bg-indigo-600 transition-all dark:bg-indigo-500"></div>
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
