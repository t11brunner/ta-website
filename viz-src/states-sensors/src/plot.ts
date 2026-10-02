import { DT, T_END } from './sim'

export const INK = '#1d2326'
export const INK_SOFT = '#565f63'
export const MUTE = '#8b9497'
export const LINE = '#d1d8da'
export const ACCENT = 'oklch(0.52 0.09 250)'
export const ACCENT_SOFT = 'oklch(0.52 0.09 250 / 0.12)'
export const MONO = "'IBM Plex Mono', monospace"
export const SANS = "'Public Sans', system-ui, sans-serif"

export const fmt = (x: number, n = 2) => (Math.abs(x) < 0.5 * 10 ** -n ? 0 : x).toFixed(n).replace('-', '−')

/** A time series sampled every DT, starting at time t0. */
export interface Series {
  data: Float64Array
  t0: number
  color: string
  width?: number
  dash?: number[]
  /** draw only up to this time */
  upTo?: number
}

export interface Frame {
  sx: (t: number) => number
  sy: (v: number) => number
  l: number
  r: number
  t: number
  b: number
  w: number
  h: number
}

const M = { l: 44, r: 14, t: 12, b: 24 }

function niceStep(span: number) {
  const raw = span / 4
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p
}

/** Range of the visible part of the series, padded, always containing 0. */
export function rangeOf(series: Float64Array[], t0s: number[], minSpan = 1): [number, number] {
  let lo = 0
  let hi = 0
  series.forEach((d, j) => {
    const k0 = Math.max(0, Math.round((0 - t0s[j]) / DT))
    const k1 = Math.min(d.length - 1, Math.round((T_END - t0s[j]) / DT))
    for (let k = k0; k <= k1; k++) {
      const v = d[k]
      if (!Number.isFinite(v)) continue
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
  })
  if (hi - lo < minSpan) {
    const c = (hi + lo) / 2
    lo = Math.min(lo, c - minSpan / 2)
    hi = Math.max(hi, c + minSpan / 2)
  }
  const pad = (hi - lo) * 0.12
  return [lo - pad, hi + pad]
}

/** Axes, grid and labels for a y(t) plot over [0, T_END]. */
export function frame(ctx: CanvasRenderingContext2D, w: number, h: number, range: [number, number], yLabel?: string): Frame {
  const pw = w - M.l - M.r
  const ph = h - M.t - M.b
  const [lo, hi] = range
  const sx = (t: number) => M.l + (t / T_END) * pw
  const sy = (v: number) => M.t + ((hi - v) / (hi - lo)) * ph

  ctx.strokeStyle = LINE
  ctx.lineWidth = 1
  ctx.strokeRect(M.l + 0.5, M.t + 0.5, pw, ph)

  ctx.font = `10px ${MONO}`
  ctx.fillStyle = MUTE
  ctx.textAlign = 'center'
  for (let t = 0; t < T_END; t += 2) ctx.fillText(String(t), sx(t), M.t + ph + 15)
  ctx.textAlign = 'right'
  ctx.fillText(`${T_END} s`, M.l + pw + 4, M.t + ph + 15)

  const st = niceStep(hi - lo)
  ctx.textAlign = 'right'
  for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) {
    const y = sy(v)
    ctx.strokeStyle = Math.abs(v) < 1e-9 ? '#b7c1c4' : '#e6eaeb'
    ctx.beginPath()
    ctx.moveTo(M.l, Math.round(y) + 0.5)
    ctx.lineTo(M.l + pw, Math.round(y) + 0.5)
    ctx.stroke()
    ctx.fillText(fmt(v, st < 0.1 ? 2 : st < 1 ? 1 : 0), M.l - 6, y + 3)
  }
  if (yLabel) {
    ctx.textAlign = 'left'
    ctx.font = `500 11px ${SANS}`
    ctx.fillStyle = INK_SOFT
    ctx.fillText(yLabel, M.l + 8, M.t + 15)
  }
  return { sx, sy, l: M.l, r: M.l + pw, t: M.t, b: M.t + ph, w, h }
}

export function plotSeries(ctx: CanvasRenderingContext2D, f: Frame, s: Series) {
  const k0 = Math.max(0, Math.round((0 - s.t0) / DT))
  const tEnd = Math.min(T_END, s.upTo ?? T_END)
  const k1 = Math.min(s.data.length - 1, Math.round((tEnd - s.t0) / DT))
  if (k1 < k0) return
  ctx.save()
  ctx.beginPath()
  ctx.rect(f.l, f.t - 2, f.r - f.l, f.b - f.t + 4)
  ctx.clip()
  ctx.strokeStyle = s.color
  ctx.lineWidth = s.width ?? 2
  ctx.lineJoin = 'round'
  ctx.setLineDash(s.dash ?? [])
  ctx.beginPath()
  for (let k = k0; k <= k1; k++) {
    const x = f.sx(s.t0 + k * DT)
    const y = f.sy(s.data[k])
    if (k === k0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.restore()
}

export function cursorLine(ctx: CanvasRenderingContext2D, f: Frame, t: number, color = INK) {
  const x = Math.round(f.sx(t)) + 0.5
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(x, f.t)
  ctx.lineTo(x, f.b)
  ctx.stroke()
  ctx.setLineDash([])
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, r = 4) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fill()
}

export function arrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, ux: number, uy: number, s = 6) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x - ux * s + uy * s * 0.55, y - uy * s - ux * s * 0.55)
  ctx.lineTo(x - ux * s - uy * s * 0.55, y - uy * s + ux * s * 0.55)
  ctx.closePath()
  ctx.fill()
}

/** Straight arrow from (x0, y0) to (x1, y1). */
export function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width = 2) {
  const m = Math.hypot(x1 - x0, y1 - y0)
  if (m < 2) return
  const ux = (x1 - x0) / m
  const uy = (y1 - y0) / m
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1 - ux * 4, y1 - uy * 4)
  ctx.stroke()
  arrowHead(ctx, x1, y1, ux, uy, 7)
}

/** A fixed-step series to hold a drawn or computed signal: evaluate fn on the grid. */
export function sample(fn: (t: number) => number, t0: number, n: number) {
  const d = new Float64Array(n + 1)
  for (let k = 0; k <= n; k++) d[k] = fn(t0 + k * DT)
  return d
}
