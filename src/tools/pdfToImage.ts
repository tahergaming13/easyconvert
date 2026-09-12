import JSZip from 'jszip'
import { getTool } from '../data/tools.ts'
import { baseName, downloadBlob, getPdfjs } from '../lib/files.ts'
import { createDropzone, hideProgress, progressBarHTML, setProgress, toast, toolHeader } from '../ui/shell.ts'

export function render(el: HTMLElement): void {
  const meta = getTool('pdf-to-image')!

  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div id="dz"></div>
        <div id="gallery" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"></div>
      </div>
      <div class="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div class="text-sm font-bold text-slate-800 dark:text-slate-100">⚙️ Options</div>
        <label class="mt-4 block text-xs font-semibold text-slate-500">FORMAT</label>
        <select id="optFmt" class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="jpeg">JPG (smaller)</option>
          <option value="png">PNG (best quality)</option>
        </select>
        <label class="mt-4 block text-xs font-semibold text-slate-500">QUALITY / SCALE</label>
        <select id="optScale" class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="1.5">Standard (1.5x)</option>
          <option value="2" selected>High (2x, recommended)</option>
          <option value="3">Ultra (3x, large files)</option>
        </select>
        <label class="mt-4 block text-xs font-semibold text-slate-500">PAGES (e.g. 1-3,5 or all)</label>
        <input id="optPages" value="all" class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
        <button id="go" class="mt-5 w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:opacity-40">Convert to images ⚡</button>
        <button id="zipBtn" class="mt-2 hidden w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Download all as ZIP 📦</button>
        ${progressBarHTML()}
        <div id="result" class="mt-4"></div>
      </div>
    </div>`

  const dzHost = el.querySelector<HTMLElement>('#dz')!
  const dz = createDropzone({ container: dzHost, accept: meta.accept, multiple: false, hint: 'PDF only' })
  const gallery = el.querySelector<HTMLElement>('#gallery')!
  const go = el.querySelector<HTMLButtonElement>('#go')!
  const zipBtn = el.querySelector<HTMLButtonElement>('#zipBtn')!
  let rendered: { blob: Blob; name: string }[] = []

  go.addEventListener('click', async () => {
    const files = dz.getFiles()
    if (files.length === 0) {
      toast('Drop a PDF first.', 'err')
      return
    }
    go.disabled = true
    rendered = []
    gallery.innerHTML = ''
    el.querySelector<HTMLElement>('#result')!.innerHTML = ''
    zipBtn.classList.add('hidden')
    try {
      const fmt = (el.querySelector<HTMLSelectElement>('#optFmt')!).value as 'jpeg' | 'png'
      const scale = Number((el.querySelector<HTMLSelectElement>('#optScale')!).value)
      const pagesRaw = (el.querySelector<HTMLInputElement>('#optPages')!).value
      const pdfjs = await getPdfjs()
      const buf = await files[0].arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: buf }).promise
      const wanted = parseWanted(pagesRaw, pdf.numPages)
      if (wanted.length === 0) throw new Error('No valid pages selected.')
      const stem = baseName(files[0].name)
      for (let i = 0; i < wanted.length; i++) {
        const p = wanted[i]
        setProgress((i / wanted.length) * 95, `Rendering page ${p} (${i + 1}/${wanted.length})…`)
        const page = await pdf.getPage(p)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')!
        if (fmt === 'jpeg') {
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        await page.render({ canvas, viewport }).promise
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error('Render failed'))), fmt === 'jpeg' ? 'image/jpeg' : 'image/png', 0.92),
        )
        const ext = fmt === 'jpeg' ? 'jpg' : 'png'
        const name = `${stem}-p${p}.${ext}`
        rendered.push({ blob, name })
        const url = URL.createObjectURL(blob)
        const card = document.createElement('div')
        card.className = 'overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
        const img = document.createElement('img')
        img.src = url
        img.className = 'result-thumb aspect-[3/4] w-full object-contain bg-slate-100 dark:bg-slate-800'
        img.loading = 'lazy'
        const bar = document.createElement('div')
        bar.className = 'flex items-center justify-between px-2.5 py-2'
        const label = document.createElement('span')
        label.className = 'truncate text-xs font-medium text-slate-600 dark:text-slate-300'
        label.textContent = `Page ${p}`
        const dl = document.createElement('button')
        dl.className = 'rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white hover:opacity-90 dark:bg-white dark:text-slate-900'
        dl.textContent = 'Save'
        dl.addEventListener('click', () => downloadBlob(blob, name))
        bar.appendChild(label)
        bar.appendChild(dl)
        card.appendChild(img)
        card.appendChild(bar)
        gallery.appendChild(card)
      }
      setProgress(100, 'Done')
      zipBtn.classList.toggle('hidden', rendered.length < 2)
      const res = el.querySelector<HTMLElement>('#result')!
      const ok = document.createElement('div')
      ok.className = 'rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300'
      ok.textContent = `✅ Done! ${rendered.length} page(s) rendered.`
      res.appendChild(ok)
      toast('Images ready.', 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'PDF render failed.', 'err')
    } finally {
      go.disabled = false
      setTimeout(hideProgress, 1200)
    }
  })

  zipBtn.addEventListener('click', async () => {
    if (rendered.length === 0) return
    const zip = new JSZip()
    for (const r of rendered) zip.file(r.name, r.blob)
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'easyconvert-pages.zip')
  })
}

function parseWanted(raw: string, max: number): number[] {
  const v = raw.trim().toLowerCase()
  if (!v || v === 'all') return Array.from({ length: max }, (_, i) => i + 1)
  const set = new Set<number>()
  for (const part of v.split(',')) {
    const p = part.trim()
    if (!p) continue
    if (p.includes('-')) {
      const [a, b] = p.split('-').map((x) => parseInt(x.trim(), 10))
      if (Number.isNaN(a)) continue
      const end = Number.isNaN(b) ? a : b
      for (let i = Math.max(1, Math.min(a, end)); i <= Math.min(max, Math.max(a, end)); i++) set.add(i)
    } else {
      const n = parseInt(p, 10)
      if (!Number.isNaN(n) && n >= 1 && n <= max) set.add(n)
    }
  }
  return [...set].sort((a, b) => a - b)
}
