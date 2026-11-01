// Drawing for the pole-spec demo: the step response with its four spec
// markers, and the s-plane with one pole pair.
import { ACCENT, INK, INK_SOFT, MUTE, SANS, arrow, dot, frame, grid, hline, polyline, tag, vline, type Frame } from '../shared/plot'
import { DARK, cross, label, ring, sGrid, sMap, type Range, type SFrame } from '../est/splane'
import { D, curve, specs, type Pole } from './model'

export type Focus = 't100' | 'tp' | 'mp' | 'td'

/**
 * What every s-plane panel shows at least, and where the pole may be dragged
 * (stable, complex). Both axes share one scale so angles and circles stay true;
 * the real axis reaches further left to fill a wide panel.
 */
export const PLANE: Range = { re: [-3.4, 0.6], im: [-3.4, 3.4] }
export const BOX: Range = { re: [-3, -0.2], im: [0.3, 3.2] }

const N = 800
const BAND = 'rgba(29, 35, 38, 0.07)'

/** Italic symbol with a subscript, e.g. T with "p". */
export function sym(ctx: CanvasRenderingContext2D, main: string, sub: string, x: number, y: number, color: string, align: CanvasTextAlign = 'center', size = 12) {
  const fm = `italic 500 ${size}px ${SANS}`
  const fs = `500 ${Math.round(size * 0.72)}px ${SANS}`
  ctx.font = fm
  const w1 = ctx.measureText(main).width
  ctx.font = fs
  const w2 = ctx.measureText(sub).width
  const W = w1 + 1 + w2
  const x0 = align === 'left' ? x : align === 'right' ? x - W : x - W / 2
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.font = fm
  ctx.fillText(main, x0, y)
  ctx.font = fs
  ctx.fillText(sub, x0 + w1 + 1, y + 3)
  return W
}

/** "same T_p" style note: plain text followed by a symbol. */
export function note(ctx: CanvasRenderingContext2D, text: string, main: string, sub: string, x: number, y: number, color: string) {
  ctx.font = `500 11px ${SANS}`
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.fillText(text, x, y)
  sym(ctx, main, sub, x + ctx.measureText(text).width + 3, y, color, 'left', 12)
}

export function dashed(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string, width = 1.5, dash = [6, 5]) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash)
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.stroke()
  ctx.setLineDash([])
}

// ---------------------------------------------------------------- time

export interface RespOpts {
  T: number
  focus?: Focus | null
  ghost?: Pole | null
  markers?: boolean
}

export function respFrame(ctx: CanvasRenderingContext2D, w: number, h: number, T: number) {
  const f = frame(ctx, w, h, { x: [0, T], y: [0, 2], xUnit: 's', margin: { t: 44 } })
  ctx.fillStyle = BAND
  ctx.fillRect(f.l, f.sy(1 + D / 100), f.r - f.l, f.sy(1 - D / 100) - f.sy(1 + D / 100))
  hline(ctx, f, 1, INK_SOFT, [])
  return f
}

export function envelope(ctx: CanvasRenderingContext2D, f: Frame, p: Pole, T: number, color: string, width = 1.2) {
  const ts = grid(0, T, N)
  polyline(ctx, f, ts, ts.map((t) => 1 + Math.exp(p.s * t)), { color, width, dash: [4, 4] })
  polyline(ctx, f, ts, ts.map((t) => 1 - Math.exp(p.s * t)), { color, width, dash: [4, 4] })
}

export function drawResponse(ctx: CanvasRenderingContext2D, w: number, h: number, p: Pole, o: RespOpts): Frame {
  const f = respFrame(ctx, w, h, o.T)
  const envOn = o.focus === 'mp' || o.focus === 'td'
  envelope(ctx, f, p, o.T, envOn ? ACCENT : MUTE, envOn ? 1.5 : 1.2)
  const ts = grid(0, o.T, N)
  if (o.ghost) polyline(ctx, f, ts, curve(o.ghost, ts), { color: MUTE, width: 1.6, dash: [2, 3] })
  polyline(ctx, f, ts, curve(p, ts), { color: INK, width: 2 })
  if (o.markers !== false) drawMarkers(ctx, f, p, o.T, o.focus ?? null)
  return f
}

/** Dashed verticals at T100%, Tp, Td and the overshoot bracket at the peak. */
export function drawMarkers(ctx: CanvasRenderingContext2D, f: Frame, p: Pole, T: number, focus: Focus | null) {
  const sp = specs(p)
  const col = (k: Focus) => (focus === k ? ACCENT : MUTE)
  const ink = (k: Focus) => (focus === k ? ACCENT : INK_SOFT)
  const x100 = f.sx(sp.t100)
  const xp = f.sx(sp.tp)
  // labels above the plot; heavily damped poles bunch them up, so overlapping ones move up a row
  const tops: { k: Focus; sub: string; x: number }[] = [
    { k: 't100' as Focus, sub: '100%', x: x100 },
    { k: 'tp' as Focus, sub: 'p', x: xp },
    { k: 'td' as Focus, sub: 'd', x: f.sx(sp.td) },
  ].filter((l) => l.x <= f.r).sort((a, b) => a.x - b.x)
  const ends = [-Infinity, -Infinity, -Infinity]
  tops.forEach((l) => {
    const w = l.sub.length > 1 ? 38 : 20
    let row = ends.findIndex((e) => l.x - w / 2 > e + 2)
    if (row < 0) row = ends.length - 1
    ends[row] = l.x + w / 2
    sym(ctx, 'T', l.sub, l.x, f.t - 6 - 12 * row, ink(l.k))
  })
  if (sp.t100 <= T) {
    vline(ctx, f, sp.t100, col('t100'))
    dot(ctx, x100, f.sy(1), col('t100'), focus === 't100' ? 4.5 : 3.5)
  }
  if (sp.tp <= T) {
    vline(ctx, f, sp.tp, col('tp'))
    const yt = f.sy(1 + sp.mp)
    const y1 = f.sy(1)
    const c = col('mp')
    if (y1 - yt > 12) {
      arrow(ctx, xp + 9, (yt + y1) / 2, xp + 9, yt + 1, c, 1.3, 6)
      arrow(ctx, xp + 9, (yt + y1) / 2, xp + 9, y1 - 1, c, 1.3, 6)
    }
    // beside the top of the bracket, where the curve has already turned down
    sym(ctx, 'M', 'p', xp + 14, yt - 4, ink('mp'), 'left', 13)
    dot(ctx, xp, yt, focus === 'mp' ? ACCENT : INK, focus === 'mp' ? 4.5 : 3.5)
  }
  if (sp.td <= T) {
    vline(ctx, f, sp.td, col('td'))
    dot(ctx, f.sx(sp.td), f.sy(1 + Math.exp(p.s * sp.td)), col('td'), 3.5)
  } else tag(ctx, f.r - 58, f.t + 16, `Td = ${sp.td.toFixed(1)} s →`, ink('td'), 'rgba(29, 35, 38, 0.06)')
}

// ---------------------------------------------------------------- s-plane

/** s-plane map with one scale for both axes, showing at least `need`; the right edge stays put. */
export function eqMap(w: number, h: number, need = PLANE): { f: SFrame; range: Range } {
  // same margins as sMap
  const pw = w - 30 - 14
  const ph = h - 12 - 22
  const k = Math.min(pw / (need.re[1] - need.re[0]), ph / (need.im[1] - need.im[0]))
  const mid = (need.im[0] + need.im[1]) / 2
  const range: Range = {
    re: [need.re[1] - pw / k, need.re[1]],
    im: [mid - ph / k / 2, mid + ph / k / 2],
  }
  return { f: sMap(w, h, range), range }
}

export function planeBase(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const { f, range } = eqMap(w, h)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)'
  ctx.fillRect(f.l, f.t, f.sx(0) - f.l, f.b - f.t)
  sGrid(ctx, f, range)
  return { f, range }
}

export function poles(ctx: CanvasRenderingContext2D, f: SFrame, p: Pole, color = DARK.amber, size = 6) {
  cross(ctx, f.sx(p.s), f.sy(p.w), color, size, 2.2)
  cross(ctx, f.sx(p.s), f.sy(-p.w), color, size, 2.2)
}

export function ghostPoles(ctx: CanvasRenderingContext2D, f: SFrame, p: Pole) {
  ring(ctx, f.sx(p.s), f.sy(p.w), 5, DARK.text)
  ring(ctx, f.sx(p.s), f.sy(-p.w), 5, DARK.text)
}

/** Ray from the origin through the pole (and its mirror) to the edge of the plane. */
export function rayEnd(p: Pole, range: Range) {
  const t = Math.min(range.re[0] / p.s, range.im[1] / p.w)
  return { s: p.s * t, w: p.w * t }
}

/** The slide's construction: σ, ω, ωn, φ, plus the line on which `focus` stays the same. */
export function drawGeometry(ctx: CanvasRenderingContext2D, f: SFrame, range: Range, p: Pole, focus: Focus | null) {
  const x0 = f.sx(0)
  const y0 = f.sy(0)
  const x = f.sx(p.s)
  const y = f.sy(p.w)
  const on = (...k: Focus[]) => focus !== null && k.includes(focus)

  // the line on which this spec does not change
  const A = DARK.accent
  if (focus === 'tp') {
    for (const yy of [y, f.sy(-p.w)]) dashed(ctx, [[f.l, yy], [x0, yy]], A)
    note(ctx, 'same', 'T', 'p', f.l + 6, y - 7, A)
  }
  if (focus === 'td') {
    dashed(ctx, [[x, f.t], [x, f.b]], A)
    note(ctx, 'same', 'T', 'd', x + 6, f.t + 14, A)
  }
  if (focus === 'mp') {
    const e = rayEnd(p, range)
    dashed(ctx, [[x0, y0], [f.sx(e.s), f.sy(e.w)]], A)
    dashed(ctx, [[x0, y0], [f.sx(e.s), f.sy(-e.w)]], A)
    // on the lower ray, on whichever side of the pole has room
    const at = p.w / e.w > 0.55 ? 0.3 : 0.82
    note(ctx, 'same', 'M', 'p', Math.max(f.l + 4, f.sx(e.s * at) - 18), Math.min(f.b - 6, f.sy(-e.w * at) + 18), A)
  }

  // projections onto the axes, as on the slide
  dashed(ctx, [[x, y], [x, y0]], on('td') ? A : DARK.text, on('td') ? 2 : 1, [3, 3])
  dashed(ctx, [[x, y], [x0, y]], on('tp', 't100') ? A : DARK.text, on('tp', 't100') ? 2 : 1, [3, 3])
  // ωn: origin to pole
  ctx.strokeStyle = DARK.text
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x, y)
  ctx.stroke()
  // φ: from the jω axis to the pole
  const a = Math.atan2(y - y0, x - x0)
  const r = 28
  ctx.strokeStyle = on('t100', 'mp') ? A : DARK.strong
  ctx.lineWidth = on('t100', 'mp') ? 2 : 1.3
  ctx.beginPath()
  ctx.arc(x0, y0, r, a, -Math.PI / 2)
  ctx.stroke()
  const mid = (a - Math.PI / 2) / 2
  label(ctx, 'φ', x0 + (r + 10) * Math.cos(mid), y0 + (r + 10) * Math.sin(mid) + 4, on('t100', 'mp') ? A : DARK.strong, 'center')

  label(ctx, 'σ', x, y0 + 17, on('td') ? A : DARK.strong, 'center')
  label(ctx, 'ω', x0 + 7, y + 4, on('tp', 't100') ? A : DARK.strong)
  const mx = (x + x0) / 2
  const my = (y + y0) / 2
  sym(ctx, 'ω', 'n', mx - 8, my - 6, DARK.text, 'right', 12)
}
