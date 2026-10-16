// Complex numbers, polynomials and rational transfer functions: just enough
// to evaluate G(s), expand into partial fractions and simulate an LTI system.

export interface C {
  re: number
  im: number
}
export const cx = (re: number, im = 0): C => ({ re, im })
export const cadd = (a: C, b: C) => cx(a.re + b.re, a.im + b.im)
export const csub = (a: C, b: C) => cx(a.re - b.re, a.im - b.im)
export const cmul = (a: C, b: C) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
export const cscale = (a: C, k: number) => cx(a.re * k, a.im * k)
export function cdiv(a: C, b: C) {
  const d = b.re * b.re + b.im * b.im
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d)
}
export const cabs = (a: C) => Math.hypot(a.re, a.im)
export const carg = (a: C) => Math.atan2(a.im, a.re)
export function cexp(a: C) {
  const m = Math.exp(a.re)
  return cx(m * Math.cos(a.im), m * Math.sin(a.im))
}

/** Polynomial coefficients, highest power first: [1, 0.8, 4] is s² + 0.8s + 4. */
export type Poly = number[]

export function peval(p: Poly, z: C): C {
  let r = cx(0)
  for (const a of p) r = cadd(cmul(r, z), cx(a))
  return r
}
export function pmul(a: Poly, b: Poly): Poly {
  const r = new Array(a.length + b.length - 1).fill(0)
  a.forEach((x, i) => b.forEach((y, j) => (r[i + j] += x * y)))
  return r
}
export function pderiv(p: Poly): Poly {
  const n = p.length - 1
  return p.slice(0, -1).map((a, i) => a * (n - i))
}

/** All roots of p (Durand–Kerner). Near-real roots are snapped onto the real axis. */
export function proots(p: Poly): C[] {
  const q = p.map((a) => a / p[0])
  const n = q.length - 1
  if (n < 1) return []
  let z: C[] = []
  let w = cx(1)
  for (let k = 0; k < n; k++) {
    z.push(w)
    w = cmul(w, cx(0.4, 0.9))
  }
  for (let it = 0; it < 800; it++) {
    let moved = 0
    z = z.map((zk, k) => {
      let d = cx(1)
      z.forEach((zj, j) => {
        if (j !== k) d = cmul(d, csub(zk, zj))
      })
      const step = cdiv(peval(q, zk), d)
      moved = Math.max(moved, cabs(step))
      return csub(zk, step)
    })
    if (moved < 1e-14) break
  }
  return z.map((r) => (Math.abs(r.im) < 1e-7 ? cx(r.re) : r))
}

/** A rational transfer function num(s)/den(s). */
export interface Rat {
  num: Poly
  den: Poly
}
export const tfEval = (g: Rat, s: C) => cdiv(peval(g.num, s), peval(g.den, s))
export const ratMul = (a: Rat, b: Rat): Rat => ({ num: pmul(a.num, b.num), den: pmul(a.den, b.den) })

/** One partial-fraction term r/(s−p), i.e. r·e^{pt} in the time domain. */
export interface Term {
  p: C
  r: C
}

/** Partial fractions of a strictly proper G with distinct poles. */
export function residues(g: Rat): Term[] {
  const dp = pderiv(g.den)
  return proots(g.den).map((p) => ({ p, r: cdiv(peval(g.num, p), peval(dp, p)) }))
}

/** Σ r·e^{pt}: the inverse Laplace transform of the partial fractions, at time t. */
export function evalTerms(terms: Term[], t: number) {
  let y = 0
  for (const { p, r } of terms) y += cmul(r, cexp(cscale(p, t))).re
  return y
}

/**
 * Response of G to input u from rest, sampled at n+1 points over [0, T].
 * Uses the controllable canonical form and RK4 with fine substeps.
 */
export function simulate(g: Rat, u: (t: number) => number, T: number, n: number): Float64Array {
  const lead = g.den[0]
  const den = g.den.map((a) => a / lead)
  let num = g.num.map((b) => b / lead)
  const N = den.length - 1
  while (num.length < N + 1) num = [0, ...num]
  const d = num[0]
  const b = num.slice(1).map((v, i) => v - d * den[i + 1]) // [b_{N-1} … b_0]
  const a = den.slice(1) // [a_{N-1} … a_0]

  const f = (x: number[], ut: number) => {
    const dx = new Array(N)
    for (let i = 0; i < N - 1; i++) dx[i] = x[i + 1]
    let last = ut
    for (let i = 0; i < N; i++) last -= a[N - 1 - i] * x[i]
    dx[N - 1] = last
    return dx
  }
  const out = (x: number[], ut: number) => {
    let y = d * ut
    for (let i = 0; i < N; i++) y += b[N - 1 - i] * x[i]
    return y
  }

  const dt = T / n
  // RK4 needs h·|p| well below ~2.8 for every pole p; stay far inside that
  const fastest = Math.max(1, ...proots(den).map(cabs))
  const sub = Math.max(1, Math.ceil(dt / Math.min(0.004, 0.5 / fastest)))
  const h = dt / sub
  const ys = new Float64Array(n + 1)
  let x = new Array(N).fill(0)
  ys[0] = out(x, u(0))
  for (let k = 0; k < n; k++) {
    for (let j = 0; j < sub; j++) {
      const t = k * dt + j * h
      const k1 = f(x, u(t))
      const k2 = f(x.map((v, i) => v + (h / 2) * k1[i]), u(t + h / 2))
      const k3 = f(x.map((v, i) => v + (h / 2) * k2[i]), u(t + h / 2))
      const k4 = f(x.map((v, i) => v + h * k3[i]), u(t + h))
      x = x.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
    }
    ys[k + 1] = out(x, u((k + 1) * dt))
  }
  return ys
}
