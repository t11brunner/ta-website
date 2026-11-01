import { useState } from 'react'
import { Frac } from '../shared/tex'
import SectionDesign from './SectionDesign'
import SectionFamilies from './SectionFamilies'
import SectionRead from './SectionRead'
import { SPEC_SYM } from './fx'
import type { Pole } from './model'

export default function App() {
  const [p, setP] = useState<Pole>({ s: -0.6, w: 2.4 })
  return (
    <>
      <p className="intro">
        For the standard second-order system <i>G</i>(<i>s</i>) = <Frac n={<><i>ω</i><sub>n</sub><sup>2</sup></>} d={<><i>s</i><sup>2</sup> + 2ζ<i>ω</i><sub>n</sub><i>s</i> + <i>ω</i><sub>n</sub><sup>2</sup></>} />, the pole pair <i>σ</i> ± j<i>ω</i> fixes the whole step response. The four specs {SPEC_SYM.t100}, {SPEC_SYM.tp}, {SPEC_SYM.mp} and {SPEC_SYM.td} each read one feature of where the pole sits: how high, how far left, and how much it is tilted away from the j<i>ω</i> axis. The <b>dark panels</b> show the s-plane, the light ones show time.
      </p>
      <SectionRead p={p} setP={setP} />
      <div className="divider" />
      <SectionFamilies />
      <div className="divider" />
      <SectionDesign />
    </>
  )
}
