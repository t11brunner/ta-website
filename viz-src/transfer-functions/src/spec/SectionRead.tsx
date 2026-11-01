// Section 1: drag the pole, pick a spec, see which feature of the pole sets it.
import { useState } from 'react'
import { Canvas } from '../shared/Canvas'
import { fmt } from '../shared/plot'
import { nf } from '../shared/tex'
import { Ctrl, Pills, Slider } from '../shared/ui'
import { BOX, drawGeometry, eqMap, drawResponse, ghostPoles, planeBase, poles, type Focus } from './draw'
import { FORMULA, SPEC_SYM, Sub, filled, value } from './fx'
import { place, specs, type Pole } from './model'

const T = 8
const ORDER: Focus[] = ['t100', 'tp', 'mp', 'td']

const NAME: Record<Focus, string> = {
  t100: 'Rise time',
  tp: 'Peak time',
  mp: 'Overshoot',
  td: 'Settling time',
}

const WHERE: Record<Focus, React.ReactNode> = {
  t100: <>tilt <i>φ</i> and height <i>ω</i></>,
  tp: <>height <i>ω</i> only</>,
  mp: <>tilt only: the ratio <i>σ</i>/<i>ω</i></>,
  td: <>distance |<i>σ</i>| to the j<i>ω</i> axis only</>,
}

function reading(k: Focus, p: Pole) {
  const sp = specs(p)
  switch (k) {
    case 't100':
      return (
        <>
          <b>{SPEC_SYM.t100} needs both the tilt and the height.</b> Without damping (<i>φ</i> = 0) the response reaches 1 after a quarter period, <Sub m="T" s="100%" /> = (π/2)/<i>ω</i>. Damping tilts the pole away from the j<i>ω</i> axis, <i>φ</i> becomes negative and the response needs more than a quarter turn: here π/2 − <i>φ</i> = {nf(Math.PI / 2 - sp.phi)} rad instead of {nf(Math.PI / 2)}.
        </>
      )
    case 'tp':
      return (
        <>
          <b>{SPEC_SYM.tp} only reads the height ω = {nf(p.w)}.</b> The peak comes after half a period of the oscillation cos <i>ωt</i>. Move the pole left or right along the dashed line: the decay changes, the peak stays at {nf(sp.tp)} s. Higher poles oscillate faster and peak earlier.
        </>
      )
    case 'mp':
      return (
        <>
          <b>{SPEC_SYM.mp} only reads the tilt.</b> The overshoot is the envelope <i>e</i><sup><i>σt</i></sup> evaluated at the peak <i>t</i> = π/<i>ω</i>, so only <i>σ</i>/<i>ω</i> = {nf(p.s / p.w)} enters. Every pole on the dashed ray has the same ζ = sin|<i>φ</i>| = {nf(sp.zeta)} and the same {nf(sp.mp * 100, 0)} % overshoot, just faster or slower.
        </>
      )
    case 'td':
      return (
        <>
          <b>{SPEC_SYM.td} only reads σ = {nf(p.s)}.</b> The dashed envelope 1 ± <i>e</i><sup><i>σt</i></sup> touches every peak of the response. Once it has shrunk to {5} %, the response stays in the band. Moving the pole up or down along the dashed line keeps the envelope and so keeps <Sub m="T" s="d" />.
        </>
      )
  }
}

export default function SectionRead(props: { p: Pole; setP: (p: Pole) => void }) {
  const { p, setP } = props
  const [focus, setFocus] = useState<Focus>('mp')
  const [lock, setLock] = useState<'free' | 'keep'>('free')
  const [ghost, setGhost] = useState<Pole | null>(null)
  const sp = specs(p)
  const locked = lock === 'keep' && focus !== 't100' ? focus : null

  return (
    <>
      <h2 className="sec-h"><span className="n">1</span>Four numbers from one point</h2>
      <p className="sec-sub">
        Drag the pole in the s-plane. Then pick one of the four specs below: the s-plane shows which feature of the pole it depends on, and the dashed line shows where you can move the pole without changing it. The faint dotted curve is the response before your last drag.
      </p>

      <div className="est-row spec-split">
        <div className="plot-wrap dark">
          <div className="plot-title">
            <span className="lbl">The s-plane</span>
            <span className="legend">
              <span><i className="mk amb">×</i><span className="t">poles <i>σ</i> ± j<i>ω</i></span></span>
              <span><i className="sw dash acc" /><span className="t">spec stays the same</span></span>
            </span>
          </div>
          <Canvas
            height={400}
            cursor="crosshair"
            draw={(ctx, w, h) => {
              const { f, range } = planeBase(ctx, w, h)
              if (ghost && (ghost.s !== p.s || ghost.w !== p.w)) ghostPoles(ctx, f, ghost)
              drawGeometry(ctx, f, range, p, focus)
              poles(ctx, f, p)
            }}
            onPointer={(x, y, w, h, first) => {
              if (first) setGhost(p)
              const { f } = eqMap(w, h)
              setP(place(f.ire(x), f.iim(y), p, locked, BOX))
            }}
          />
          <div className="plot-foot">
            <i>ω</i><sub>n</sub> = √(<i>σ</i>² + <i>ω</i>²) = {nf(sp.wn)} &nbsp;·&nbsp; <i>φ</i> = tan<sup>−1</sup>(<i>σ</i>/<i>ω</i>) = {nf(sp.phi)} rad &nbsp;·&nbsp; ζ = sin|<i>φ</i>| = {nf(sp.zeta)}
          </div>
        </div>

        <div className="plot-wrap">
          <div className="plot-title">
            <span className="lbl">Step response &nbsp;·&nbsp; <span className="math">y(t)</span></span>
            <span className="legend">
              <span><i className="sw" /><span className="t">now</span></span>
              <span><i className="sw ghost" /><span className="t">before</span></span>
              <span><i className="sw band" /><span className="t">± 5 %</span></span>
            </span>
          </div>
          <Canvas height={400} draw={(ctx, w, h) => drawResponse(ctx, w, h, p, { T, focus, ghost })} />
          <div className="plot-foot">Dashed: the envelope 1 ± <i>e</i><sup><i>σt</i></sup>. It is set by <i>σ</i> alone and touches every peak.</div>
        </div>
      </div>

      <div className="spec-cards">
        {ORDER.map((k) => (
          <button key={k} className={'spec-card' + (focus === k ? ' on' : '')} onClick={() => setFocus(k)}>
            <span className="lbl">{NAME[k]}</span>
            <span className="fx sym-line">{SPEC_SYM[k]} = {FORMULA[k]}</span>
            <span className="fx num-line">= {filled(k, p)}</span>
            <span className="val">{value(k, p)}</span>
            <span className="where">reads the {WHERE[k]}</span>
          </button>
        ))}
      </div>

      <div className="callout">{reading(focus, p)}</div>

      <div className="ctrls-row top-gap">
        <Ctrl name="While dragging">
          <Pills
            small
            items={[
              { key: 'free', label: 'Move freely' },
              { key: 'keep', label: <>Keep {focus === 't100' ? 'the spec' : SPEC_SYM[focus]} fixed</> },
            ]}
            value={lock}
            onChange={setLock}
          />
          {lock === 'keep' && focus === 't100' && <div className="hint">No straight line keeps <Sub m="T" s="100%" /> fixed. Pick <Sub m="T" s="p" />, <Sub m="M" s="p" /> or <Sub m="T" s="d" />.</div>}
        </Ctrl>
        <Slider name={<>Real part &nbsp;<em>σ</em></>} value={fmt(p.s, 2)} min={BOX.re[0]} max={BOX.re[1]} step={0.01} v={p.s} onChange={(v) => setP({ s: v, w: p.w })} />
        <Slider name={<>Imaginary part &nbsp;<em>ω</em></>} value={`${fmt(p.w, 2)} rad/s`} min={BOX.im[0]} max={BOX.im[1]} step={0.01} v={p.w} onChange={(v) => setP({ s: p.s, w: v })} />
      </div>
    </>
  )
}
