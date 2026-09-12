import JSZip from 'jszip'
import { getTool } from '../data/tools.ts'
import { baseName, canvasToBlob, downloadBlob, formatBytes, loadImage } from '../lib/files.ts'
import { createDropzone, hideProgress, progressBarHTML, setProgress, toast, toolHeader } from '../ui/shell.ts'

export function render(el: HTMLElement): void {
  const meta = getTool('image-compress')!
  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div><div id="dz"></div><div id="out" class="mt-4 grid gap-2"></div></div>
      <div class="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div class="text-sm font-bold">⚙️ Options</div>
        <label class="mt-4 block text-xs font-semibold text-slate-500">QUALITY: <span id="qVal">0.75</span></label>
        <input id="optQ" type="range" min="0.1" max="0.95" step="0.01" value="0.75" class="mt-1 w-full" />
        <label class="mt-4 block text-xs font-semibold text-slate-500">MAX WIDTH (px, 0 = keep)</label>
        <input id="optW" type="number" value="1920" min="0" max="8000" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
        <label class="mt-4 block text-xs font-semibold text-slate-500">MAX HEIGHT (px, 0 = keep)</label>
        <input id="optH" type="number" value="1920" min="0" max="8000" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
        <label class="mt-4 block text-xs font-semibold text-slate-500">OUTPUT</label>
        <select id="optFmt" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="image/jpeg">JPG (smallest)</option>
          <option value="image/webp">WebP (modern, small)</option>
          <option value="image/png">PNG (lossless, bigger)</option>
        </select>
        <button id="go" class="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-40">Compress ⚡</button>
        <button id="zipBtn" class="mt-2 hidden w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Download all as ZIP 📦</button>
        ${progressBarHTML()}
      </div>
    </div>`

  const dzHost = el.querySelector<HTMLElement>('#dz')!
  const dz = createDropzone({ container: dzHost, accept: meta.accept, multiple: true, hint: 'Images to shrink' })
  const out = el.querySelector<HTMLElement>('#out')!
  const go = el.querySelector<HTMLButtonElement>('#go')!
  const zipBtn = el.querySelector<HTMLButtonElement>('#zipBtn')!
  const q = el.querySelector<HTMLInputElement>('#optQ')!
  const qVal = el.querySelector<HTMLElement>('#qVal')!
  q.addEventListener('input', () => (qVal.textContent = Number(q.value).toFixed(2)))
  let done: { blob: Blob; name: string }[] = []

  go.addEventListener('click', async () => {
    const files = dz.getFiles()
    if (!files.length) return toast('Add images first.', 'err')
    const quality = Number(q.value)
    const maxW = Number((el.querySelector<HTMLInputElement>('#optW')!).value) || 0
    const maxH = Number((el.querySelector<HTMLInputElement>('#optH')!).value) || 0
    const type = (el.querySelector<HTMLSelectElement>('#optFmt')!).value
    const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg'
    go.disabled = true
    done = []
    out.innerHTML = ''
    zipBtn.classList.add('hidden')
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 95, `Compressing ${i + 1}/${files.length}…`)
        const img = await loadImage(files[i])
        let w = img.naturalWidth
        let h = img.naturalHeight
        if (maxW > 0 && w > maxW) {
          h = Math.round((h * maxW) / w)
          w = maxW
        }
        if (maxH > 0 && h > maxH) {
          w = Math.round((w * maxH) / h)
          h = maxH
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        if (type !== 'image/png') {
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, w, h)
        }
        ctx.drawImage(img, 0, 0, w, h)
        const blob = await canvasToBlob(canvas, type, type === 'image/png' ? undefined : quality)
        const name = `${baseName(files[i].name)}-compressed.${ext}`
        done.push({ blob, name })
        const saved = Math.max(0, 100 - (blob.size / files[i].size) * 100)
        addRow(files[i], blob, name, saved)
      }
      setProgress(100, 'Done')
      if (done.length > 1) zipBtn.classList.remove('hidden')
      toast('Compression done.', 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed.', 'err')
    } finally {
      go.disabled = false
      setTimeout(hideProgress, 1000)
    }
  })

  function addRow(orig: File, blob: Blob, name: string, saved: number): void {
    const url = URL.createObjectURL(blob)
    const row = document.createElement('div')
    row.className = 'flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900'
    row.innerHTML = ''
    const img = document.createElement('img')
    img.src = url
    img.className = 'h-12 w-12 rounded-lg object-cover'
    const mid = document.createElement('div')
    mid.className = 'min-w-0 flex-1'
    const a = document.createElement('div')
    a.className = 'truncate text-sm font-semibold'
    a.textContent = name
    const b = document.createElement('div')
    b.className = 'text-xs text-slate-400'
    b.textContent = `${formatBytes(orig.size)} → ${formatBytes(blob.size)} • −${saved.toFixed(0)}%`
    mid.appendChild(a)
    mid.appendChild(b)
    const btn = document.createElement('button')
    btn.className = 'rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900'
    btn.textContent = 'Save'
    btn.addEventListener('click', () => downloadBlob(blob, name))
    row.appendChild(img)
    row.appendChild(mid)
    row.appendChild(btn)
    out.appendChild(row)
  }

  zipBtn.addEventListener('click', async () => {
    const zip = new JSZip()
    for (const d of done) zip.file(d.name, d.blob)
    downloadBlob(await zip.generateAsync({ type: 'blob' }), 'easyconvert-compressed.zip')
  })
}
