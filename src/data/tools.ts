export interface ToolMeta {
  id: string
  name: string
  tagline: string
  desc: string
  category: 'PDF' | 'Image'
  accept: string
  multiple: boolean
  badge?: string
  icon: string
  /** Pastel file-type tile (light) / tinted glyph on translucent tile (dark). */
  tile: string
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    tagline: 'JPG / PNG → PDF',
    desc: 'Combine images into one clean PDF. Reorder, pick page size and quality.',
    category: 'Image',
    accept: 'image/*',
    multiple: true,
    badge: 'Popular',
    icon: 'ph-file-pdf',
    tile: 'bg-blue-100 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300',
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Images',
    tagline: 'PDF → JPG / PNG',
    desc: 'Export every page as crisp JPG or PNG images. Download one-by-one or as ZIP.',
    category: 'PDF',
    accept: 'application/pdf,.pdf',
    multiple: false,
    badge: 'Popular',
    icon: 'ph-file-image',
    tile: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300',
  },
  {
    id: 'image-convert',
    name: 'Image Converter',
    tagline: 'JPG ↔ PNG ↔ WebP',
    desc: 'Convert between JPG, PNG, WebP and more. Batch supported with ZIP export.',
    category: 'Image',
    accept: 'image/*',
    multiple: true,
    icon: 'ph-arrows-left-right',
    tile: 'bg-sky-100 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300',
  },
  {
    id: 'image-compress',
    name: 'Compress & Resize',
    tagline: 'Shrink images',
    desc: 'Reduce size with quality slider + max dimensions. Perfect for web uploads.',
    category: 'Image',
    accept: 'image/*',
    multiple: true,
    icon: 'ph-arrows-in',
    tile: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  },
  {
    id: 'image-scan',
    name: 'Document Scanner',
    tagline: 'Photo → clean scan',
    desc: 'Point at a document: auto edge detection, perspective crop, white background, B&W mode.',
    category: 'Image',
    accept: 'image/*',
    multiple: false,
    badge: 'New',
    icon: 'ph-scan',
    tile: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-300',
  },
  {
    id: 'pdf-merge',
    name: 'Merge PDF',
    tagline: 'Join PDFs',
    desc: 'Combine multiple PDFs into one document. Drag to reorder before merging.',
    category: 'PDF',
    accept: 'application/pdf,.pdf',
    multiple: true,
    icon: 'ph-stack',
    tile: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  },
  {
    id: 'pdf-split',
    name: 'Split PDF',
    tagline: 'Extract pages',
    desc: 'Extract a page range like 1-3,5 or split every page into a ZIP.',
    category: 'PDF',
    accept: 'application/pdf,.pdf',
    multiple: false,
    icon: 'ph-scissors',
    tile: 'bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300',
  },
  {
    id: 'pdf-compress',
    name: 'Compress PDF',
    tagline: 'Smaller PDF',
    desc: 'Re-render pages at lower quality to shrink large PDFs. 3 levels.',
    category: 'PDF',
    accept: 'application/pdf,.pdf',
    multiple: false,
    icon: 'ph-file-archive',
    tile: 'bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300',
  },
  {
    id: 'pdf-rotate',
    name: 'Rotate PDF',
    tagline: 'Fix orientation',
    desc: 'Rotate all pages or a range by 90°, 180° or 270°. Instant and lossless.',
    category: 'PDF',
    accept: 'application/pdf,.pdf',
    multiple: false,
    icon: 'ph-arrow-clockwise',
    tile: 'bg-zinc-200 text-zinc-600 dark:bg-white/10 dark:text-zinc-300',
  },
  {
    id: 'pdf-to-text',
    name: 'PDF to Text',
    tagline: 'Extract text',
    desc: 'Pull selectable text out of any PDF into a clean .txt file.',
    category: 'PDF',
    accept: 'application/pdf,.pdf',
    multiple: false,
    icon: 'ph-text-aa',
    tile: 'bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-300',
  },
  {
    id: 'text-to-pdf',
    name: 'Text to PDF',
    tagline: 'TXT / MD → PDF',
    desc: 'Paste text or drop .txt/.md and get a nicely formatted PDF.',
    category: 'PDF',
    accept: '.txt,.md,.markdown,text/plain',
    multiple: false,
    icon: 'ph-note-pencil',
    tile: 'bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300',
  },
]

export function getTool(id: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.id === id)
}
