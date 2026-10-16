// Small HTML formula pieces: fractions, polynomials in s, complex numbers and
// sums of exponentials, so formulas update live with the sliders.
import type { C, Poly, Term } from './math'
import { cabs, carg } from './math'

/** Short number: integers stay integers, otherwise up to `d` decimals. */
export function nf(x: number, d = 2) {
  if (Math.abs(x - Math.round(x)) < 1e-6) x = Math.round(x)
  const s = Number.isInteger(x) ? String(x) : String(+x.toFixed(d))
  return s === '-0' ? '0' : s.replace('-', '−')
}

export const S = () => <i>s</i>

export function Frac(props: { n: React.ReactNode; d: React.ReactNode }) {
  return (
    <span className="frac">
      <span>{props.n}</span>
      <span>{props.d}</span>
    </span>
  )
}

/** Polynomial in `v`, highest power first. */
export function PolyView({ p, v = 's' }: { p: Poly; v?: string }) {
  const n = p.length - 1
  const parts: React.ReactNode[] = []
  p.forEach((a, i) => {
    if (Math.abs(a) < 1e-9) return
    const pow = n - i
    const first = parts.length === 0
    const sign = a < 0 ? (first ? '−' : ' − ') : first ? '' : ' + '
    const mag = Math.abs(a)
    const coef = pow > 0 && Math.abs(mag - 1) < 1e-9 ? '' : nf(mag)
    parts.push(
      <span key={i}>
        {sign}
        {coef}
        {pow > 0 && <i>{v}</i>}
        {pow > 1 && <sup>{pow}</sup>}
      </span>,
    )
  })
  return <>{parts.length ? parts : '0'}</>
}

export function RatView({ num, den }: { num: Poly; den: Poly }) {
  if (den.length === 1 && Math.abs(den[0] - 1) < 1e-9) return <PolyView p={num} />
  return <Frac n={<PolyView p={num} />} d={<PolyView p={den} />} />
}

export function Cnum({ z, d = 2 }: { z: C; d?: number }) {
  const im = Math.abs(z.im) < 0.5 * 10 ** -d ? 0 : z.im
  if (im === 0) return <>{nf(z.re, d)}</>
  return (
    <>
      {nf(z.re, d)} {im < 0 ? '−' : '+'} {nf(Math.abs(im), d)}
      <i>j</i>
    </>
  )
}

/** e^{pt} with the exponent written compactly. */
function Exp({ a }: { a: number }) {
  return (
    <>
      e
      <sup>
        {nf(a) === '1' ? '' : nf(a) === '−1' ? '−' : nf(a)}
        <i>t</i>
      </sup>
    </>
  )
}

/** Σ r·e^{pt}, with conjugate pole pairs merged into A·e^{σt}·cos(ωt + φ). */
export function TermsView({ terms, v = 'y' }: { terms: Term[]; v?: string }) {
  const parts: { key: number; mag: number; neg: boolean; node: React.ReactNode }[] = []
  terms.forEach(({ p, r }, i) => {
    if (p.im < -1e-9) return
    if (Math.abs(p.im) < 1e-9) {
      const k = r.re
      if (Math.abs(k) < 5e-3) return
      const node = Math.abs(p.re) < 1e-9 ? null : <Exp a={p.re} />
      parts.push({ key: i, mag: Math.abs(k), neg: k < 0, node: <>{(node && Math.abs(Math.abs(k) - 1) < 5e-3) ? '' : nf(Math.abs(k))}{node}</> })
    } else {
      const A = 2 * cabs(r)
      if (A < 5e-3) return
      const phi = carg(r)
      parts.push({
        key: i,
        mag: A,
        neg: false,
        node: (
          <>
            {Math.abs(A - 1) < 5e-3 ? '' : nf(A)}
            {Math.abs(p.re) > 1e-9 && <Exp a={p.re} />}
            &thinsp;cos({nf(p.im)}
            <i>t</i>
            {Math.abs(phi) > 5e-3 && <> {phi < 0 ? '−' : '+'} {nf(Math.abs(phi))}</>})
          </>
        ),
      })
    }
  })
  // constant terms first, then the rest in pole order
  const nonConst = (k: number) => Number(cabs(terms[k].p) > 1e-9)
  parts.sort((a, b) => nonConst(a.key) - nonConst(b.key))
  return (
    <>
      <i>{v}</i>(<i>t</i>) ={' '}
      {parts.length === 0
        ? '0'
        : parts.map((q, i) => (
            <span key={q.key}>
              {i === 0 ? (q.neg ? '−' : '') : q.neg ? ' − ' : ' + '}
              {q.node}
            </span>
          ))}
    </>
  )
}
