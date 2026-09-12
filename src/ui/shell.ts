import { TOOLS, type ToolMeta } from '../data/tools.ts'
import { formatBytes } from '../lib/files.ts'
import { ic } from './icons.ts'

export { ic }

/** Pastel file-type tile from tool metadata. */
export function tileIcon(meta: Pick<ToolMeta, 'icon' | 'tile'>, size = 'h-10 w-10 text-xl'): string {
  return `<span class="grid ${size} shrink-0 place-items-center rounded-xl ${meta.tile}">${ic(meta.icon, 'text-xl')}</span>`
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
        : 'border-zinc-200 bg-white text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300'
  const icon = kind === 'ok' ? 'ph-check-circle' : kind === 'err' ? 'ph-warning-circle' : 'ph-info'
  const iconColor = kind === 'info' ? 'text-blue-600 dark:text-blue-400' : ''
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

function navItem(id: string, icon: string, label: string, active: boolean): string {
  return `<a href="#/${id}" class="side-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${active ? 'bg-white text-zinc-900 shadow-sm shadow-zinc-950/5 dark:bg-white/10 dark:text-white' : 'text-zinc-500 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'}"><span class="text-lg ${active ? 'text-blue-600 dark:text-blue-400' : ''}">${ic(icon, 'text-lg')}</span>${label}</a>`
}

/** Desktop sidebar + mobile top bar + drawer. Mount once; call per route for active state. */
export function renderSidebar(root: HTMLElement, activeId?: string): void {
  const imgTools = TOOLS.filter((t) => t.category === 'Image')
  const pdfTools = TOOLS.filter((t) => t.category === 'PDF')
  const isDark = document.documentElement.classList.contains('dark')

  root.innerHTML = `
  <div class="border-b border-zinc-200/70 px-4 py-3 lg:hidden dark:border-white/10">
    <div class="flex items-center gap-2.5">
      <span class="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-lg text-white">${ic('ph-lightning', 'text-lg')}</span>
      <span class="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">EasyConvert</span>
      <span class="ml-auto flex items-center gap-2">
        <button id="mThemeBtn" aria-label="Toggle color theme" class="btn-press grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 text-zinc-600 dark:border-white/10 dark:text-zinc-300">${ic(isDark ? 'ph-sun' : 'ph-moon', 'text-lg')}</button>
        <button id="mMenuBtn" aria-label="Open menu" class="btn-press grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">${ic('ph-list', 'text-lg')}</button>
      </span>
    </div>
    <div id="mDrawer" class="hidden pt-3">
      <div class="grid gap-0.5 rounded-2xl border border-zinc-200 bg-white p-2 dark:border-white/10 dark:bg-zinc-900">
        ${navItem('', 'ph-house', 'Home', !activeId)}
        <div class="px-3 pb-1 pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Convert</div>
        ${imgTools.map((t) => navItem(t.id, t.icon, t.name, activeId === t.id)).join('')}
        <div class="px-3 pb-1 pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">PDF tools</div>
        ${pdfTools.map((t) => navItem(t.id, t.icon, t.name, activeId === t.id)).join('')}
      </div>
    </div>
  </div>
  <aside class="sticky top-4 hidden max-h-[calc(100vh-2rem)] w-60 shrink-0 flex-col gap-5 overflow-y-auto pr-1 lg:flex lg:h-full">
    <a href="#/" class="btn-press flex items-center gap-2.5 px-1 pt-1">
      <span class="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-lg text-white shadow-sm">${ic('ph-lightning', 'text-lg')}</span>
      <span class="leading-tight"><span class="block text-[15px] font-extrabold tracking-tight text-zinc-900 dark:text-white">EasyConvert</span><span class="block font-mono text-[10px] font-medium text-zinc-400">10 tools · no uploads</span></span>
    </a>
    <nav class="grid gap-0.5" aria-label="Primary">
      ${navItem('', 'ph-house', 'Home', !activeId)}
    </nav>
    <nav class="grid gap-0.5" aria-label="Convert">
      <div class="px-3 pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Convert</div>
      ${imgTools.map((t) => navItem(t.id, t.icon, t.name, activeId === t.id)).join('')}
    </nav>
    <nav class="grid gap-0.5" aria-label="PDF tools">
      <div class="px-3 pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">PDF tools</div>
      ${pdfTools.map((t) => navItem(t.id, t.icon, t.name, activeId === t.id)).join('')}
    </nav>
    <div class="mt-auto grid gap-2.5 pb-1">
      <div class="rounded-2xl bg-blue-600 p-4 text-white">
        <div class="flex items-center gap-2 text-sm font-bold">${ic('ph-shield-check', 'text-lg')} Private session</div>
        <p class="mt-1 text-xs leading-relaxed text-blue-100">Files are converted on your device and never uploaded.</p>
      </div>
      <button id="dThemeBtn" class="btn-press flex items-center justify-between rounded-xl border border-zinc-200 bg-white/60 px-3.5 py-2.5 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-white">
        <span class="flex items-center gap-2">${ic(isDark ? 'ph-sun' : 'ph-moon', 'text-base')} ${isDark ? 'Light mode' : 'Dark mode'}</span>
        <span class="font-mono text-[11px] text-zinc-400">${isDark ? 'off' : 'on'}</span>
      </button>
    </div>
  </aside>`

  const applyTheme = (dark: boolean): void => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
    try {
      localStorage.setItem('easyconvert-theme', dark ? 'dark' : 'light')
    } catch { /* ignore */ }
  }
  const refresh = (): void => renderSidebar(root, currentRouteId())
  root.querySelector<HTMLButtonElement>('#dThemeBtn')?.addEventListener('click', () => {
    applyTheme(!document.documentElement.classList.contains('dark'))
    refresh()
  })
  root.querySelector<HTMLButtonElement>('#mThemeBtn')?.addEventListener('click', () => {
    applyTheme(!document.documentElement.classList.contains('dark'))
    refresh()
  })
  const drawer = root.querySelector<HTMLElement>('#mDrawer')!
  root.querySelector<HTMLButtonElement>('#mMenuBtn')?.addEventListener('click', () => drawer.classList.toggle('hidden'))
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => drawer.classList.add('hidden')))
}

function currentRouteId(): string | undefined {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  const id = hash.replace(/^\//, '').split('?')[0]
  return !id || id === '/' ? undefined : id
}

export function renderFooter(root: HTMLElement): void {
  root.innerHTML = `
  <footer class="px-4 pb-6 pt-2 md:px-6">
    <div class="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 pt-4 font-mono text-[11px] text-zinc-400 dark:border-white/10">
      <span>easyconvert — runs entirely in your browser</span>
      <span class="flex gap-4"><a class="hover:text-blue-600 dark:hover:text-blue-400" href="#/image-to-pdf">image→pdf</a><a class="hover:text-blue-600 dark:hover:text-blue-400" href="#/pdf-merge">merge</a><a class="hover:text-blue-600 dark:hover:text-blue-400" href="#/pdf-to-text">extract</a></span>
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
    <div id="dz" class="dz cursor-pointer rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/70 p-8 text-center hover:border-blue-500 hover:bg-blue-50 sm:p-10 dark:border-blue-400/40 dark:bg-blue-400/5 dark:hover:border-blue-300">
      <div class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-xl text-zinc-700 shadow-sm dark:bg-white/10 dark:text-zinc-200">${ic('ph-upload-simple', 'text-xl')}</div>
      <div class="mt-3 text-[15px] font-semibold text-zinc-700 dark:text-zinc-200">Click or drag your files here to convert</div>
      <div class="mt-1 font-mono text-[11px] text-zinc-400">${opts.hint ?? accept} · max ${maxMB} MB / file</div>
      <input id="dzInput" type="file" accept="${accept}" ${multiple ? 'multiple' : ''} class="hidden" />
    </div>
    <div id="dzList" class="mt-3 grid gap-2"></div>`

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
      row.className = 'flex items-center gap-3 rounded-xl bg-zinc-100 px-3 py-2.5 dark:bg-white/5'
      const badge = document.createElement('span')
      badge.className = 'grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-300'
      badge.innerHTML = ic(fileIcon(f), 'text-lg')
      const mid = document.createElement('span')
      mid.className = 'min-w-0 flex-1'
      const name = document.createElement('span')
      name.className = 'block truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100'
      name.textContent = f.name
      const size = document.createElement('span')
      size.className = 'block font-mono text-[11px] text-zinc-400'
      size.textContent = `${formatBytes(f.size)} · ready`
      mid.appendChild(name)
      mid.appendChild(size)
      row.appendChild(badge)
      row.appendChild(mid)
      if (multiple) {
        const up = document.createElement('button')
        up.className = 'btn-press rounded-lg px-1.5 py-1 text-zinc-400 hover:bg-white hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200'
        up.title = 'Move up'
        up.setAttribute('aria-label', `Move ${f.name} up`)
        up.innerHTML = ic('ph-arrow-up', 'text-base')
        up.addEventListener('click', (e) => {
          e.stopPropagation()
          move(i, -1)
        })
        const down = document.createElement('button')
        down.className = 'btn-press rounded-lg px-1.5 py-1 text-zinc-400 hover:bg-white hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200'
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
      del.className = 'btn-press rounded-lg px-1.5 py-1 text-zinc-400 hover:bg-white hover:text-rose-600 dark:hover:bg-white/10 dark:hover:text-rose-400'
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

export function toolHeader(meta: { icon: string; tile: string; name: string; desc: string; tagline: string }): string {
  return `
  <div class="flex items-center justify-between gap-3">
    <h1 class="text-lg font-bold tracking-tight text-zinc-900 md:text-xl dark:text-white">${meta.name}</h1>
    <button class="btn-press grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/5 dark:hover:text-zinc-200" title="About this tool" aria-label="About this tool">${ic('ph-info', 'text-lg')}</button>
  </div>
  <p class="mt-0.5 max-w-xl text-[13px] text-zinc-500 dark:text-zinc-400">${meta.desc}</p>`
}

export function progressBarHTML(): string {
  return `
  <div id="progWrap" class="mt-4 hidden" role="status" aria-live="polite">
    <div class="flex justify-between font-mono text-[11px] font-medium text-zinc-500 dark:text-zinc-400"><span id="progLabel">Working…</span><span id="progPct">0%</span></div>
    <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
      <div id="progBar" class="h-full w-0 rounded-full bg-blue-600 transition-all dark:bg-blue-400"></div>
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
