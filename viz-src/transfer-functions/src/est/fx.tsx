// Formula pieces for the s-domain demo: exponentials, single pole pieces in
// real form, the ODE behind a transfer function, complex numbers in polar form.
import { cabs, carg, type C, type Poly } from '../shared/math'
import { nf } from '../shared/tex'

/** e to the power x. */
export const E = ({ x }: { x: React.ReactNode }) => (
  <>
    e<sup>{x}</sup>
  </>
)

export const Est = () => <E x={<i>st</i>} />
export const Sbar = () => <i>s̄</i>

/** e^{at} with a compact exponent; nothing for a = 0. */
function ExpT({ a }: { a: number }) {
  if (Math.abs(a) < 1e-9) return null
  const k = nf(a)
  return <E x={<>{k === '1' ? '' : k === '−1' ? '−' : k}<i>t</i></>} />
}

/**
 * One piece r·e^{pt} in real form: c·e^{at} for a real pole, and for a pole
 * pair (pass the one with ω > 0) the sum of both, A·e^{σt}·cos(ωt + φ).
 */
export function PieceView({ p, r }: { p: C; r: C }) {
  if (Math.abs(p.im) < 1e-9) {
    const c = r.re
    const unit = Math.abs(Math.abs(c) - 1) < 5e-3 && Math.abs(p.re) > 1e-9
    return (
      <>
        {c < 0 ? '−' : ''}
        {unit ? '' : nf(Math.abs(c))}
        <ExpT a={p.re} />
      </>
    )
  }
  const A = 2 * cabs(r)
  const phi = carg(r)
  return (
    <>
      {Math.abs(A - 1) < 5e-3 ? '' : nf(A)}
      <ExpT a={p.re} />
      &thinsp;cos({Math.abs(p.im - 1) < 1e-9 ? '' : nf(p.im)}
      <i>t</i>
      {Math.abs(phi) > 5e-3 && <> {phi < 0 ? '−' : '+'} {nf(Math.abs(phi))}</>})
    </>
  )
}

/** v(t) = Σ of pole pieces in real form (pairs given once, by their upper pole). */
export function SumView({ terms, v }: { terms: { p: C; r: C }[]; v: string }) {
  const parts = terms
    .filter(({ p, r }) => p.im >= -1e-9 && (p.im > 1e-9 ? 2 : 1) * cabs(r) > 5e-3)
    .map(({ p, r }) => {
      const neg = p.im <= 1e-9 && r.re < 0
      return { p, r: neg ? { re: -r.re, im: -r.im } : r, neg }
    })
  return (
    <>
      <i>{v}</i>(<i>t</i>) ={' '}
      {parts.length === 0
        ? '0'
        : parts.map((q, i) => (
            <span key={i}>
              {i === 0 ? (q.neg ? '−' : '') : q.neg ? ' − ' : ' + '}
              <PieceView p={q.p} r={q.r} />
            </span>
          ))}
    </>
  )
}

/** Re{z·e^{st}} as a piece for PieceView (the pole with ω ≥ 0 and its weight). */
export function waveOf(s: C, z: C): { p: C; r: C } {
  if (s.im > 0) return { p: s, r: { re: z.re / 2, im: z.im / 2 } }
  if (s.im < 0) return { p: { re: s.re, im: -s.im }, r: { re: z.re / 2, im: -z.im / 2 } }
  return { p: s, r: { re: z.re, im: 0 } }
}

/** A pole, or a pole pair as σ ± ωj. */
export function PoleView({ p }: { p: C }) {
  const w = Math.abs(p.im)
  if (w < 1e-9) return <>{nf(p.re)}</>
  return (
    <>
      {Math.abs(p.re) > 1e-9 && <>{nf(p.re)} </>}± {Math.abs(w - 1) < 1e-9 ? '' : nf(w)}
      <i>j</i>
    </>
  )
}

/** A complex number as length∠angle, the angle in degrees. */
export function Polar({ z }: { z: C }) {
  const deg = (carg(z) * 180) / Math.PI
  return (
    <>
      {nf(cabs(z))}
      <span className="soft">∠</span>
      {nf(deg, 0)}°
    </>
  )
}

const DERIV = ['', '̇', '̈'] // y, ẏ, ÿ

/** One side of the ODE, e.g. [1, 2, 2] on y gives ÿ + 2ẏ + 2y. */
export function OdeSide({ p, v }: { p: Poly; v: string }) {
  const n = p.length - 1
  const parts: React.ReactNode[] = []
  p.forEach((a, i) => {
    if (Math.abs(a) < 1e-9) return
    const k = n - i
    const first = parts.length === 0
    const sign = a < 0 ? (first ? '−' : ' − ') : first ? '' : ' + '
    const mag = Math.abs(a)
    parts.push(
      <span key={i}>
        {sign}
        {Math.abs(mag - 1) < 1e-9 ? '' : nf(mag)}
        <i>{v + (DERIV[k] ?? '')}</i>
      </span>,
    )
  })
  return <>{parts}</>
}
