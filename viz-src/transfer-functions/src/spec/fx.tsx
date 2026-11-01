// Formula pieces for the pole-spec demo.
import { Frac, nf } from '../shared/tex'
import type { Focus } from './draw'
import type { Pole } from './model'
import { specs } from './model'

/** Symbol with a subscript, e.g. T_p. */
export const Sub = ({ m, s }: { m: string; s: string }) => (
  <span className="sym">
    <i>{m}</i>
    <sub>{s}</sub>
  </span>
)

export const SPEC_SYM: Record<Focus, React.ReactNode> = {
  t100: <Sub m="T" s="100%" />,
  tp: <Sub m="T" s="p" />,
  mp: <Sub m="M" s="p" />,
  td: <Sub m="T" s="d" />,
}

const sg = <i>σ</i>
const om = <i>ω</i>
const ph = <i>φ</i>

/** The slide's formula for each spec. */
export const FORMULA: Record<Focus, React.ReactNode> = {
  t100: <Frac n={<>π/2 − {ph}</>} d={om} />,
  tp: <Frac n="π" d={om} />,
  mp: <>exp<span className="paren">(</span><Frac n={<>{sg}π</>} d={om} /><span className="paren">)</span></>,
  td: <><Frac n="1" d={<>|{sg}|</>} />log(100/<i>d</i>)</>,
}

/** The same formula with the numbers of pole p filled in. */
export function filled(k: Focus, p: Pole) {
  const sp = specs(p)
  switch (k) {
    case 't100':
      return <Frac n={<>π/2 − ({nf(sp.phi)})</>} d={nf(p.w)} />
    case 'tp':
      return <Frac n="π" d={nf(p.w)} />
    case 'mp':
      return <>exp<span className="paren">(</span><Frac n={<>{nf(p.s)}·π</>} d={nf(p.w)} /><span className="paren">)</span></>
    case 'td':
      return <><Frac n="1" d={nf(-p.s)} />log(20)</>
  }
}

export function value(k: Focus, p: Pole) {
  const sp = specs(p)
  if (k === 'mp') return `${nf(sp.mp, 2)} = ${nf(sp.mp * 100, 0)} %`
  return `${nf(sp[k], 2)} s`
}
