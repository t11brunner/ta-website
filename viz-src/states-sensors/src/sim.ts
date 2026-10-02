// Two physical plants (car, pendulum) with a choice of sensor.
// Simulated with RK4 on a fixed grid over [0, T_END].

export const T_END = 10 // s
export const DT = 0.01 // s
export const N_PLANT = Math.round(T_END / DT)

export type Sig = (t: number) => number

/** RK4 for ẋ = f(x, u(t)) from x0 at t = 0, returns y = h(x, u) and the states on the grid. */
export function simulateODE(
  n: number,
  f: (x: number[], u: number) => number[],
  h: (x: number[], u: number) => number,
  u: Sig,
  x0: number[],
): { y: Float64Array; xs: Float64Array[] } {
  const y = new Float64Array(N_PLANT + 1)
  const xs = Array.from({ length: n }, () => new Float64Array(N_PLANT + 1))
  let x = x0.slice()
  const add = (a: number[], b: number[], s: number) => a.map((v, i) => v + s * b[i])
  for (let k = 0; ; k++) {
    const t = k * DT
    const ut = u(t)
    y[k] = h(x, ut)
    for (let i = 0; i < n; i++) xs[i][k] = x[i]
    if (k === N_PLANT) break
    const um = u(t + DT / 2)
    const k1 = f(x, ut)
    const k2 = f(add(x, k1, DT / 2), um)
    const k3 = f(add(x, k2, DT / 2), um)
    const k4 = f(add(x, k3, DT), u(t + DT))
    x = x.map((v, i) => v + (DT / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]))
  }
  return { y, xs }
}

// ===== plants with a choice of sensor (tab 2) ================================

export type PlantKey = 'car' | 'pendulum'

export interface Sensor {
  key: string
  label: string
  device: string
  h: string
  note: string
  fn: (x: number[], u: number) => number
  unit: string
}

export interface Plant {
  key: PlantKey
  label: string
  states: [string, string]
  stateUnits: [string, string]
  uName: string
  uUnit: string
  f: [string, string]
  sensors: Sensor[]
  x0Range: [[number, number], [number, number]]
  x0Default: [number, number]
  x0Step: [number, number]
  inputs: { key: string; label: string; fn: Sig }[]
  dyn: (x: number[], u: number) => number[]
}

const CAR_B = 0.5 // friction / mass, 1/s
const G = 9.81
const L = 1
const PB = 0.4 // pendulum damping, 1/s

export const PLANTS: Record<PlantKey, Plant> = {
  car: {
    key: 'car',
    label: 'Car',
    states: ['position p', 'velocity v'],
    stateUnits: ['m', 'm/s'],
    uName: 'F',
    uUnit: 'N',
    f: ['ẋ₁ = x₂', 'ẋ₂ = (u − b·x₂) / m'],
    sensors: [
      { key: 'pos', label: 'Position', device: 'GPS', h: 'y = x₁', note: 'The output is one of the states.', fn: (x) => x[0], unit: 'm' },
      { key: 'vel', label: 'Velocity', device: 'Speedometer', h: 'y = x₂', note: 'The other state — the satellite in Ex01 measures this one.', fn: (x) => x[1], unit: 'm/s' },
      { key: 'acc', label: 'Acceleration', device: 'Accelerometer', h: 'y = (u − b·x₂) / m', note: 'Not a state at all: h depends on u directly (feedthrough).', fn: (x, u) => u - CAR_B * x[1], unit: 'm/s²' },
    ],
    x0Range: [[-4, 4], [-2, 2]],
    x0Default: [0, 0],
    x0Step: [0.1, 0.05],
    inputs: [
      { key: 'step', label: 'Step', fn: (t) => (t >= 1 ? 1 : 0) },
      { key: 'pulse', label: 'Push', fn: (t) => (t >= 1 && t < 3 ? 1.5 : 0) },
      { key: 'sine', label: 'Sine', fn: (t) => Math.sin(1.2 * t) },
      { key: 'zero', label: 'No input', fn: () => 0 },
    ],
    dyn: (x, u) => [x[1], u - CAR_B * x[1]],
  },
  pendulum: {
    key: 'pendulum',
    label: 'Pendulum',
    states: ['angle θ', 'angular velocity θ̇'],
    stateUnits: ['rad', 'rad/s'],
    uName: 'Fₚ',
    uUnit: 'N',
    f: ['ẋ₁ = x₂', 'ẋ₂ = −(g/l)·sin x₁ − b·x₂ + cos(x₁)·u / (m l)'],
    sensors: [
      { key: 'ang', label: 'Angle', device: 'Encoder', h: 'y = x₁', note: 'The output is one of the states.', fn: (x) => x[0], unit: 'rad' },
      { key: 'rate', label: 'Angular velocity', device: 'Gyroscope', h: 'y = x₂', note: 'The other state.', fn: (x) => x[1], unit: 'rad/s' },
      { key: 'cam', label: 'Horizontal position', device: 'Camera', h: 'y = l·sin x₁', note: 'Same states, but h is nonlinear: a camera sees l·sin θ, not θ.', fn: (x) => L * Math.sin(x[0]), unit: 'm' },
    ],
    x0Range: [[-2.5, 2.5], [-4, 4]],
    x0Default: [0, 0],
    x0Step: [0.05, 0.1],
    inputs: [
      { key: 'pulse', label: 'Push', fn: (t) => (t >= 1 && t < 1.25 ? 12 : 0) },
      { key: 'step', label: 'Step', fn: (t) => (t >= 1 ? 6 : 0) },
      { key: 'sine', label: 'Sine', fn: (t) => 2.5 * Math.sin(3 * t) },
      { key: 'zero', label: 'No input', fn: () => 0 },
    ],
    dyn: (x, u) => [x[1], -(G / L) * Math.sin(x[0]) - PB * x[1] + Math.cos(x[0]) * u / L],
  },
}

/** Simulate a plant on [0, T_END] from x0. */
export function simulatePlant(p: Plant, u: Sig, x0: [number, number], sensor: Sensor) {
  return simulateODE(2, p.dyn, sensor.fn, u, x0)
}
