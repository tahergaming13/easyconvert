import { PDFDocument, degrees } from 'pdf-lib'
import { getTool } from '../data/tools.ts'
import { baseName, downloadBlob, parsePageRange } from '../lib/files.ts'
import { createDropzone, hideProgress, progressBarHTML, setProgress, toast, toolHeader } from '../ui/shell.ts'

export function render(el: HTMLElement): void {
  const meta = getTool('pdf-rotate')!
  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div><div id="dz"></div></div>
      <div class="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div class="text-sm font-bold"> <i class="ph ph-sliders-horizontal text-base" aria-hidden="true"></i> Options</div>
        <label class="mt-4 block text-xs font-semibold text-slate-500">ANGLE</label>
        <div class="mt-1 grid grid-cols-3 gap-2">
          <button data-ang="90" class="ang rounded-xl border-2 border-indigo-500 bg-indigo-50 px-2 py-2.5 text-sm font-bold dark:bg-indigo-950/40">90° ⟳</button>
          <button data-ang="180" class="ang rounded-xl border border-slate-200 px-2 py-2.5 text-sm font-bold dark:border-slate-700">180°</button>
          <button data-ang="270" class="ang rounded-xl border border-slate-200 px-2 py-2.5 text-sm font-bold dark:border-slate-700">270° ⟲</button>
        </div>
        <label class="mt-4 block text-xs font-semibold text-slate-500">PAGES (all or 1-3,5)</label>
        <input id="optPages" value="all" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
        <button id="go" class="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-40">Rotate and save <i class="ph ph-lightning text-base" aria-hidden="true"></i></button>
        ${progressBarHTML()}
      </div>
    </div>`

  let angle = 90
  el.querySelectorAll<HTMLButtonElement>('.ang').forEach((b) =>
    b.addEventListener('click', () => {
      angle = Number(b.dataset.ang)
      el.querySelectorAll('.ang').forEach((x) => {
        x.classList.remove('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-950/40', 'border-2')
        x.classList.add('border')
      })
      b.classList.add('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-950/40', 'border-2')
      b.classList.remove('border')
    }),
  )

  const dzHost = el.querySelector<HTMLElement>('#dz')!
  const dz = createDropzone({ container: dzHost, accept: meta.accept, multiple: false, hint: 'PDF to rotate' })
  const go = el.querySelector<HTMLButtonElement>('#go')!

  go.addEventListener('click', async () => {
    const files = dz.getFiles()
    if (!files.length) return toast('Drop a PDF first.', 'err')
    go.disabled = true
    try {
      setProgress(20, 'Loading…')
      const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true })
      const pages = parsePageRange((el.querySelector<HTMLInputElement>('#optPages')!).value, src.getPageCount())
      if (!pages.length) throw new Error('No valid pages selected.')
      pages.forEach((p) => {
        const pg = src.getPage(p - 1)
        pg.setRotation(degrees((pg.getRotation().angle + angle) % 360))
      })
      setProgress(80, 'Saving…')
      const bytes = await src.save()
      downloadBlob(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }), `${baseName(files[0].name)}-rotated.pdf`)
      setProgress(100, 'Done')
      toast(`Rotated ${pages.length} page(s).`, 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Rotate failed.', 'err')
    } finally {
      go.disabled = false
      setTimeout(hideProgress, 1000)
    }
  })
}
