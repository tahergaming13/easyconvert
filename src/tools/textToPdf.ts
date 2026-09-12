import { jsPDF } from 'jspdf'
import { getTool } from '../data/tools.ts'
import { downloadBlob } from '../lib/files.ts'
import { hideProgress, progressBarHTML, setProgress, toast, toolHeader } from '../ui/shell.ts'

export function render(el: HTMLElement): void {
  const meta = getTool('text-to-pdf')!
  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div id="dzText" class="dz cursor-pointer rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/60 p-5 text-center text-sm text-zinc-500 hover:border-lime-500 dark:border-zinc-700 dark:bg-zinc-900/50"><i class="ph ph-note-pencil text-xl text-lime-700 dark:text-lime-300" aria-hidden="true"></i> Drop a <b>.txt / .md</b> file here or <span class="font-semibold text-lime-700 dark:text-lime-300">click to browse</span><input id="txtFile" type="file" accept=".txt,.md,.markdown,text/plain" class="hidden" /></div>
        <textarea id="txtIn" rows="14" placeholder="Paste or type your text here… (Markdown headings with # work too)" class="mt-3 w-full rounded-2xl border border-zinc-200 bg-white p-4 font-mono text-sm leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"></textarea>
      </div>
      <div class="h-fit rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <div class="text-sm font-bold"> <i class="ph ph-sliders-horizontal text-base" aria-hidden="true"></i> Style</div>
        <label class="mt-4 block text-xs font-semibold text-zinc-500">TITLE (optional)</label>
        <input id="optTitle" placeholder="My document" class="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
        <label class="mt-4 block text-xs font-semibold text-zinc-500">FONT SIZE</label>
        <select id="optSize" class="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800">
          <option value="11">Compact (11)</option>
          <option value="12" selected>Normal (12)</option>
          <option value="14">Large (14)</option>
        </select>
        <button id="go" class="mt-5 w-full btn-press rounded-xl bg-lime-300 px-4 py-3 text-sm font-bold text-zinc-950 shadow-md shadow-lime-950/10 transition hover:bg-lime-200 disabled:opacity-40">Create PDF <i class="ph ph-lightning text-base" aria-hidden="true"></i></button>
        ${progressBarHTML()}
      </div>
    </div>`

  const txtIn = el.querySelector<HTMLTextAreaElement>('#txtIn')!
  const fileInput = el.querySelector<HTMLInputElement>('#txtFile')!
  const dzText = el.querySelector<HTMLElement>('#dzText')!
  const go = el.querySelector<HTMLButtonElement>('#go')!

  dzText.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files?.[0]
    if (f) txtIn.value = await f.text()
    fileInput.value = ''
  })
  dzText.addEventListener('dragover', (e) => {
    e.preventDefault()
    dzText.classList.add('dz-active')
  })
  dzText.addEventListener('dragleave', (e) => {
    e.preventDefault()
    dzText.classList.remove('dz-active')
  })
  dzText.addEventListener('drop', async (e) => {
    e.preventDefault()
    dzText.classList.remove('dz-active')
    const f = e.dataTransfer?.files?.[0]
    if (f) txtIn.value = await f.text()
  })

  go.addEventListener('click', () => {
    const text = txtIn.value.trim()
    if (!text) return toast('Paste some text first.', 'err')
    go.disabled = true
    try {
      setProgress(30, 'Laying out…')
      const title = (el.querySelector<HTMLInputElement>('#optTitle')!).value.trim()
      const size = Number((el.querySelector<HTMLSelectElement>('#optSize')!).value)
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const pw = doc.internal.pageSize.getWidth()
      const margin = 18
      let y = margin
      if (title) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        const lines = doc.splitTextToSize(title, pw - margin * 2)
        doc.text(lines, margin, y)
        y += lines.length * 9 + 4
        doc.setDrawColor(99, 102, 241)
        doc.setLineWidth(0.8)
        doc.line(margin, y, pw - margin, y)
        y += 8
      }
      const paragraphs = text.split(/\n\s*\n/)
      for (const para of paragraphs) {
        const trimmed = para.trim()
        if (!trimmed) continue
        const isH = /^#{1,3}\s/.test(trimmed)
        const clean = trimmed.replace(/^#{1,3}\s/, '').replace(/\n/g, ' ')
        doc.setFont('helvetica', isH ? 'bold' : 'normal')
        doc.setFontSize(isH ? size + 4 : size)
        const lines = doc.splitTextToSize(clean, pw - margin * 2) as string[]
        const lh = (isH ? size + 4 : size) * 0.5
        for (const line of lines) {
          if (y > 287 - margin) {
            doc.addPage()
            y = margin
          }
          doc.text(line, margin, y)
          y += lh
        }
        y += 3
      }
      setProgress(90, 'Saving…')
      const blob = doc.output('blob')
      downloadBlob(blob, `${title ? title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() : 'easyconvert-text'}.pdf`)
      setProgress(100, 'Done')
      toast('PDF created.', 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed.', 'err')
    } finally {
      go.disabled = false
      setTimeout(hideProgress, 1000)
    }
  })
}
