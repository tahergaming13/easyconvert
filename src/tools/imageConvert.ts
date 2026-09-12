import JSZip from 'jszip'
import { getTool } from '../data/tools.ts'
import { baseName, canvasToBlob, downloadBlob, loadImage } from '../lib/files.ts'
import { createDropzone, hideProgress, progressBarHTML, setProgress, toast, toolHeader } from '../ui/shell.ts'

const FORMATS = [
  { v: 'image/jpeg', ext: 'jpg', label: 'JPG' },
  { v: 'image/png', ext: 'png', label: 'PNG' },
  { v: 'image/webp', ext: 'webp', label: 'WebP' },
]

export function render(el: HTMLElement): void {
  const meta = getTool('image-convert')!
  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div><div id="dz"></div><div id="out" class="mt-4 grid gap-2"></div></div>
      <div class="h-fit rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <div class="text-sm font-bold text-zinc-800 dark:text-zinc-100"> <i class="ph ph-sliders-horizontal text-base" aria-hidden="true"></i> Options</div>
        <label class="mt-4 block text-xs font-semibold text-zinc-500">OUTPUT FORMAT</label>
        <select id="optFmt" class="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800">
          ${FORMATS.map((f) => `<option value="${f.v}">${f.label}</option>`).join('')}
        </select>
        <label class="mt-4 block text-xs font-semibold text-zinc-500">QUALITY (JPG/WebP): <span id="qVal">0.9</span></label>
        <input id="optQ" type="range" min="0.3" max="1" step="0.01" value="0.9" class="mt-1 w-full" />
        <button id="go" class="mt-5 w-full btn-press rounded-xl bg-lime-300 px-4 py-3 text-sm font-bold text-zinc-950 shadow-md shadow-lime-950/10 transition hover:bg-lime-200 disabled:opacity-40">Convert images <i class="ph ph-lightning text-base" aria-hidden="true"></i></button>
        <button id="zipBtn" class="mt-2 hidden w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">Download all as ZIP <i class="ph ph-file-archive text-base" aria-hidden="true"></i></button>
        ${progressBarHTML()}
      </div>
    </div>`

  const dzHost = el.querySelector<HTMLElement>('#dz')!
  const dz = createDropzone({ container: dzHost, accept: meta.accept, multiple: true, hint: 'JPG, PNG, WebP…' })
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
    const type = (el.querySelector<HTMLSelectElement>('#optFmt')!).value
    const quality = Number(q.value)
    const fmt = FORMATS.find((f) => f.v === type)!
    go.disabled = true
    done = []
    out.innerHTML = ''
    zipBtn.classList.add('hidden')
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 95, `Converting ${i + 1}/${files.length}…`)
        const img = await loadImage(files[i])
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!
        if (type === 'image/jpeg') {
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        ctx.drawImage(img, 0, 0)
        const blob = await canvasToBlob(canvas, type, quality)
        const name = `${baseName(files[i].name)}.${fmt.ext}`
        done.push({ blob, name })
        addRow(files[i].name, name, blob)
      }
      setProgress(100, 'Done')
      if (done.length > 1) zipBtn.classList.remove('hidden')
      toast(`${done.length} image(s) converted.`, 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed.', 'err')
    } finally {
      go.disabled = false
      setTimeout(hideProgress, 1000)
    }
  })

  function addRow(from: string, to: string, blob: Blob): void {
    const url = URL.createObjectURL(blob)
    const row = document.createElement('div')
    row.className = 'flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-2.5 dark:border-zinc-700 dark:bg-zinc-900'
    const img = document.createElement('img')
    img.src = url
    img.className = 'h-12 w-12 rounded-lg object-cover'
    const mid = document.createElement('div')
    mid.className = 'min-w-0 flex-1'
    const a = document.createElement('div')
    a.className = 'truncate text-sm font-semibold'
    a.textContent = to
    const b = document.createElement('div')
    b.className = 'truncate text-xs text-zinc-400'
    b.textContent = `from ${from}`
    mid.appendChild(a)
    mid.appendChild(b)
    const btn = document.createElement('button')
    btn.className = 'rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-zinc-900'
    btn.textContent = 'Save'
    btn.addEventListener('click', () => downloadBlob(blob, to))
    row.appendChild(img)
    row.appendChild(mid)
    row.appendChild(btn)
    out.appendChild(row)
  }

  zipBtn.addEventListener('click', async () => {
    const zip = new JSZip()
    for (const d of done) zip.file(d.name, d.blob)
    downloadBlob(await zip.generateAsync({ type: 'blob' }), 'easyconvert-images.zip')
  })
}
