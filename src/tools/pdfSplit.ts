import JSZip from 'jszip'
import { PDFDocument } from 'pdf-lib'
import { getTool } from '../data/tools.ts'
import { baseName, downloadBlob, getPdfjs, parsePageRange } from '../lib/files.ts'
import { createDropzone, hideProgress, progressBarHTML, setProgress, toast, toolHeader } from '../ui/shell.ts'

export function render(el: HTMLElement): void {
  const meta = getTool('pdf-split')!
  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div><div id="dz"></div><div id="info" class="mt-3 text-sm text-slate-500"></div></div>
      <div class="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div class="text-sm font-bold">⚙️ Options</div>
        <div class="mt-4 grid gap-2">
          <label class="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"><input type="radio" name="mode" value="range" checked class="accent-indigo-500" /> Extract range to one PDF</label>
          <label class="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"><input type="radio" name="mode" value="each" class="accent-indigo-500" /> Every page → separate PDF (ZIP)</label>
        </div>
        <label class="mt-4 block text-xs font-semibold text-slate-500">PAGES (e.g. 1-3,5)</label>
        <input id="optPages" value="1-3" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
        <button id="go" class="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-40">Split ⚡</button>
        ${progressBarHTML()}
      </div>
    </div>`

  const dzHost = el.querySelector<HTMLElement>('#dz')!
  const dz = createDropzone({ container: dzHost, accept: meta.accept, multiple: false, hint: 'One PDF' })
  const go = el.querySelector<HTMLButtonElement>('#go')!
  const info = el.querySelector<HTMLElement>('#info')!

  dzHost.addEventListener('files-changed', async () => {
    const f = dz.getFiles()[0]
    if (!f) {
      info.textContent = ''
      return
    }
    try {
      const pdfjs = await getPdfjs()
      const pdf = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise
      info.textContent = `📄 ${f.name} — ${pdf.numPages} page(s). Use "all" or e.g. 1-${Math.min(pdf.numPages, 5)},${pdf.numPages}.`
    } catch {
      info.textContent = ''
    }
  })

  go.addEventListener('click', async () => {
    const files = dz.getFiles()
    if (!files.length) return toast('Drop a PDF first.', 'err')
    const mode = (el.querySelector<HTMLInputElement>('input[name="mode"]:checked')!).value
    go.disabled = true
    try {
      const buf = await files[0].arrayBuffer()
      const src = await PDFDocument.load(buf, { ignoreEncryption: true })
      const total = src.getPageCount()
      const pages = parsePageRange((el.querySelector<HTMLInputElement>('#optPages')!).value, total)
      if (mode === 'range' && pages.length === 0) throw new Error('No valid pages in range.')
      const stem = baseName(files[0].name)
      if (mode === 'range') {
        const out = await PDFDocument.create()
        const copied = await out.copyPages(src, pages.map((p) => p - 1))
        copied.forEach((p) => out.addPage(p))
        setProgress(90, 'Saving…')
        const bytes = await out.save()
        downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${stem}-pages-${pages[0]}-${pages[pages.length - 1]}.pdf`)
      } else {
        const zip = new JSZip()
        for (let i = 0; i < total; i++) {
          setProgress((i / total) * 90, `Page ${i + 1}/${total}…`)
          const one = await PDFDocument.create()
          const [pg] = await one.copyPages(src, [i])
          one.addPage(pg)
          const bytes = await one.save()
          zip.file(`${stem}-p${i + 1}.pdf`, bytes)
        }
        setProgress(95, 'Zipping…')
        downloadBlob(await zip.generateAsync({ type: 'blob' }), `${stem}-split.zip`)
      }
      setProgress(100, 'Done')
      toast('Split complete.', 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Split failed.', 'err')
    } finally {
      go.disabled = false
      setTimeout(hideProgress, 1000)
    }
  })
}
