import { jsPDF } from 'jspdf'
import { getTool } from '../data/tools.ts'
import { baseName, downloadBlob, imageFileToCanvas } from '../lib/files.ts'
import { createDropzone, hideProgress, progressBarHTML, setProgress, toast, toolHeader } from '../ui/shell.ts'

export function render(el: HTMLElement): void {
  const meta = getTool('image-to-pdf')!

  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div id="dz"></div>
        <div id="preview" class="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4"></div>
      </div>
      <div class="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div class="text-sm font-bold text-slate-800 dark:text-slate-100"> <i class="ph ph-sliders-horizontal text-base" aria-hidden="true"></i> Options</div>
        <label class="mt-4 block text-xs font-semibold text-slate-500">PAGE SIZE</label>
        <select id="optSize" class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="fit">Fit to image (recommended)</option>
          <option value="a4">A4</option>
          <option value="letter">US Letter</option>
        </select>
        <label class="mt-4 block text-xs font-semibold text-slate-500">ORIENTATION (for A4/Letter)</label>
        <select id="optOrient" class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="auto">Auto</option>
          <option value="p">Portrait</option>
          <option value="l">Landscape</option>
        </select>
        <label class="mt-4 block text-xs font-semibold text-slate-500">IMAGE QUALITY: <span id="qVal">0.92</span></label>
        <input id="optQ" type="range" min="0.4" max="1" step="0.01" value="0.92" class="mt-1 w-full" />
        <button id="go" class="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 disabled:opacity-40">Convert to PDF <i class="ph ph-lightning text-base" aria-hidden="true"></i></button>
        ${progressBarHTML()}
        <div id="result" class="mt-4"></div>
      </div>
    </div>`

  const dzHost = el.querySelector<HTMLElement>('#dz')!
  const dz = createDropzone({ container: dzHost, accept: meta.accept, multiple: true, hint: 'JPG, PNG, WebP, GIF…' })
  const preview = el.querySelector<HTMLElement>('#preview')!
  const go = el.querySelector<HTMLButtonElement>('#go')!
  const q = el.querySelector<HTMLInputElement>('#optQ')!
  const qVal = el.querySelector<HTMLElement>('#qVal')!
  q.addEventListener('input', () => (qVal.textContent = Number(q.value).toFixed(2)))

  dzHost.addEventListener('files-changed', drawPreview)

  function drawPreview(): void {
    const files = dz.getFiles()
    preview.innerHTML = ''
    files.forEach((f) => {
      const url = URL.createObjectURL(f)
      const d = document.createElement('div')
      d.className = 'overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700'
      const img = document.createElement('img')
      img.src = url
      img.className = 'h-24 w-full object-cover'
      img.loading = 'lazy'
      const cap = document.createElement('div')
      cap.className = 'truncate px-2 py-1 text-[11px] text-slate-500'
      cap.textContent = f.name
      d.appendChild(img)
      d.appendChild(cap)
      preview.appendChild(d)
    })
  }

  go.addEventListener('click', async () => {
    const files = dz.getFiles()
    if (files.length === 0) {
      toast('Add at least one image first.', 'err')
      return
    }
    go.disabled = true
    try {
      const size = (el.querySelector<HTMLSelectElement>('#optSize')!).value
      const orientOpt = (el.querySelector<HTMLSelectElement>('#optOrient')!).value
      const quality = Number(q.value)
      let pdf: jsPDF | null = null

      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 90, `Processing image ${i + 1}/${files.length}…`)
        const canvas = await imageFileToCanvas(files[i], 2480, 2480)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        const w = canvas.width
        const h = canvas.height
        if (i === 0) {
          if (size === 'fit') {
            const px2mm = 0.264583
            pdf = new jsPDF({ unit: 'mm', format: [w * px2mm, h * px2mm], orientation: w > h ? 'l' : 'p' })
          } else {
            const orient = orientOpt === 'auto' ? (w > h ? 'l' : 'p') : (orientOpt as 'p' | 'l')
            pdf = new jsPDF({ unit: 'mm', format: size, orientation: orient })
          }
        } else if (size === 'fit') {
          const px2mm = 0.264583
          pdf!.addPage([w * px2mm, h * px2mm], w > h ? 'l' : 'p')
        } else {
          pdf!.addPage(size, orientOpt === 'auto' ? (w > h ? 'l' : 'p') : (orientOpt as 'p' | 'l'))
        }
        const doc = pdf!
        if (size === 'fit') {
          doc.addImage(dataUrl, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight())
        } else {
          const pw = doc.internal.pageSize.getWidth()
          const ph = doc.internal.pageSize.getHeight()
          const margin = 10
          const maxW = pw - margin * 2
          const maxH = ph - margin * 2
          const ratio = Math.min(maxW / (w * 0.264583), maxH / (h * 0.264583))
          const dw = w * 0.264583 * ratio
          const dh = h * 0.264583 * ratio
          doc.addImage(dataUrl, 'JPEG', (pw - dw) / 2, (ph - dh) / 2, dw, dh)
        }
      }
      setProgress(96, 'Saving PDF…')
      const blob = pdf!.output('blob')
      const name = files.length === 1 ? `${baseName(files[0].name)}.pdf` : 'easyconvert-images.pdf'
      downloadBlob(blob, name)
      const res = el.querySelector<HTMLElement>('#result')!
      res.innerHTML = ''
      const ok = document.createElement('div')
      ok.className = 'rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300'
      ok.textContent = `Done — ${files.length} image(s) saved as ${name}`
      res.appendChild(ok)
      setProgress(100, 'Done')
      toast('PDF downloaded.', 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Conversion failed.', 'err')
    } finally {
      go.disabled = false
      setTimeout(hideProgress, 1200)
    }
  })
}
