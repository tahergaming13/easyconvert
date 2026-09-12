import { getTool } from '../data/tools.ts'
import { baseName, downloadBlob, getPdfjs } from '../lib/files.ts'
import { createDropzone, hideProgress, progressBarHTML, setProgress, toast, toolHeader } from '../ui/shell.ts'

export function render(el: HTMLElement): void {
  const meta = getTool('pdf-to-text')!
  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div id="dz"></div>
        <textarea id="txtOut" rows="14" placeholder="Extracted text will appear here…" class="mt-4 w-full rounded-2xl border border-zinc-200 bg-white p-4 font-mono text-sm leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"></textarea>
      </div>
      <div class="h-fit rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <div class="text-sm font-bold"> <i class="ph ph-sliders-horizontal text-base" aria-hidden="true"></i> Options</div>
        <label class="mt-4 flex items-center gap-2 text-sm"><input id="optSep" type="checkbox" checked class="h-4 w-4 accent-lime-600" /> Add page separators</label>
        <button id="go" class="mt-4 w-full btn-press rounded-xl bg-lime-300 px-4 py-3 text-sm font-bold text-zinc-950 shadow-md shadow-lime-950/10 transition hover:bg-lime-200 disabled:opacity-40">Extract text <i class="ph ph-lightning text-base" aria-hidden="true"></i></button>
        <button id="dl" class="mt-2 hidden w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">Download .txt <i class="ph ph-download-simple text-base" aria-hidden="true"></i></button>
        <button id="copy" class="mt-2 hidden w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">Copy <i class="ph ph-copy text-base" aria-hidden="true"></i></button>
        ${progressBarHTML()}
      </div>
    </div>`

  const dzHost = el.querySelector<HTMLElement>('#dz')!
  const dz = createDropzone({ container: dzHost, accept: meta.accept, multiple: false, hint: 'PDF with selectable text' })
  const go = el.querySelector<HTMLButtonElement>('#go')!
  const dl = el.querySelector<HTMLButtonElement>('#dl')!
  const copy = el.querySelector<HTMLButtonElement>('#copy')!
  const out = el.querySelector<HTMLTextAreaElement>('#txtOut')!
  let lastName = 'extracted.txt'

  go.addEventListener('click', async () => {
    const files = dz.getFiles()
    if (!files.length) return toast('Drop a PDF first.', 'err')
    go.disabled = true
    try {
      const sep = (el.querySelector<HTMLInputElement>('#optSep')!).checked
      const pdfjs = await getPdfjs()
      const pdf = await pdfjs.getDocument({ data: await files[0].arrayBuffer() }).promise
      const parts: string[] = []
      for (let p = 1; p <= pdf.numPages; p++) {
        setProgress((p / pdf.numPages) * 95, `Reading page ${p}/${pdf.numPages}…`)
        const page = await pdf.getPage(p)
        const tc = await page.getTextContent()
        const text = (tc.items as { str?: string }[]).map((it) => it.str ?? '').join(' ')
        parts.push(sep ? `———— Page ${p} ————\n${text}` : text)
      }
      out.value = parts.join('\n\n').replace(/[ \t]+\n/g, '\n').trim()
      if (!out.value) {
        toast('No selectable text found — this PDF is likely scanned images.', 'err')
        return
      }
      lastName = `${baseName(files[0].name)}.txt`
      dl.classList.remove('hidden')
      copy.classList.remove('hidden')
      setProgress(100, 'Done')
      toast(`Extracted ${pdf.numPages} page(s).`, 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Extract failed.', 'err')
    } finally {
      go.disabled = false
      setTimeout(hideProgress, 1000)
    }
  })

  dl.addEventListener('click', () => {
    if (!out.value) return
    downloadBlob(new Blob([out.value], { type: 'text/plain;charset=utf-8' }), lastName)
  })
  copy.addEventListener('click', async () => {
    if (!out.value) return
    await navigator.clipboard.writeText(out.value)
    toast('Copied to clipboard.', 'ok')
  })
}
