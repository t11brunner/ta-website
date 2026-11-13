// The systems of the Bode sketching demo and the straight-line rules.
// G(s) = K · s^n0 · Π(s − z) / Π(s − p) with real poles and zeros.

export interface Root {
  kind: 'zero' | 'pole'
  /** The root itself, with its sign: −10 is a stable pole at s = −10. */
  r: number
  name: string
}

export type ExKey = 'handout' | 'int' | 'diff'

export interface Ex {
  key: ExKey
  label: string
  K: number
  /** Zeros minus poles at s = 0: −1 for an integrator, +1 for a differentiator. */
  n0: number
  /** Sorted by absolute value. */
  roots: Root[]
}

/** What the formulas below need of a system. */
export type Sys = Pick<Ex, 'K' | 'n0' | 'roots'>

export const EXAMPLES: Ex[] = [
  {
    key: 'handout',
    label: 'Handout example',
    K: 1,
    n0: 0,
    roots: [
      { kind: 'zero', r: -1, name: 'z₁' },
      { kind: 'pole', r: -10, name: 'p₁' },
      { kind: 'pole', r: -30, name: 'p₂' },
      { kind: 'zero', r: 100, name: 'z₂' },
      { kind: 'pole', r: 1000, name: 'p₃' },
    ],
  },
  {
    key: 'int',
    label: 'With an integrator',
    K: 100,
    n0: -1,
    roots: [
      { kind: 'zero', r: -1, name: 'z₁' },
      { kind: 'pole', r: -100, name: 'p₁' },
    ],
  },
  {
    key: 'diff',
    label: 'With a differentiator',
    K: 10,
    n0: 1,
    roots: [
      { kind: 'pole', r: -10, name: 'p₁' },
      { kind: 'pole', r: -100, name: 'p₂' },
    ],
  },
]

/** The plots start at ω0 and end at ω1. */
export const W0 = 0.1
export const W1 = 1e4

const lg = Math.log10
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** ±1: a zero bends the magnitude up, a pole down. */
export const magSign = (q: Root) => (q.kind === 'zero' ? 1 : -1)
/** ±1: stable poles and non-minimum phase zeros turn the phase down. */
export const phSign = (q: Root) => ((q.kind === 'zero') === q.r < 0 ? 1 : -1)

export function typeName(q: Root) {
  if (q.kind === 'pole') return q.r < 0 ? 'stable pole' : 'unstable pole'
  return q.r < 0 ? 'minimum phase zero' : 'non-minimum phase zero'
}

/** One root's piece of the magnitude sketch: flat, then ±20 dB/dec from |r| on. */
export const pieceMag = (q: Root, w: number) => magSign(q) * 20 * Math.max(0, lg(w / Math.abs(q.r)))
/** One root's piece of the phase sketch: ±90° spread from |r|/10 to 10|r|. */
export const piecePh = (q: Root, w: number) => phSign(q) * 90 * clamp01((lg(w / Math.abs(q.r)) + 1) / 2)

/** |G| at ω0 in dB, with every factor (jω − r) replaced by −r. */
export function startDb(ex: Sys) {
  let g = Math.abs(ex.K) * W0 ** ex.n0
  for (const q of ex.roots) g = q.kind === 'zero' ? g * Math.abs(q.r) : g / Math.abs(q.r)
  return 20 * lg(g)
}
/** Phase at the left edge: ±90° per zero/pole at the origin, 180° more if the rest is negative. */
export function startPh(ex: Sys) {
  let sign = Math.sign(ex.K)
  for (const q of ex.roots) if (q.r > 0) sign = -sign
  return 90 * ex.n0 + (sign < 0 ? 180 : 0)
}

/** The starting piece: a line through the start value with the starting slope. */
export const baseMag = (ex: Sys, w: number) => startDb(ex) + 20 * ex.n0 * lg(w / W0)

export const sketchMag = (ex: Sys, w: number) => ex.roots.reduce((a, q) => a + pieceMag(q, w), baseMag(ex, w))
export const sketchPh = (ex: Sys, w: number) => ex.roots.reduce((a, q) => a + piecePh(q, w), startPh(ex))

export function exactMag(ex: Sys, w: number) {
  let g = Math.abs(ex.K) * w ** ex.n0
  for (const q of ex.roots) {
    const m = Math.hypot(w, q.r)
    g = q.kind === 'zero' ? g * m : g / m
  }
  return 20 * lg(g)
}
export const exactPh = (ex: Sys, w: number) =>
  ex.roots.reduce((a, q) => a + (phSign(q) * Math.atan(w / Math.abs(q.r)) * 180) / Math.PI, startPh(ex))

/** Log-spaced frequencies from ω0 to `to`, including every corner of the sketch on the way. */
export function freqs(ex: Sys, to = W1, n = 400) {
  const ws: number[] = []
  for (let k = 0; k <= n; k++) ws.push(W0 * (W1 / W0) ** (k / n))
  for (const q of ex.roots) {
    const a = Math.abs(q.r)
    ws.push(a / 10, a, a * 10)
  }
  return ws.filter((w) => w >= W0 && w < to).sort((a, b) => a - b).concat(to)
}
