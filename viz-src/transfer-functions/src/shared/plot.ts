export const INK = '#1d2326'
export const INK_SOFT = '#565f63'
export const MUTE = '#8b9497'
export const LINE = '#d1d8da'
export const GRID = '#e6eaeb'
export const ZERO = '#b7c1c4'
export const ACCENT = 'oklch(0.52 0.09 250)'
export const ACCENT_FILL = 'oklch(0.52 0.09 250 / 0.22)'
export const WARN = 'oklch(0.55 0.15 30)'
export const MONO = "'IBM Plex Mono', monospace"
export const SANS = "'Public Sans', system-ui, sans-serif"

/** Number with a real minus sign; tiny values print as 0. */
export const fmt = (x: number, n = 2) => (Math.abs(x) < 0.5 * 10 ** -n ? 0 : x).toFixed(n).replace('-', '−')

export interface Frame {
  sx: (x: number) => number
  sy: (y: number) => number
  ix: (px: number) => number
  iy: (py: number) => number
  l: number
  r: number
  t: number
  b: number
}

export interface FrameOpts {
  x: [number, number]
  y: [number, number]
  xUnit?: string
  yLabel?: string
  xLog?: boolean
  yLog?: boolean
  yTickFmt?: (v: number) => string
  margin?: Partial<{ l: number; r: number; t: number; b: number }>
}

export function niceStep(span: number, target = 4) {
  const raw = span / target
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p
}

const ticks = (lo: number, hi: number, log: boolean, target: number) => {
  const out: number[] = []
  if (log) {
    for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) {
      const v = 10 ** e
      if (v >= lo * 0.999 && v <= hi * 1.001) out.push(v)
    }
    return out
  }
  const st = niceStep(hi - lo, target)
  for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) out.push(Math.abs(v) < 1e-12 ? 0 : v)
  return out
}

const tickLabel = (v: number) => {
  if (v !== 0 && (Math.abs(v) >= 1000 || Math.abs(v) < 0.01)) return v.toExponential(0).replace('-', '−')
  const s = Math.abs(v) >= 10 || Number.isInteger(v) ? v.toFixed(0) : Math.abs(v) >= 1 ? v.toFixed(1) : String(+v.toFixed(2))
  return s.replace('-', '−')
}

/** Axes box, grid and tick labels; returns the coordinate maps. */
export function frame(ctx: CanvasRenderingContext2D, w: number, h: number, o: FrameOpts): Frame {
  const M = { l: 44, r: 14, t: 12, b: 24, ...o.margin }
  const pw = w - M.l - M.r
  const ph = h - M.t - M.b
  const tx = o.xLog ? Math.log10 : (v: number) => v
  const ty = o.yLog ? Math.log10 : (v: number) => v
  const [x0, x1] = o.x.map(tx)
  const [y0, y1] = o.y.map(ty)
  const sx = (x: number) => M.l + ((tx(x) - x0) / (x1 - x0)) * pw
  const sy = (y: number) => M.t + ((y1 - ty(y)) / (y1 - y0)) * ph
  const ix = (px: number) => {
    const v = x0 + ((px - M.l) / pw) * (x1 - x0)
    return o.xLog ? 10 ** v : v
  }
  const iy = (py: number) => {
    const v = y1 - ((py - M.t) / ph) * (y1 - y0)
    return o.yLog ? 10 ** v : v
  }

  ctx.font = `10px ${MONO}`
  ctx.lineWidth = 1
  ticks(o.y[0], o.y[1], !!o.yLog, 4).forEach((v) => {
    const y = Math.round(sy(v)) + 0.5
    ctx.strokeStyle = !o.yLog && v === 0 ? ZERO : GRID
    ctx.beginPath()
    ctx.moveTo(M.l, y)
    ctx.lineTo(M.l + pw, y)
    ctx.stroke()
    ctx.fillStyle = MUTE
    ctx.textAlign = 'right'
    ctx.fillText(o.yTickFmt ? o.yTickFmt(v) : tickLabel(v), M.l - 6, y + 3)
  })
  const xt = ticks(o.x[0], o.x[1], !!o.xLog, 6)
  xt.forEach((v, i) => {
    const x = Math.round(sx(v)) + 0.5
    ctx.strokeStyle = GRID
    ctx.beginPath()
    ctx.moveTo(x, M.t)
    ctx.lineTo(x, M.t + ph)
    ctx.stroke()
    ctx.fillStyle = MUTE
    ctx.textAlign = 'center'
    const last = i === xt.length - 1 && o.xUnit
    ctx.fillText(tickLabel(v) + (last ? ' ' + o.xUnit : ''), x, M.t + ph + 15)
  })
  ctx.strokeStyle = LINE
  ctx.strokeRect(M.l + 0.5, M.t + 0.5, pw, ph)
  if (o.yLabel) {
    ctx.textAlign = 'left'
    ctx.font = `500 11px ${SANS}`
    ctx.fillStyle = INK_SOFT
    ctx.fillText(o.yLabel, M.l + 8, M.t + 15)
  }
  return { sx, sy, ix, iy, l: M.l, r: M.l + pw, t: M.t, b: M.t + ph }
}

export function clip(ctx: CanvasRenderingContext2D, f: Frame) {
  ctx.beginPath()
  ctx.rect(f.l, f.t, f.r - f.l, f.b - f.t)
  ctx.clip()
}

export interface LineStyle {
  color: string
  width?: number
  dash?: number[]
}

/** Polyline through (xs[k], ys[k]) for k in [k0, k1]. */
export function polyline(ctx: CanvasRenderingContext2D, f: Frame, xs: ArrayLike<number>, ys: ArrayLike<number>, s: LineStyle, k0 = 0, k1 = xs.length - 1) {
  if (k1 < k0) return
  ctx.save()
  clip(ctx, f)
  ctx.strokeStyle = s.color
  ctx.lineWidth = s.width ?? 2
  ctx.lineJoin = 'round'
  ctx.setLineDash(s.dash ?? [])
  ctx.beginPath()
  for (let k = k0; k <= k1; k++) {
    const x = f.sx(xs[k])
    const y = Math.max(-1e4, Math.min(1e4, f.sy(ys[k])))
    if (k === k0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.restore()
}

/** Area between the curve and zero, for k in [k0, k1]. */
export function fillArea(ctx: CanvasRenderingContext2D, f: Frame, xs: ArrayLike<number>, ys: ArrayLike<number>, color: string, k0 = 0, k1 = xs.length - 1) {
  if (k1 <= k0) return
  ctx.save()
  clip(ctx, f)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(f.sx(xs[k0]), f.sy(0))
  for (let k = k0; k <= k1; k++) ctx.lineTo(f.sx(xs[k]), Math.max(-1e4, Math.min(1e4, f.sy(ys[k]))))
  ctx.lineTo(f.sx(xs[k1]), f.sy(0))
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function vline(ctx: CanvasRenderingContext2D, f: Frame, x: number, color = INK, dash = [3, 3]) {
  const px = Math.round(f.sx(x)) + 0.5
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(px, f.t)
  ctx.lineTo(px, f.b)
  ctx.stroke()
  ctx.setLineDash([])
}

export function hline(ctx: CanvasRenderingContext2D, f: Frame, y: number, color = INK, dash = [3, 3], x0?: number, x1?: number) {
  const py = Math.round(f.sy(y)) + 0.5
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(x0 === undefined ? f.l : f.sx(x0), py)
  ctx.lineTo(x1 === undefined ? f.r : f.sx(x1), py)
  ctx.stroke()
  ctx.setLineDash([])
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, r = 4, hollow = false) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  if (hollow) {
    ctx.fillStyle = '#f8fafb'
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.stroke()
  } else {
    ctx.fillStyle = color
    ctx.fill()
  }
}

/** Straight arrow from (x0, y0) to (x1, y1). */
export function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width = 2, head = 7) {
  const m = Math.hypot(x1 - x0, y1 - y0)
  if (m < 1) return
  const ux = (x1 - x0) / m
  const uy = (y1 - y0) / m
  const hs = Math.min(head, m * 0.6)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1 - ux * hs * 0.6, y1 - uy * hs * 0.6)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 - ux * hs + uy * hs * 0.55, y1 - uy * hs - ux * hs * 0.55)
  ctx.lineTo(x1 - ux * hs - uy * hs * 0.55, y1 - uy * hs + ux * hs * 0.55)
  ctx.closePath()
  ctx.fill()
}

export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = INK_SOFT, align: CanvasTextAlign = 'left', font = `500 11px ${SANS}`) {
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.fillText(text, x, y)
}

/** Rounded tag with text, centered on (x, y). */
export function tag(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color = ACCENT, bg = 'oklch(0.52 0.09 250 / 0.12)') {
  ctx.font = `500 11px ${SANS}`
  const w = ctx.measureText(text).width + 14
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.roundRect(x - w / 2, y - 10, w, 20, 10)
  ctx.fill()
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.fillText(text, x, y + 4)
}

/** Range of the finite values in the arrays, padded, always containing 0. */
export function rangeOf(arrs: ArrayLike<number>[], minSpan = 1, pad = 0.12): [number, number] {
  let lo = 0
  let hi = 0
  for (const a of arrs)
    for (let k = 0; k < a.length; k++) {
      const v = a[k]
      if (!Number.isFinite(v)) continue
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
  if (hi - lo < minSpan) {
    const c = (hi + lo) / 2
    lo = Math.min(lo, c - minSpan / 2)
    hi = Math.max(hi, c + minSpan / 2)
  }
  const p = (hi - lo) * pad
  return [lo - p, hi + p]
}

export const grid = (a: number, b: number, n: number) => {
  const xs = new Float64Array(n + 1)
  for (let k = 0; k <= n; k++) xs[k] = a + ((b - a) * k) / n
  return xs
}
