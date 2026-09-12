import { PDFDocument } from 'pdf-lib'
import { getTool } from '../data/tools.ts'
import { downloadBlob } from '../lib/files.ts'
import { createDropzone, hideProgress, progressBarHTML, setProgress, toast, toolHeader } from '../ui/shell.ts'

export function render(el: HTMLElement): void {
  const meta = getTool('pdf-merge')!
  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div><div id="dz"></div><p class="mt-2 text-xs text-zinc-400">Tip: use ↑ ↓ to reorder — merge follows that order.</p></div>
      <div class="h-fit rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <div class="text-sm font-bold"> <i class="ph ph-sliders-horizontal text-base" aria-hidden="true"></i> Options</div>
        <label class="mt-4 block text-xs font-semibold text-zinc-500">OUTPUT NAME</label>
        <input id="optName" value="easyconvert-merged.pdf" class="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
        <button id="go" class="mt-5 w-full btn-press rounded-xl bg-lime-300 px-4 py-3 text-sm font-bold text-zinc-950 shadow-md shadow-lime-950/10 transition hover:bg-lime-200 disabled:opacity-40">Merge PDFs <i class="ph ph-lightning text-base" aria-hidden="true"></i></button>
        ${progressBarHTML()}
        <div id="result" class="mt-4"></div>
      </div>
    </div>`

  const dzHost = el.querySelector<HTMLElement>('#dz')!
  const dz = createDropzone({ container: dzHost, accept: meta.accept, multiple: true, hint: 'PDF files to join' })
  const go = el.querySelector<HTMLButtonElement>('#go')!

  go.addEventListener('click', async () => {
    const files = dz.getFiles()
    if (files.length < 2) return toast('Add at least 2 PDFs to merge.', 'err')
    go.disabled = true
    try {
      const out = await PDFDocument.create()
      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 90, `Adding ${files[i].name}…`)
        const buf = await files[i].arrayBuffer()
        const src = await PDFDocument.load(buf, { ignoreEncryption: true })
        const pages = await out.copyPages(src, src.getPageIndices())
        pages.forEach((p) => out.addPage(p))
      }
      setProgress(95, 'Saving…')
      const bytes = await out.save()
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const name = (el.querySelector<HTMLInputElement>('#optName')!).value.trim() || 'easyconvert-merged.pdf'
      downloadBlob(blob, name.endsWith('.pdf') ? name : `${name}.pdf`)
      const res = el.querySelector<HTMLElement>('#result')!
      res.innerHTML = ''
      const ok = document.createElement('div')
      ok.className = 'rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300'
      ok.textContent = `Done — merged ${files.length} PDFs into ${name}`
      res.appendChild(ok)
      setProgress(100, 'Done')
      toast('Merged PDF downloaded.', 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Merge failed. Files may be protected.', 'err')
    } finally {
      go.disabled = false
      setTimeout(hideProgress, 1000)
    }
  })
}
