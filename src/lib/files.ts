// Shared file helpers — 100% client-side, no uploads.

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const v = bytes / Math.pow(1024, i)
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)} ${units[i]}`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 800)
}

export function baseName(filename: string): string {
  const i = filename.lastIndexOf('.')
  return i > 0 ? filename.slice(0, i) : filename
}

export function extOf(filename: string): string {
  const i = filename.lastIndexOf('.')
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : ''
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Could not read image: ${file.name}`))
    }
    img.src = url
  })
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))),
      type,
      quality,
    )
  })
}

/** Draw image into canvas respecting max dims, returns canvas. */
export async function imageFileToCanvas(
  file: File,
  maxW?: number,
  maxH?: number,
): Promise<HTMLCanvasElement> {
  const img = await loadImage(file)
  let w = img.naturalWidth
  let h = img.naturalHeight
  if (maxW && w > maxW) {
    h = Math.round((h * maxW) / w)
    w = maxW
  }
  if (maxH && h > maxH) {
    w = Math.round((w * maxH) / h)
    h = maxH
  }
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  // White background so PNG transparency -> JPG looks clean
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(img, 0, 0, w, h)
  return canvas
}

/** Parse "1-3,5" into 1-based page numbers clamped to max. */
export function parsePageRange(input: string, max: number): number[] {
  const raw = input.trim().toLowerCase()
  if (!raw || raw === 'all') return Array.from({ length: max }, (_, i) => i + 1)
  const set = new Set<number>()
  for (const part of raw.split(',')) {
    const p = part.trim()
    if (!p) continue
    if (p.includes('-')) {
      const [a, b] = p.split('-').map((x) => parseInt(x.trim(), 10))
      if (Number.isNaN(a)) continue
      const end = Number.isNaN(b) ? a : b
      const from = Math.max(1, Math.min(a, end))
      const to = Math.min(max, Math.max(a, end))
      for (let i = from; i <= to; i++) set.add(i)
    } else {
      const n = parseInt(p, 10)
      if (!Number.isNaN(n) && n >= 1 && n <= max) set.add(n)
    }
  }
  return [...set].sort((a, b) => a - b)
}

let pdfjsCache: typeof import('pdfjs-dist') | null = null

/** Lazy-load pdf.js + set worker. */
export async function getPdfjs(): Promise<typeof import('pdfjs-dist')> {
  if (pdfjsCache) return pdfjsCache
  const mod = await import('pdfjs-dist')
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  const workerSrc: string = (worker as unknown as { default: string }).default
  ;(mod as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = workerSrc
  pdfjsCache = mod
  return mod
}

export function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || extOf(file.name) === 'pdf'
}

export function isImage(file: File): boolean {
  return file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'avif', 'ico'].includes(extOf(file.name))
}
