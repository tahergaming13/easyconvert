// Inline Phosphor icons (regular weight) — only the set the app uses.
// Imported as raw SVG so the bundle carries ~34 one-kilobyte glyphs
// instead of the full 144 KB icon font. Call sites keep the
// 'ph-<name>' convention: ic('ph-check-circle', 'text-lg').
import svgArchive from '@phosphor-icons/core/assets/regular/archive.svg?raw'
import svgArrowClockwise from '@phosphor-icons/core/assets/regular/arrow-clockwise.svg?raw'
import svgArrowDown from '@phosphor-icons/core/assets/regular/arrow-down.svg?raw'
import svgArrowLeft from '@phosphor-icons/core/assets/regular/arrow-left.svg?raw'
import svgArrowRight from '@phosphor-icons/core/assets/regular/arrow-right.svg?raw'
import svgArrowUp from '@phosphor-icons/core/assets/regular/arrow-up.svg?raw'
import svgArrowsIn from '@phosphor-icons/core/assets/regular/arrows-in.svg?raw'
import svgArrowsLeftRight from '@phosphor-icons/core/assets/regular/arrows-left-right.svg?raw'
import svgCaretDown from '@phosphor-icons/core/assets/regular/caret-down.svg?raw'
import svgCheckCircle from '@phosphor-icons/core/assets/regular/check-circle.svg?raw'
import svgCopy from '@phosphor-icons/core/assets/regular/copy.svg?raw'
import svgDownloadSimple from '@phosphor-icons/core/assets/regular/download-simple.svg?raw'
import svgFileArchive from '@phosphor-icons/core/assets/regular/file-archive.svg?raw'
import svgFileImage from '@phosphor-icons/core/assets/regular/file-image.svg?raw'
import svgFilePdf from '@phosphor-icons/core/assets/regular/file-pdf.svg?raw'
import svgFileText from '@phosphor-icons/core/assets/regular/file-text.svg?raw'
import svgFileX from '@phosphor-icons/core/assets/regular/file-x.svg?raw'
import svgHouse from '@phosphor-icons/core/assets/regular/house.svg?raw'
import svgImage from '@phosphor-icons/core/assets/regular/image.svg?raw'
import svgInfo from '@phosphor-icons/core/assets/regular/info.svg?raw'
import svgLightning from '@phosphor-icons/core/assets/regular/lightning.svg?raw'
import svgList from '@phosphor-icons/core/assets/regular/list.svg?raw'
import svgLockKey from '@phosphor-icons/core/assets/regular/lock-key.svg?raw'
import svgMagnifyingGlass from '@phosphor-icons/core/assets/regular/magnifying-glass.svg?raw'
import svgMoon from '@phosphor-icons/core/assets/regular/moon.svg?raw'
import svgNotePencil from '@phosphor-icons/core/assets/regular/note-pencil.svg?raw'
import svgScissors from '@phosphor-icons/core/assets/regular/scissors.svg?raw'
import svgShieldCheck from '@phosphor-icons/core/assets/regular/shield-check.svg?raw'
import svgSlidersHorizontal from '@phosphor-icons/core/assets/regular/sliders-horizontal.svg?raw'
import svgStack from '@phosphor-icons/core/assets/regular/stack.svg?raw'
import svgStar from '@phosphor-icons/core/assets/regular/star.svg?raw'
import svgSun from '@phosphor-icons/core/assets/regular/sun.svg?raw'
import svgTextAa from '@phosphor-icons/core/assets/regular/text-aa.svg?raw'
import svgUploadSimple from '@phosphor-icons/core/assets/regular/upload-simple.svg?raw'
import svgWarningCircle from '@phosphor-icons/core/assets/regular/warning-circle.svg?raw'
import svgX from '@phosphor-icons/core/assets/regular/x.svg?raw'

const GLYPHS: Record<string, string> = {
  archive: svgArchive,
  'arrow-clockwise': svgArrowClockwise,
  'arrow-down': svgArrowDown,
  'arrow-left': svgArrowLeft,
  'arrow-right': svgArrowRight,
  'arrow-up': svgArrowUp,
  'arrows-in': svgArrowsIn,
  'arrows-left-right': svgArrowsLeftRight,
  'caret-down': svgCaretDown,
  'check-circle': svgCheckCircle,
  copy: svgCopy,
  'download-simple': svgDownloadSimple,
  'file-archive': svgFileArchive,
  'file-image': svgFileImage,
  'file-pdf': svgFilePdf,
  'file-text': svgFileText,
  'file-x': svgFileX,
  house: svgHouse,
  image: svgImage,
  info: svgInfo,
  lightning: svgLightning,
  list: svgList,
  'lock-key': svgLockKey,
  'magnifying-glass': svgMagnifyingGlass,
  moon: svgMoon,
  'note-pencil': svgNotePencil,
  scissors: svgScissors,
  'shield-check': svgShieldCheck,
  'sliders-horizontal': svgSlidersHorizontal,
  stack: svgStack,
  star: svgStar,
  sun: svgSun,
  'text-aa': svgTextAa,
  'upload-simple': svgUploadSimple,
  'warning-circle': svgWarningCircle,
  x: svgX,
}

export function ic(name: string, cls = 'text-lg'): string {
  const key = name.startsWith('ph-') ? name.slice(3) : name
  const raw = GLYPHS[key]
  if (!raw) return ''
  return raw.replace(
    '<svg ',
    `<svg class="ph ${cls}" width="1em" height="1em" focusable="false" aria-hidden="true" `,
  )
}
