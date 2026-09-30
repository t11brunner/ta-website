// Pendulum  θ'' = -(g/l) sin θ - b θ'   with state x = (θ, θ').
// Everything is expressed in δ = θ - θe, the deviation from the equilibrium.

export const G_L = 9.81 // g / l with l = 1 m
export const T_END = 6 // s
export const DT = 0.005 // s, stored step
export const N = Math.round(T_END / DT)

export type State = [number, number]

export interface Eig {
  re1: number
  im1: number
  re2: number
  im2: number
  kind: string
  /** real eigenvector directions (1, λ) — empty for complex pairs */
  dirs: number[]
}

/** Jacobian at (θe, 0):  A = [[0, 1], [-(g/l) cos θe, -b]] */
export function jacobian(thetaE: number, b: number): number[][] {
  return [
    [0, 1],
    [-G_L * Math.cos(thetaE), -b],
  ]
}

export function eigen(thetaE: number, b: number): Eig {
  const a = -G_L * Math.cos(thetaE)
  const disc = b * b + 4 * a
  if (disc < 0) {
    const re = -b / 2
    const im = Math.sqrt(-disc) / 2
    return {
      re1: re, im1: im, re2: re, im2: -im,
      kind: b < 1e-9 ? 'center' : 'stable focus',
      dirs: [],
    }
  }
  const s = Math.sqrt(disc)
  const l1 = (-b + s) / 2
  const l2 = (-b - s) / 2
  let kind = 'stable node'
  if (l1 > 0 && l2 < 0) kind = 'saddle'
  else if (l1 > 0 && l2 > 0) kind = 'unstable node'
  return { re1: l1, im1: 0, re2: l2, im2: 0, kind, dirs: [l1, l2] }
}

export function fNonlinear(d: number, v: number, b: number, thetaE: number): State {
  return [v, -G_L * Math.sin(thetaE + d) - b * v]
}

export function fLinear(d: number, v: number, b: number, thetaE: number): State {
  return [v, -G_L * Math.cos(thetaE) * d - b * v]
}

type Field = (d: number, v: number) => State

function rk4(f: Field, x0: State): Float64Array {
  // interleaved [d0, v0, d1, v1, ...]
  const out = new Float64Array((N + 1) * 2)
  let d = x0[0]
  let v = x0[1]
  out[0] = d
  out[1] = v
  for (let i = 1; i <= N; i++) {
    const [k1d, k1v] = f(d, v)
    const [k2d, k2v] = f(d + 0.5 * DT * k1d, v + 0.5 * DT * k1v)
    const [k3d, k3v] = f(d + 0.5 * DT * k2d, v + 0.5 * DT * k2v)
    const [k4d, k4v] = f(d + DT * k3d, v + DT * k3v)
    d += (DT / 6) * (k1d + 2 * k2d + 2 * k3d + k4d)
    v += (DT / 6) * (k1v + 2 * k2v + 2 * k3v + k4v)
    out[2 * i] = d
    out[2 * i + 1] = v
  }
  return out
}

export interface Trajectories {
  nl: Float64Array
  lin: Float64Array
  /** max |δ_nl - δ_lin| over [0, T_END] in rad, capped at 2π */
  maxErr: number
}

export function simulate(x0: State, b: number, thetaE: number): Trajectories {
  const nl = rk4((d, v) => fNonlinear(d, v, b, thetaE), x0)
  const lin = rk4((d, v) => fLinear(d, v, b, thetaE), x0)
  let maxErr = 0
  for (let i = 0; i <= N; i++) {
    const e = Math.abs(nl[2 * i] - lin[2 * i])
    if (e > maxErr) maxErr = e
  }
  return { nl, lin, maxErr: Math.min(maxErr, 2 * Math.PI) }
}
