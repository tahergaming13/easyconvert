// Document edge detection + perspective warp. Pure TypeScript, no framework deps.
// Pipeline: grayscale -> blur -> Otsu threshold -> largest component -> convex
// hull -> polygon approx -> ordered quad -> homography warp (bilinear).

export interface Pt {
  x: number
  y: number
}

export interface Quad {
  tl: Pt
  tr: Pt
  br: Pt
  bl: Pt
}

export function fullFrameQuad(w: number, h: number): Quad {
  return {
    tl: { x: 0, y: 0 },
    tr: { x: w, y: 0 },
    br: { x: w, y: h },
    bl: { x: 0, y: h },
  }
}

export function quadArea(q: Quad): number {
  const p = [q.tl, q.tr, q.br, q.bl]
  let a = 0
  for (let i = 0; i < 4; i++) {
    const p1 = p[i]
    const p2 = p[(i + 1) % 4]
    a += p1.x * p2.y - p2.x * p1.y
  }
  return Math.abs(a / 2)
}

function lum(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/** Otsu's automatic threshold from a 256-bin histogram. */
export function otsuThreshold(hist: Uint32Array, total: number): number {
  let sum = 0
  for (let t = 0; t < 256; t++) sum += t * hist[t]
  let sumB = 0
  let wB = 0
  let bestLo = 127
  let bestHi = 127
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
      bestLo = t
      bestHi = t
    } else if (between === bestVar) {
      bestHi = t
    }
  }
  // Midpoint of the max plateau (ties span flat histogram regions).
  return (bestLo + bestHi) >> 1
}

/** Monotone-chain convex hull (CCW, no duplicate endpoint). */
export function convexHull(pts: Pt[]): Pt[] {
  const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y)
  if (p.length < 3) return p
  const cross = (o: Pt, a: Pt, b: Pt): number => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const lower: Pt[] = []
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop()
    lower.push(q)
  }
  const upper: Pt[] = []
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop()
    upper.push(q)
  }
  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

function segDist(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

/** Ramer-Douglas-Peucker on a closed polygon. Returns simplified vertices. */
export function approxPoly(pts: Pt[], epsilon: number): Pt[] {
  const n = pts.length
  if (n <= 4) return pts.slice()
  // Anchor the ring at the vertex farthest from the centroid (usually a true
  // corner) so near-anchor outliers can't survive the recursion unsplit.
  let cx = 0
  let cy = 0
  for (const p of pts) {
    cx += p.x
    cy += p.y
  }
  cx /= n
  cy /= n
  let ai = 0
  let ad = -1
  for (let i = 0; i < n; i++) {
    const d = (pts[i].x - cx) * (pts[i].x - cx) + (pts[i].y - cy) * (pts[i].y - cy)
    if (d > ad) {
      ad = d
      ai = i
    }
  }
  const ring: Pt[] = []
  for (let i = 0; i <= n; i++) ring.push(pts[(ai + i) % n])
  const keep = new Array<boolean>(n + 1).fill(false)
  keep[0] = true
  keep[n] = true
  const stack: Array<[number, number]> = [[0, n]]
  while (stack.length > 0) {
    const [s, e] = stack.pop()!
    let best = -1
    let bestD = epsilon
    for (let k = s + 1; k < e; k++) {
      const dist = segDist(ring[k], ring[s], ring[e])
      if (dist > bestD) {
        bestD = dist
        best = k
      }
    }
    if (best >= 0) {
      keep[best] = true
      stack.push([s, best], [best, e])
    }
  }
  const out: Pt[] = []
  for (let i = 0; i < n; i++) if (keep[i]) out.push(ring[i])
  // Removal post-pass for any surviving near-anchor artifact.
  while (out.length > 4) {
    let bi = -1
    let bd = Infinity
    const m = out.length
    for (let i = 0; i < m; i++) {
      const cost = segDist(out[i], out[(i + m - 1) % m], out[(i + 1) % m])
      if (cost < bd) {
        bd = cost
        bi = i
      }
    }
    if (bi < 0 || bd > epsilon) break
    out.splice(bi, 1)
  }
  return out
}

/** Assign 4 unordered corners to TL/TR/BR/BL via coordinate sums and diffs. */
export function orderCorners(pts: Pt[]): Quad {
  let tl = pts[0]
  let tr = pts[0]
  let br = pts[0]
  let bl = pts[0]
  for (const p of pts) {
    if (p.x + p.y < tl.x + tl.y) tl = p
    if (p.x + p.y > br.x + br.y) br = p
    if (p.x - p.y > tr.x - tr.y) tr = p
    if (p.x - p.y < bl.x - bl.y) bl = p
  }
  return { tl: { ...tl }, tr: { ...tr }, br: { ...br }, bl: { ...bl } }
}

/**
 * Solve the src -> dst planar homography (DLT, 8 unknowns + h[8] = 1).
 * Returns row-major 3x3. Use src = destination pixels, dst = source pixels
 * to get an inverse-mapping warp directly.
 */
export function solveHomography(src: Pt[], dst: Pt[]): number[] {
  const m: number[][] = []
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i]
    const { x: xp, y: yp } = dst[i]
    m.push([x, y, 1, 0, 0, 0, -xp * x, -xp * y, xp])
    m.push([0, 0, 0, x, y, 1, -yp * x, -yp * y, yp])
  }
  const n = 8
  for (let col = 0; col < n; col++) {
    let piv = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) piv = r
    }
    const tmp = m[col]
    m[col] = m[piv]
    m[piv] = tmp
    const div = m[col][col] === 0 ? 1e-12 : m[col][col]
    for (let c = col; c <= n; c++) m[col][c] /= div
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = m[r][col]
      if (f !== 0) {
        for (let c = col; c <= n; c++) m[r][c] -= f * m[col][c]
      }
    }
  }
  const h = m.map((row) => row[n])
  h.push(1)
  return h
}

export function applyHomography(h: number[], x: number, y: number): Pt {
  const w = h[6] * x + h[7] * y + h[8]
  return { x: (h[0] * x + h[1] * y + h[2]) / w, y: (h[3] * x + h[4] * y + h[5]) / w }
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * Find the document quad in an RGBA buffer (any size; caller downscales).
 * Returns corners in buffer coordinates, or null when nothing plausible.
 */
export function detectDocumentQuad(data: Uint8ClampedArray, w: number, h: number): Quad | null {
  if (w < 40 || h < 40) return null
  const n = w * h

  const gray = new Uint8Array(n)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = Math.round(lum(data[i], data[i + 1], data[i + 2]))
  }

  // 3x3 box blur to kill sensor noise.
  const blur = new Uint8Array(n)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0
      let count = 0
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= h) continue
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx
          if (xx < 0 || xx >= w) continue
          sum += gray[yy * w + xx]
          count++
        }
      }
      blur[y * w + x] = Math.round(sum / count)
    }
  }

  const hist = new Uint32Array(256)
  for (let p = 0; p < n; p++) hist[blur[p]]++
  const thr = otsuThreshold(hist, n)

  // Try bright-paper polarity first, then dark-paper.
  for (const polarity of [1, -1] as const) {
    const mask = new Uint8Array(n)
    let fg = 0
    for (let p = 0; p < n; p++) {
      const isFg = polarity === 1 ? blur[p] >= thr : blur[p] < thr
      if (isFg) {
        mask[p] = 1
        fg++
      }
    }
    const frac = fg / n
    if (frac < 0.04 || frac > 0.96) continue
    // For dark polarity, flood away the background touching the border.
    if (polarity === -1) {
      const stack = new Int32Array(n)
      let head = 0
      let tail = 0
      const push = (idx: number): void => {
        if (mask[idx] === 1) {
          mask[idx] = 0
          stack[tail++] = idx
        }
      }
      for (let x = 0; x < w; x++) {
        push(x)
        push((h - 1) * w + x)
      }
      for (let y = 0; y < h; y++) {
        push(y * w)
        push(y * w + (w - 1))
      }
      while (head < tail) {
        const idx = stack[head++]
        const x = idx % w
        const y = (idx / w) | 0
        if (x > 0) push(idx - 1)
        if (x < w - 1) push(idx + 1)
        if (y > 0) push(idx - w)
        if (y < h - 1) push(idx + w)
      }
    }
    const quad = largestQuad(mask, w, h)
    if (quad) {
      const area = quadArea(quad) / n
      if (area > 0.05 && area < 0.96) return quad
    }
  }
  return null
}

/** Largest connected component -> hull -> quad (or null). */
function largestQuad(mask: Uint8Array, w: number, h: number): Quad | null {
  const n = w * h
  const stack = new Int32Array(n)
  let cur: number[] = []
  let best: number[] = []
  for (let s = 0; s < n; s++) {
    if (mask[s] !== 1) continue
    cur.length = 0
    let head = 0
    let tail = 0
    mask[s] = 0
    stack[tail++] = s
    while (head < tail) {
      const idx = stack[head++]
      const x = idx % w
      const y = (idx / w) | 0
      if (((x + y) & 1) === 0) {
        cur.push(x, y)
      }
      if (x > 0 && mask[idx - 1] === 1) {
        mask[idx - 1] = 0
        stack[tail++] = idx - 1
      }
      if (x < w - 1 && mask[idx + 1] === 1) {
        mask[idx + 1] = 0
        stack[tail++] = idx + 1
      }
      if (y > 0 && mask[idx - w] === 1) {
        mask[idx - w] = 0
        stack[tail++] = idx - w
      }
      if (y < h - 1 && mask[idx + w] === 1) {
        mask[idx + w] = 0
        stack[tail++] = idx + w
      }
    }
    if (cur.length > best.length) {
      const tmp = best
      best = cur
      cur = tmp
    }
  }
  if (best.length < 8) return null
  const pts: Pt[] = []
  for (let i = 0; i < best.length; i += 2) pts.push({ x: best[i], y: best[i + 1] })
  const hull = convexHull(pts)
  if (hull.length < 4) return null
  let per = 0
  for (let i = 0; i < hull.length; i++) per += dist(hull[i], hull[(i + 1) % hull.length])
  for (const eps of [0.02 * per, 0.05 * per]) {
    const poly = approxPoly(hull, eps)
    if (poly.length === 4) return orderCorners(poly)
  }
  return null
}

/**
 * Perspective-warp the quad region of an image into a straight rectangle.
 * Quad corners are in the image's natural pixels. Output longest side <= maxSide.
 */
export function warpQuad(img: HTMLImageElement, quad: Quad, maxSide: number): HTMLCanvasElement {
  const top = dist(quad.tl, quad.tr)
  const bottom = dist(quad.bl, quad.br)
  const left = dist(quad.tl, quad.bl)
  const right = dist(quad.tr, quad.br)
  let dw = Math.max(1, Math.round(Math.max(top, bottom)))
  let dh = Math.max(1, Math.round(Math.max(left, right)))
  const scale = Math.min(1, maxSide / Math.max(dw, dh))
  dw = Math.max(1, Math.round(dw * scale))
  dh = Math.max(1, Math.round(dh * scale))

  const src = document.createElement('canvas')
  src.width = img.naturalWidth
  src.height = img.naturalHeight
  const sctx = src.getContext('2d', { willReadFrequently: true })!
  sctx.drawImage(img, 0, 0)
  const sdata = sctx.getImageData(0, 0, src.width, src.height).data
  const sw = src.width
  const sh = src.height

  // Inverse map: destination pixel -> source coordinate.
  const h = solveHomography(
    [
      { x: 0, y: 0 },
      { x: dw, y: 0 },
      { x: dw, y: dh },
      { x: 0, y: dh },
    ],
    [quad.tl, quad.tr, quad.br, quad.bl],
  )

  const out = document.createElement('canvas')
  out.width = dw
  out.height = dh
  const octx = out.getContext('2d')!
  const frame = octx.createImageData(dw, dh)
  const d = frame.data
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const p = applyHomography(h, x, y)
      let sx = p.x
      let sy = p.y
      sx = Math.max(0, Math.min(sw - 1.001, sx))
      sy = Math.max(0, Math.min(sh - 1.001, sy))
      const x0 = Math.floor(sx)
      const y0 = Math.floor(sy)
      const fx = sx - x0
      const fy = sy - y0
      const x1 = Math.min(sw - 1, x0 + 1)
      const y1 = Math.min(sh - 1, y0 + 1)
      const i = (y * dw + x) * 4
      for (let c = 0; c < 3; c++) {
        const a = sdata[(y0 * sw + x0) * 4 + c]
        const b2 = sdata[(y0 * sw + x1) * 4 + c]
        const c2 = sdata[(y1 * sw + x0) * 4 + c]
        const d2 = sdata[(y1 * sw + x1) * 4 + c]
        d[i + c] = a * (1 - fx) * (1 - fy) + b2 * fx * (1 - fy) + c2 * (1 - fx) * fy + d2 * fx * fy
      }
      d[i + 3] = 255
    }
  }
  octx.putImageData(frame, 0, 0)
  return out
}
