import { TOOLS } from '../data/tools.ts'
import { formatBytes } from '../lib/files.ts'

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
  el.className = `toast pointer-events-auto flex items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${color} bg-white dark:bg-slate-900`
  el.innerHTML = `<span class="mt-0.5">${kind === 'ok' ? '✅' : kind === 'err' ? '⛔' : 'ℹ️'}</span><span>${msg}</span>`
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

  root.innerHTML = `
  <header class="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
      <a href="#/" class="flex items-center gap-2.5 font-extrabold tracking-tight">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg text-white shadow-lg shadow-indigo-500/25">⚡</span>
        <span class="text-lg">Easy<span class="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">Convert</span></span>
      </a>
      <nav class="ml-4 hidden items-center gap-1 md:flex">
        <div class="group relative">
          <button class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">🖼️ Images ▾</button>
          <div class="invisible absolute left-0 top-full w-64 translate-y-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900">
            ${imgTools.map((t) => `<a href="#/${t.id}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 ${activeId === t.id ? 'bg-indigo-50 dark:bg-indigo-950/50' : ''}"><span class="text-xl">${t.icon}</span><span><span class="block text-sm font-semibold text-slate-800 dark:text-slate-100">${t.name}</span><span class="block text-xs text-slate-500">${t.tagline}</span></span></a>`).join('')}
          </div>
        </div>
        <div class="group relative">
          <button class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">📄 PDF ▾</button>
          <div class="invisible absolute left-0 top-full w-64 translate-y-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900">
            ${pdfTools.map((t) => `<a href="#/${t.id}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 ${activeId === t.id ? 'bg-indigo-50 dark:bg-indigo-950/50' : ''}"><span class="text-xl">${t.icon}</span><span><span class="block text-sm font-semibold text-slate-800 dark:text-slate-100">${t.name}</span><span class="block text-xs text-slate-500">${t.tagline}</span></span></a>`).join('')}
          </div>
        </div>
        <a href="#/" class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">All tools</a>
      </nav>
      <div class="ml-auto flex items-center gap-2">
        <span class="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 lg:flex dark:text-emerald-300">🔒 100% private — files never leave your device</span>
        <button id="themeBtn" title="Toggle theme" class="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-lg hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">${isDark ? '☀️' : '🌙'}</button>
        <button id="menuBtn" class="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 md:hidden dark:border-slate-700">☰</button>
      </div>
    </div>
    <div id="mobileMenu" class="hidden border-t border-slate-200 px-4 py-3 dark:border-slate-800 md:hidden">
      <div class="grid gap-1">
        ${TOOLS.map((t) => `<a href="#/${t.id}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"><span class="text-lg">${t.icon}</span><span class="text-sm font-medium">${t.name}</span><span class="ml-auto text-xs text-slate-400">${t.tagline}</span></a>`).join('')}
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
    themeBtn.textContent = dark ? '☀️' : '🌙'
  })
  const menuBtn = root.querySelector<HTMLButtonElement>('#menuBtn')!
  const mobileMenu = root.querySelector<HTMLElement>('#mobileMenu')!
  menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'))
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => mobileMenu.classList.add('hidden')))
}

export function renderFooter(root: HTMLElement): void {
  root.innerHTML = `
  <footer class="border-t border-slate-200 py-10 dark:border-slate-800">
    <div class="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
      <div>
        <div class="flex items-center gap-2 font-extrabold"><span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">⚡</span> EasyConvert</div>
        <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">Free in-browser converter. No uploads, no accounts, no watermarks. Your files stay on your device.</p>
      </div>
      <div>
        <div class="text-sm font-bold text-slate-700 dark:text-slate-200">PDF tools</div>
        <div class="mt-3 grid gap-1.5 text-sm">${TOOLS.filter((t) => t.category === 'PDF').map((t) => `<a class="text-slate-500 hover:text-indigo-500 dark:text-slate-400" href="#/${t.id}">${t.icon} ${t.name}</a>`).join('')}</div>
      </div>
      <div>
        <div class="text-sm font-bold text-slate-700 dark:text-slate-200">Image tools</div>
        <div class="mt-3 grid gap-1.5 text-sm">${TOOLS.filter((t) => t.category === 'Image').map((t) => `<a class="text-slate-500 hover:text-indigo-500 dark:text-slate-400" href="#/${t.id}">${t.icon} ${t.name}</a>`).join('')}</div>
      </div>
    </div>
    <div class="mx-auto mt-8 flex max-w-6xl items-center justify-between px-4 text-xs text-slate-400">
      <span>EasyConvert • runs fully offline-capable in your browser</span>
      <span>Deployable free on Vercel • no backend</span>
    </div>
  </footer>`
}

export interface DropState {
  files: File[]
  setFiles: (f: File[]) => void
  getFiles: () => File[]
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
    <div id="dz" class="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl text-white shadow-lg">📁</div>
      <div class="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">Drag & drop files here</div>
      <div class="mt-1 text-sm text-slate-500">or <span class="font-semibold text-indigo-600 dark:text-indigo-400">click to browse</span> • ${opts.hint ?? accept}</div>
      <div class="mt-1 text-xs text-slate-400">Max ${maxMB} MB per file • files never uploaded</div>
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
    listEl.innerHTML = files
      .map(
        (f, i) => `
      <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-lg dark:bg-slate-800">${f.type.startsWith('image/') ? '🖼️' : f.type === 'application/pdf' ? '📄' : '📝'}</span>
        <span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(f.name)}</span><span class="text-xs text-slate-400">${formatBytes(f.size)}</span></span>
        ${multiple ? `<button data-move="-1" data-i="${i}" class="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" title="Move up">↑</button><button data-move="1" data-i="${i}" class="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" title="Move down">↓</button>` : ''}
        <button data-del="${i}" class="rounded-lg px-2 py-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950">✕</button>
      </div>`,
      )
      .join('')
    listEl.querySelectorAll('[data-del]').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.stopPropagation()
        const idx = Number((b as HTMLElement).dataset.del)
        files = files.filter((_, j) => j !== idx)
        setFiles(files)
      }),
    )
    listEl.querySelectorAll('[data-move]').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.stopPropagation()
        const idx = Number((b as HTMLElement).dataset.i)
        const d = Number((b as HTMLElement).dataset.move)
        const j = idx + d
        if (j < 0 || j >= files.length) return
        const copy = [...files]
        const [item] = copy.splice(idx, 1)
        copy.splice(j, 0, item)
        files = copy
        setFiles(files)
      }),
    )
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
        toast(`"${f.name}" is over ${maxMB} MB and was skipped.`, 'err')
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

export function toolHeader(meta: { icon: string; name: string; desc: string; tagline: string; gradient: string }): string {
  return `
  <div class="flex items-start gap-4">
    <span class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-3xl text-white shadow-lg"> ${meta.icon}</span>
    <div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl dark:text-white">${meta.name}</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${meta.desc}</p>
      <div class="mt-2 flex flex-wrap gap-2 text-xs">
        <span class="rounded-full bg-indigo-500/10 px-2.5 py-1 font-semibold text-indigo-600 dark:text-indigo-300">${meta.tagline}</span>
        <span class="rounded-full bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-600 dark:text-emerald-300">🔒 private • in-browser</span>
      </div>
    </div>
  </div>`
}

export function progressBarHTML(): string {
  return `
  <div id="progWrap" class="mt-4 hidden">
    <div class="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400"><span id="progLabel">Working…</span><span id="progPct">0%</span></div>
    <div class="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div id="progBar" class="h-full w-0 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"></div>
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
