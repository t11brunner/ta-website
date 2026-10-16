// Drawing on the dark s-plane panels: grid and axes, poles, the point s.
// Everything that lives in the s-domain is drawn here in light ink on slate.
import { cx, type C } from '../shared/math'
import { MONO, SANS } from '../shared/plot'

export const DARK = {
  text: 'rgba(222, 230, 235, 0.55)',
  strong: 'rgba(236, 241, 244, 0.92)',
  grid: 'rgba(255, 255, 255, 0.055)',
  axis: 'rgba(255, 255, 255, 0.3)',
  ink: '#e9eef1',
  inkFill: 'rgba(233, 238, 241, 0.1)',
  accent: 'oklch(0.79 0.1 245)',
  accentFill: 'oklch(0.79 0.1 245 / 0.16)',
  amber: 'oklch(0.81 0.12 75)',
}

/** Amber for the system's own modes on the light time plots. */
export const AMBER = 'oklch(0.64 0.13 62)'
export const AMBER_FILL = 'oklch(0.75 0.13 70 / 0.28)'

export interface Range {
  re: [number, number]
  im: [number, number]
}

export interface SFrame {
  sx: (re: number) => number
  sy: (im: number) => number
  ire: (px: number) => number
  iim: (py: number) => number
  l: number
  r: number
  t: number
  b: number
}

/** Coordinate maps of an s-plane panel, without drawing anything. */
export function sMap(w: number, h: number, o: Range): SFrame {
  const M = { l: 30, r: 14, t: 12, b: 22 }
  const pw = w - M.l - M.r
  const ph = h - M.t - M.b
  const [a, b] = o.re
  const [c, d] = o.im
  return {
    sx: (x) => M.l + ((x - a) / (b - a)) * pw,
    sy: (y) => M.t + ((d - y) / (d - c)) * ph,
    ire: (px) => a + ((px - M.l) / pw) * (b - a),
    iim: (py) => d - ((py - M.t) / ph) * (d - c),
    l: M.l,
    r: M.l + pw,
    t: M.t,
    b: M.t + ph,
  }
}

const num = (v: number) => String(v).replace('-', '−')

/** Unit grid, the two axes and their labels. */
export function sGrid(ctx: CanvasRenderingContext2D, f: SFrame, o: Range) {
  ctx.lineWidth = 1
  ctx.setLineDash([])
  ctx.font = `10px ${MONO}`
  ctx.fillStyle = DARK.text
  for (let x = Math.ceil(o.re[0]); x <= o.re[1]; x++) {
    const px = Math.round(f.sx(x)) + 0.5
    ctx.strokeStyle = x === 0 ? DARK.axis : DARK.grid
    ctx.beginPath()
    ctx.moveTo(px, f.t)
    ctx.lineTo(px, f.b)
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.fillText(num(x), px, f.b + 15)
  }
  for (let y = Math.ceil(o.im[0]); y <= o.im[1]; y++) {
    const py = Math.round(f.sy(y)) + 0.5
    ctx.strokeStyle = y === 0 ? DARK.axis : DARK.grid
    ctx.beginPath()
    ctx.moveTo(f.l, py)
    ctx.lineTo(f.r, py)
    ctx.stroke()
    if (y !== 0 && y % 2 === 0) {
      ctx.textAlign = 'right'
      ctx.fillText(num(y) + 'j', f.l - 5, py + 3)
    }
  }
  ctx.font = `italic 500 12px ${SANS}`
  ctx.fillStyle = DARK.strong
  ctx.textAlign = 'right'
  ctx.fillText('σ', f.r - 4, f.sy(0) - 6)
  ctx.textAlign = 'left'
  ctx.fillText('jω', f.sx(0) + 6, f.t + 12)
}

export function cross(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = 5.5, width = 2) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(x - size, y - size)
  ctx.lineTo(x + size, y + size)
  ctx.moveTo(x + size, y - size)
  ctx.lineTo(x - size, y + size)
  ctx.stroke()
}

export function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, width = 1.5) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.stroke()
}

/** The draggable point s: a dot with a soft halo, its mirror s̄ hollow. */
export function sPoint(ctx: CanvasRenderingContext2D, f: SFrame, s: C) {
  const x = f.sx(s.re)
  const y = f.sy(s.im)
  const ym = f.sy(-s.im)
  if (Math.abs(s.im) > 1e-9) {
    ctx.strokeStyle = DARK.text
    ctx.lineWidth = 1
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, ym)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.beginPath()
    ctx.arc(x, ym, 4.5, 0, 2 * Math.PI)
    ctx.strokeStyle = DARK.ink
    ctx.globalAlpha = 0.6
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.globalAlpha = 1
    label(ctx, 's̄', x + 9, ym + 4, DARK.text)
  }
  const g = ctx.createRadialGradient(x, y, 0, x, y, 18)
  g.addColorStop(0, 'rgba(233, 238, 241, 0.45)')
  g.addColorStop(1, 'rgba(233, 238, 241, 0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, 18, 0, 2 * Math.PI)
  ctx.fill()
  ctx.fillStyle = DARK.ink
  ctx.beginPath()
  ctx.arc(x, y, 5.5, 0, 2 * Math.PI)
  ctx.fill()
  label(ctx, 's', x + 9, y - 6, DARK.strong)
}

/** Italic label on the dark panel. */
export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, align: CanvasTextAlign = 'left', size = 13) {
  ctx.font = `italic 500 ${size}px ${SANS}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.fillText(text, x, y)
}

/** "e" with a raised exponent, e.g. expLabel(ctx, 'st', …) for e^{st}. */
export function expLabel(ctx: CanvasRenderingContext2D, sup: string, x: number, y: number, color: string, align: 'left' | 'right' = 'left') {
  ctx.font = `italic 500 13px ${SANS}`
  const wE = ctx.measureText('e').width
  ctx.font = `italic 500 10px ${SANS}`
  const wS = ctx.measureText(sup).width
  const x0 = align === 'left' ? x : x - wE - wS - 1
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.font = `italic 500 13px ${SANS}`
  ctx.fillText('e', x0, y)
  ctx.font = `italic 500 10px ${SANS}`
  ctx.fillText(sup, x0 + wE + 1, y - 6)
}

/**
 * Where a drag on the s-plane puts s: clamped to the given box and snapped
 * onto the axes, so the real axis and the jω axis are easy to hit.
 */
export function dragTo(f: SFrame, x: number, y: number, box: Range): C {
  let re = Math.min(box.re[1], Math.max(box.re[0], f.ire(x)))
  let im = Math.min(box.im[1], Math.max(box.im[0], f.iim(y)))
  if (Math.abs(im) < 0.15) im = 0
  if (Math.abs(re) < 0.08) re = 0
  return cx(Math.round(re * 100) / 100, Math.round(im * 100) / 100)
}
