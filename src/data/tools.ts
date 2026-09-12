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
  gradient: string
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
    gradient: 'from-indigo-500 to-violet-500',
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
    gradient: 'from-rose-500 to-orange-500',
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
    gradient: 'from-sky-500 to-cyan-400',
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
    gradient: 'from-emerald-500 to-teal-500',
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
    gradient: 'from-violet-500 to-purple-500',
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
    gradient: 'from-amber-500 to-yellow-500',
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
    gradient: 'from-green-500 to-lime-500',
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
    gradient: 'from-blue-500 to-indigo-500',
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
    gradient: 'from-slate-500 to-gray-600',
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
    gradient: 'from-fuchsia-500 to-pink-500',
  },
]

export function getTool(id: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.id === id)
}
