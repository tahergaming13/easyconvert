import { jsPDF } from 'jspdf'
import { getTool } from '../data/tools.ts'
import { baseName, downloadBlob, formatBytes, getPdfjs } from '../lib/files.ts'
import { createDropzone, hideProgress, progressBarHTML, setProgress, toast, toolHeader } from '../ui/shell.ts'

export function render(el: HTMLElement): void {
  const meta = getTool('pdf-compress')!
  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div id="dz"></div>
        <div class="mt-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">Browser compression re-renders pages as images. Great for scanned PDFs. Text stays readable but is no longer selectable. For text-heavy PDFs, try <b>Medium</b> first.</div>
      </div>
      <div class="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div class="text-sm font-bold"> <i class="ph ph-sliders-horizontal text-base" aria-hidden="true"></i> Level</div>
        <select id="optLevel" class="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="medium" selected>Medium — balanced (1.2x, q0.7)</option>
          <option value="low">Low size — smallest (1x, q0.55)</option>
          <option value="high">High quality — bigger (1.8x, q0.85)</option>
        </select>
        <button id="go" class="mt-5 w-full rounded-xl bg-gradient-to-r from-green-500 to-lime-500 px-4 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-40">Compress <i class="ph ph-lightning text-base" aria-hidden="true"></i></button>
        ${progressBarHTML()}
        <div id="result" class="mt-4"></div>
      </div>
    </div>`

  const dzHost = el.querySelector<HTMLElement>('#dz')!
  const dz = createDropzone({ container: dzHost, accept: meta.accept, multiple: false, hint: 'PDF to shrink' })
  const go = el.querySelector<HTMLButtonElement>('#go')!

  go.addEventListener('click', async () => {
    const files = dz.getFiles()
    if (!files.length) return toast('Drop a PDF first.', 'err')
    const level = (el.querySelector<HTMLSelectElement>('#optLevel')!).value
    const scale = level === 'low' ? 1 : level === 'high' ? 1.8 : 1.2
    const q = level === 'low' ? 0.55 : level === 'high' ? 0.85 : 0.7
    go.disabled = true
    try {
      const pdfjs = await getPdfjs()
      const pdf = await pdfjs.getDocument({ data: await files[0].arrayBuffer() }).promise
      let doc: jsPDF | null = null
      for (let p = 1; p <= pdf.numPages; p++) {
        setProgress((p / pdf.numPages) * 90, `Compressing page ${p}/${pdf.numPages}…`)
        const page = await pdf.getPage(p)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        await page.render({ canvas, viewport }).promise
        const url = canvas.toDataURL('image/jpeg', q)
        const px2mm = 0.264583
        const W = (canvas.width * px2mm * 72) / 96 / (25.4 / 25.4)
        void W
        // Use same pt-based sizing: jsPDF default unit mm; compute from canvas px at 96dpi
        const wmm = (canvas.width * 25.4) / 150
        const hmm = (canvas.height * 25.4) / 150
        if (p === 1) doc = new jsPDF({ unit: 'mm', format: [wmm, hmm], orientation: wmm > hmm ? 'l' : 'p' })
        else doc!.addPage([wmm, hmm], wmm > hmm ? 'l' : 'p')
        doc!.addImage(url, 'JPEG', 0, 0, wmm, hmm)
      }
      setProgress(96, 'Saving…')
      const blob = doc!.output('blob')
      const name = `${baseName(files[0].name)}-compressed.pdf`
      downloadBlob(blob, name)
      const res = el.querySelector<HTMLElement>('#result')!
      res.innerHTML = ''
      const ok = document.createElement('div')
      ok.className = 'rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300'
      ok.textContent = `Done — ${formatBytes(files[0].size)} went down to ${formatBytes(blob.size)} · ${name}`
      res.appendChild(ok)
      setProgress(100, 'Done')
      toast('Compressed PDF downloaded.', 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Compress failed.', 'err')
    } finally {
      go.disabled = false
      setTimeout(hideProgress, 1200)
    }
  })
}
