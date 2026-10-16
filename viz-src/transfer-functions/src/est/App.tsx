import { useState } from 'react'
import { cx, type C } from '../shared/math'
import SectionMachine from './SectionMachine'
import SectionPoint from './SectionPoint'
import { Est } from './fx'
import type { SysKey } from './signals'

export default function App() {
  // s is shared by sections 1 and 2
  const [s, setS] = useState<C>(cx(-0.3, 1.5))
  const [sys, setSys] = useState<SysKey>('handout')
  return (
    <>
      <p className="intro">
        So far we followed signals through <b>time</b>, instant by instant. The Laplace transform asks a different question: which pieces <b><Est /></b> is a signal made of? Every piece belongs to one point <i>s</i> of the complex plane. The <b>dark panels</b> below show that plane, the s-domain. The light panels show time, as before.
      </p>
      <SectionPoint s={s} setS={setS} />
      <div className="divider" />
      <SectionMachine s={s} setS={setS} sys={sys} setSys={setSys} />
    </>
  )
}
