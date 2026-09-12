import { jsPDF } from 'jspdf'
import { getTool } from '../data/tools.ts'
import { baseName, canvasToBlob, downloadBlob, loadImage } from '../lib/files.ts'
import { createDropzone, ic, toast, toolHeader } from '../ui/shell.ts'

type ScanMode = 'color' | 'gray' | 'bw' | 'original'

interface ScanSettings {
  mode: ScanMode
  rotation: number // quarter turns clockwise: 0-3
  brightness: number // -100..100
  contrast: number // 20..200, 100 = neutral
  whiten: number // 0..100, lifts paper background toward white
  sharpen: number // 0..100
  threshold: number // -60..60, adjusts the auto B&W cutoff
}

const DEFAULTS: ScanSettings = {
  mode: 'color',
  rotation: 0,
  brightness: 0,
  contrast: 105,
  whiten: 55,
  sharpen: 30,
  threshold: 0,
}

const PREVIEW_SIDE = 1400
const EXPORT_SIDE = 3000

export function render(el: HTMLElement): void {
  const meta = getTool('image-scan')!
  const settings: ScanSettings = { ...DEFAULTS }
  const state: { file: File | null; img: HTMLImageElement | null } = { file: null, img: null }

  el.innerHTML = `
    ${toolHeader(meta)}
    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div id="dz"></div>
        <div id="prevWrap" class="mt-4 hidden">
          <div class="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-900">
            <div class="flex items-center gap-2 pb-2.5">
              <span class="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">Live preview</span>
              <span class="ml-auto flex items-center gap-1.5">
                <button id="rotL" title="Rotate left" aria-label="Rotate left" class="btn-press grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"><span style="display:inline-flex;transform:scaleX(-1)">${ic('ph-arrow-clockwise', 'text-base')}</span></button>
                <button id="rotR" title="Rotate right" aria-label="Rotate right" class="btn-press grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white">${ic('ph-arrow-clockwise', 'text-base')}</button>
                <button id="reset" title="Reset adjustments" aria-label="Reset adjustments" class="btn-press rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white">RESET</button>
              </span>
            </div>
            <canvas id="preview" class="h-auto max-h-[70vh] w-full rounded-xl bg-white object-contain"></canvas>
          </div>
        </div>
      </div>
      <div class="h-fit rounded-2xl border border-zinc-200 bg-zinc-100/70 p-5 dark:border-white/10 dark:bg-white/5">
        <div class="text-sm font-bold">Scan mode</div>
        <div class="mt-2 grid grid-cols-2 gap-1.5" role="group" aria-label="Scan mode">
          <button data-mode="color" class="scanmode rounded-xl border px-2 py-2.5 text-xs font-bold">Color doc</button>
          <button data-mode="gray" class="scanmode rounded-xl border px-2 py-2.5 text-xs font-bold">Grayscale</button>
          <button data-mode="bw" class="scanmode rounded-xl border px-2 py-2.5 text-xs font-bold">Black &amp; white</button>
          <button data-mode="original" class="scanmode rounded-xl border px-2 py-2.5 text-xs font-bold">Original</button>
        </div>
        <div class="text-sm font-bold"> ${ic('ph-sliders-horizontal', 'text-base')} Adjust</div>
        <label class="mt-4 block text-xs font-semibold text-zinc-500">BRIGHTNESS: <span id="bVal">0</span></label>
        <input id="optB" type="range" min="-100" max="100" step="1" value="0" class="mt-1 w-full" />
        <label class="mt-4 block text-xs font-semibold text-zinc-500">CONTRAST: <span id="cVal">105</span>%</label>
        <input id="optC" type="range" min="20" max="200" step="1" value="105" class="mt-1 w-full" />
        <label class="mt-4 block text-xs font-semibold text-zinc-500">WHITE BACKGROUND: <span id="wVal">55</span>%</label>
        <input id="optW" type="range" min="0" max="100" step="1" value="55" class="mt-1 w-full" />
        <label class="mt-4 block text-xs font-semibold text-zinc-500">SHARPNESS: <span id="sVal">30</span>%</label>
        <input id="optS" type="range" min="0" max="100" step="1" value="30" class="mt-1 w-full" />
        <div id="thrRow" class="hidden">
          <label class="mt-4 block text-xs font-semibold text-zinc-500">INK THRESHOLD: <span id="tVal">auto</span></label>
          <input id="optT" type="range" min="-60" max="60" step="1" value="0" class="mt-1 w-full" />
        </div>
        <label class="mt-4 block text-xs font-semibold text-zinc-500">SAVE AS</label>
        <select id="optFmt" class="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800">
          <option value="jpg">JPG (smallest)</option>
          <option value="png">PNG (lossless)</option>
          <option value="pdf">PDF (one page)</option>
        </select>
        <button id="go" class="mt-5 w-full btn-press rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">Download scan</button>
        <p class="mt-3 font-mono text-[11px] leading-relaxed text-zinc-400">Tip: photograph the page flat in daylight, then raise White background until the paper turns pure white.</p>
      </div>
    </div>`

  const dzHost = el.querySelector<HTMLElement>('#dz')!
  const dz = createDropzone({ container: dzHost, accept: meta.accept, multiple: false, hint: 'Photo of a document' })
  const prevWrap = el.querySelector<HTMLElement>('#prevWrap')!
  const preview = el.querySelector<HTMLCanvasElement>('#preview')!
  const go = el.querySelector<HTMLButtonElement>('#go')!
  const sliders = {
    b: el.querySelector<HTMLInputElement>('#optB')!,
    c: el.querySelector<HTMLInputElement>('#optC')!,
    w: el.querySelector<HTMLInputElement>('#optW')!,
    s: el.querySelector<HTMLInputElement>('#optS')!,
    t: el.querySelector<HTMLInputElement>('#optT')!,
  }
  const labels = {
    b: el.querySelector<HTMLElement>('#bVal')!,
    c: el.querySelector<HTMLElement>('#cVal')!,
    w: el.querySelector<HTMLElement>('#wVal')!,
    s: el.querySelector<HTMLElement>('#sVal')!,
    t: el.querySelector<HTMLElement>('#tVal')!,
  }
  const thrRow = el.querySelector<HTMLElement>('#thrRow')!
  const modeBtns = [...el.querySelectorAll<HTMLButtonElement>('.scanmode')]

  function paintModes(): void {
    for (const btn of modeBtns) {
      const on = btn.dataset.mode === settings.mode
      btn.className = `scanmode rounded-xl border px-2 py-2.5 text-xs font-bold transition ${
        on
          ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950'
          : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-white/10 dark:text-zinc-300'
      }`
    }
    thrRow.classList.toggle('hidden', settings.mode !== 'bw')
  }

  function syncLabels(): void {
    labels.b.textContent = String(settings.brightness)
    labels.c.textContent = String(settings.contrast)
    labels.w.textContent = String(settings.whiten)
    labels.s.textContent = String(settings.sharpen)
    labels.t.textContent = settings.threshold === 0 ? 'auto' : settings.threshold > 0 ? `+${settings.threshold}` : String(settings.threshold)
  }

  function readInputs(): void {
    settings.brightness = Number(sliders.b.value)
    settings.contrast = Number(sliders.c.value)
    settings.whiten = Number(sliders.w.value)
    settings.sharpen = Number(sliders.s.value)
    settings.threshold = Number(sliders.t.value)
    syncLabels()
  }

  let raf = 0
  function schedulePreview(): void {
    if (!state.img || raf !== 0) return
    raf = requestAnimationFrame(() => {
      raf = 0
      if (!state.img) return
      try {
        const c = buildCanvas(state.img, settings, PREVIEW_SIDE)
        preview.width = c.width
        preview.height = c.height
        preview.getContext('2d')!.drawImage(c, 0, 0)
      } catch {
        toast('Preview failed on this image.', 'err')
      }
    })
  }

  for (const btn of modeBtns) {
    btn.addEventListener('click', () => {
      settings.mode = btn.dataset.mode as ScanMode
      paintModes()
      schedulePreview()
    })
  }
  for (const s of Object.values(sliders)) s.addEventListener('input', () => {
    readInputs()
    schedulePreview()
  })

  el.querySelector<HTMLButtonElement>('#rotL')!.addEventListener('click', () => {
    settings.rotation = (settings.rotation + 3) % 4
    schedulePreview()
  })
  el.querySelector<HTMLButtonElement>('#rotR')!.addEventListener('click', () => {
    settings.rotation = (settings.rotation + 1) % 4
    schedulePreview()
  })
  el.querySelector<HTMLButtonElement>('#reset')!.addEventListener('click', () => {
    Object.assign(settings, DEFAULTS)
    sliders.b.value = String(settings.brightness)
    sliders.c.value = String(settings.contrast)
    sliders.w.value = String(settings.whiten)
    sliders.s.value = String(settings.sharpen)
    sliders.t.value = String(settings.threshold)
    syncLabels()
    paintModes()
    schedulePreview()
  })

  dzHost.addEventListener('files-changed', async () => {
    const files = dz.getFiles()
    if (!files.length) return
    state.file = files[0]
    try {
      state.img = await loadImage(state.file)
      prevWrap.classList.remove('hidden')
      schedulePreview()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed.', 'err')
    }
  })

  go.addEventListener('click', async () => {
    if (!state.img || !state.file) return toast('Add a photo first.', 'err')
    const fmt = (el.querySelector<HTMLSelectElement>('#optFmt')!).value
    go.disabled = true
    try {
      const canvas = buildCanvas(state.img, settings, EXPORT_SIDE)
      const name = `${baseName(state.file.name)}-scanned`
      if (fmt === 'pdf') {
        const url = canvas.toDataURL('image/jpeg', 0.92)
        const px2mm = 25.4 / 96
        const wmm = canvas.width * px2mm
        const hmm = canvas.height * px2mm
        const doc = new jsPDF({ unit: 'mm', format: [wmm, hmm], orientation: wmm > hmm ? 'l' : 'p' })
        doc.addImage(url, 'JPEG', 0, 0, wmm, hmm)
        doc.save(`${name}.pdf`)
      } else {
        const type = fmt === 'png' ? 'image/png' : 'image/jpeg'
        const blob = await canvasToBlob(canvas, type, fmt === 'png' ? undefined : 0.92)
        downloadBlob(blob, `${name}.${fmt === 'png' ? 'png' : 'jpg'}`)
      }
      toast('Scan saved.', 'ok')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed.', 'err')
    } finally {
      go.disabled = false
    }
  })

  paintModes()
  syncLabels()
}

/** Rotate + fit inside maxSide, then run the enhancement pipeline. */
function buildCanvas(img: HTMLImageElement, s: ScanSettings, maxSide: number): HTMLCanvasElement {
  const swap = s.rotation % 2 === 1
  let w = swap ? img.naturalHeight : img.naturalWidth
  let h = swap ? img.naturalWidth : img.naturalHeight
  const scale = Math.min(1, maxSide / Math.max(w, h))
  w = Math.max(1, Math.round(w * scale))
  h = Math.max(1, Math.round(h * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate((s.rotation * Math.PI) / 2)
  const dw = swap ? h : w
  const dh = swap ? w : h
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
  ctx.restore()
  if (s.mode !== 'original') enhance(ctx, w, h, s)
  return canvas
}

/** Brightness/contrast, paper whitening, optional grayscale / Otsu B&W, sharpen. */
function enhance(ctx: CanvasRenderingContext2D, w: number, h: number, s: ScanSettings): void {
  const frame = ctx.getImageData(0, 0, w, h)
  const d = frame.data
  const cf = s.contrast / 100
  const b = s.brightness
  const gray = s.mode !== 'original' && s.mode !== 'color'
  const wantHist = s.mode === 'bw'
  const hist = wantHist ? new Uint32Array(256) : null
  const lumBuf = wantHist ? new Uint8Array(w * h) : null
  const wAmt = s.whiten / 100

  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    let r = d[i]
    let g = d[i + 1]
    let bl = d[i + 2]
    if (gray) {
      const l = 0.299 * r + 0.587 * g + 0.114 * bl
      r = g = bl = l
    }
    r = (r - 128) * cf + 128 + b
    g = (g - 128) * cf + 128 + b
    bl = (bl - 128) * cf + 128 + b
    if (wAmt > 0) {
      // Lift bright paper toward pure white, leave dark ink alone.
      const lum = 0.299 * r + 0.587 * g + 0.114 * bl
      const f = wAmt * Math.min(1, Math.max(0, (lum - 25) / 200))
      const inv = 1 - f
      r = r * inv + 255 * f
      g = g * inv + 255 * f
      bl = bl * inv + 255 * f
    }
    d[i] = r
    d[i + 1] = g
    d[i + 2] = bl
    if (hist && lumBuf) {
      const l = Math.min(255, Math.max(0, Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])))
      lumBuf[p] = l
      hist[l]++
    }
  }

  if (s.mode === 'bw' && hist && lumBuf) {
    const cutoff = otsu(hist, w * h) + s.threshold
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const v = lumBuf[p] >= cutoff ? 255 : 0
      d[i] = v
      d[i + 1] = v
      d[i + 2] = v
    }
  }

  if (s.sharpen > 0) sharpen3x3(frame, w, h, s.sharpen / 100)
  ctx.putImageData(frame, 0, 0)
}

/** Otsu's method: automatic ink/paper cutoff from the luminance histogram. */
function otsu(hist: Uint32Array, total: number): number {
  let sum = 0
  for (let t = 0; t < 256; t++) sum += t * hist[t]
  let sumB = 0
  let wB = 0
  let best = 0
  let bestVar = -1
  for (let t = 0; t < 256; t++) {
    wB += hist[t]
    if (wB === 0) continue
    const wF = total - wB
    if (wF === 0) break
    sumB += t * hist[t]
    const mB = sumB / wB
    const mF = (sum - sumB) / wF
    const between = wB * wF * (mB - mF) * (mB - mF)
    if (between > bestVar) {
      bestVar = between
      best = t
    }
  }
  return best
}

/** Unsharp-style 3x3 convolution for crisper text edges. */
function sharpen3x3(frame: ImageData, w: number, h: number, amt: number): void {
  const d = frame.data
  const src = new Uint8ClampedArray(d)
  const k = amt * 0.8
  const boost = 1 + 4 * k
  for (let y = 0; y < h; y++) {
    const up = y > 0 ? -w * 4 : 0
    const dn = y < h - 1 ? w * 4 : 0
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const l = x > 0 ? -4 : 0
      const r = x < w - 1 ? 4 : 0
      for (let c = 0; c < 3; c++) {
        d[i + c] = src[i + c] * boost - k * (src[i + l + c] + src[i + r + c] + src[i + up + c] + src[i + dn + c])
      }
    }
  }
}
