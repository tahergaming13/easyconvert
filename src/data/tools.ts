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
  /** Solid tile classes (ink chip, lime glyph — inverts in dark mode). No gradients. */
  tile: string
}

const TILE = 'bg-zinc-950 text-lime-300 dark:bg-lime-300 dark:text-zinc-950'

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
    tile: TILE,
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
    tile: TILE,
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
    tile: TILE,
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
    tile: TILE,
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
    tile: TILE,
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
    tile: TILE,
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
    tile: TILE,
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
    tile: TILE,
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
    tile: TILE,
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
    tile: TILE,
  },
]

export function getTool(id: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.id === id)
}
