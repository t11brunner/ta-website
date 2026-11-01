// The standard second-order system G(s) = ωn² / (s² + 2ζωn s + ωn²), written
// through its upper pole p = σ + jω (σ < 0 < ω). Its unit step response is
//   y(t) = 1 − e^{σt}·(cos ωt − (σ/ω)·sin ωt).
import type { Range } from '../est/splane'

export interface Pole {
  s: number
  w: number
}

/** Settling band in percent, d% on the slides. */
export const D = 5

export function specs(p: Pole) {
  const phi = Math.atan(p.s / p.w)
  return {
    phi,
    wn: Math.hypot(p.s, p.w),
    zeta: Math.sin(-phi),
    t100: (Math.PI / 2 - phi) / p.w,
    tp: Math.PI / p.w,
    mp: Math.exp((p.s * Math.PI) / p.w),
    td: Math.log(100 / D) / -p.s,
  }
}

export const stepAt = (p: Pole, t: number) => 1 - Math.exp(p.s * t) * (Math.cos(p.w * t) - (p.s / p.w) * Math.sin(p.w * t))
export const curve = (p: Pole, ts: Float64Array) => ts.map((t) => stepAt(p, t))

/** Pole with given ζ and ωn. */
export const fromZeta = (zeta: number, wn: number): Pole => ({ s: -zeta * wn, w: wn * Math.sqrt(1 - zeta * zeta) })

/** Which spec stays fixed while dragging: same ω, same σ or same tilt σ/ω. */
export type Lock = 'tp' | 'td' | 'mp' | null

const clampTo = (v: number, [a, b]: [number, number]) => Math.min(b, Math.max(a, v))
const r2 = (v: number) => Math.round(v * 100) / 100

/** Where a drag at (re, im) puts the pole, kept inside `box` and on the locked line. */
export function place(re: number, im: number, cur: Pole, lock: Lock, box: Range): Pole {
  let s = re
  let w = Math.abs(im)
  if (lock === 'tp') w = cur.w
  if (lock === 'td') s = cur.s
  if (lock === 'mp') {
    // project onto the ray through the origin and the current pole, parametrised by ω
    const k = cur.s / cur.w
    let t = (s * k + w) / (k * k + 1)
    t = clampTo(t, box.im)
    t = clampTo(t, [box.re[1] / k, box.re[0] / k])
    return { s: k * t, w: t }
  }
  return { s: r2(clampTo(s, box.re)), w: r2(clampTo(w, box.im)) }
}
