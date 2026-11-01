// Section 4: the other direction. Specs become boundaries in the s-plane.
import { useState } from 'react'
import { Canvas } from '../shared/Canvas'
import { ACCENT, WARN, dot, fmt, hline, vline } from '../shared/plot'
import { nf } from '../shared/tex'
import { Slider } from '../shared/ui'
import { DARK, type Range, type SFrame } from '../est/splane'
import { BOX, dashed, drawResponse, eqMap, note, planeBase, poles } from './draw'
import { Sub } from './fx'
import { D, place, specs, type Pole } from './model'

const T = 8

interface Spec {
  mp: number
  tp: number
  td: number
}

/** Boundaries in the upper half plane: σ ≤ k·ω (overshoot), ω ≥ wMin (peak time), σ ≤ sMax (settling). */
const bounds = (sp: Spec) => ({ k: Math.log(sp.mp) / Math.PI, wMin: Math.PI / sp.tp, sMax: -Math.log(100 / D) / sp.td })

function drawRegion(ctx: CanvasRenderingContext2D, f: SFrame, range: Range, sp: Spec) {
  const { k, wMin, sMax } = bounds(sp)
  const [re0] = range.re
  const wTop = range.im[1]
  // allowed: ω ≥ wMin and σ ≤ min(sMax, k·ω), drawn as a polygon in both halves
  const edge = (w: number) => Math.max(re0, Math.min(sMax, k * w))
  const pts: [number, number][] = [[re0, wMin], [edge(wMin), wMin]]
  const wKink = sMax / k
  if (wKink > wMin && wKink < wTop) pts.push([sMax, wKink])
  pts.push([edge(wTop), wTop], [re0, wTop])
  for (const sgn of [1, -1]) {
    ctx.fillStyle = DARK.accentFill
    ctx.beginPath()
    pts.forEach(([s, w], i) => (i ? ctx.lineTo(f.sx(s), f.sy(sgn * w)) : ctx.moveTo(f.sx(s), f.sy(sgn * w))))
    ctx.closePath()
    ctx.fill()
  }
  const A = DARK.accent
  // overshoot: rays σ = k·ω
  const tRay = Math.min(re0 / k, wTop)
  for (const sgn of [1, -1]) dashed(ctx, [[f.sx(0), f.sy(0)], [f.sx(k * tRay), f.sy(sgn * tRay)]], A, 1.2, [5, 4])
  // peak time: |ω| = wMin
  for (const sgn of [1, -1]) dashed(ctx, [[f.l, f.sy(sgn * wMin)], [f.sx(0), f.sy(sgn * wMin)]], A, 1.2, [5, 4])
  // settling: σ = sMax
  dashed(ctx, [[f.sx(sMax), f.t], [f.sx(sMax), f.b]], A, 1.2, [5, 4])
  note(ctx, '', 'M', 'p', f.sx(k * tRay * 0.82) + 8, f.sy(tRay * 0.82) + 4, A)
  note(ctx, '', 'T', 'p', f.l + 6, f.sy(wMin) + 15, A)
  note(ctx, '', 'T', 'd', f.sx(sMax) + 5, f.b - 8, A)
}

export default function SectionDesign() {
  const [sp, setSp] = useState<Spec>({ mp: 0.2, tp: 1.5, td: 4 })
  const [p, setP] = useState<Pole>({ s: -0.5, w: 1.2 })
  const s = specs(p)
  const ok = { mp: s.mp <= sp.mp, tp: s.tp <= sp.tp, td: s.td <= sp.td }
  const all = ok.mp && ok.tp && ok.td
  const Chip = ({ good, children }: { good: boolean; children: React.ReactNode }) => (
    <span className={'chip ' + (good ? 'ok' : 'bad')}>{children} {good ? 'met' : 'missed'}</span>
  )

  return (
    <>
      <h2 className="sec-h"><span className="n">3</span>From specs to a region</h2>
      <p className="sec-sub">
        In an exercise it usually goes the other way: the specs are given and you look for poles. Each spec turns into a boundary. A maximum overshoot gives two rays (minimum tilt), a maximum peak time a minimum height, a maximum settling time a minimum distance from the j<i>ω</i> axis. Set the specs, then drag the pole into the shaded region.
      </p>

      <div className="ctrls-row">
        <Slider name={<>Overshoot at most &nbsp;<Sub m="M" s="p" /></>} value={`${nf(sp.mp * 100, 0)} %`} min={0.02} max={0.6} step={0.01} v={sp.mp} onChange={(v) => setSp({ ...sp, mp: v })} />
        <Slider name={<>Peak time at most &nbsp;<Sub m="T" s="p" /></>} value={`${fmt(sp.tp, 1)} s`} min={1} max={4} step={0.1} v={sp.tp} onChange={(v) => setSp({ ...sp, tp: v })} />
        <Slider name={<>Settling time at most &nbsp;<Sub m="T" s="d" /></>} value={`${fmt(sp.td, 1)} s`} min={1.2} max={8} step={0.1} v={sp.td} onChange={(v) => setSp({ ...sp, td: v })} />
      </div>

      <div className="est-row spec-split">
        <div className="plot-wrap dark">
          <div className="plot-title">
            <span className="lbl">Allowed poles</span>
            <span className="legend"><span><i className="sw fill" /><span className="t">all three specs met</span></span></span>
          </div>
          <Canvas
            height={380}
            cursor="crosshair"
            draw={(ctx, w, h) => {
              const { f, range } = planeBase(ctx, w, h)
              drawRegion(ctx, f, range, sp)
              poles(ctx, f, p, all ? DARK.accent : DARK.amber)
            }}
            onPointer={(x, y, w, h) => {
              const { f } = eqMap(w, h)
              setP(place(f.ire(x), f.iim(y), p, null, BOX))
            }}
          />
        </div>
        <div className="plot-wrap">
          <div className="plot-title"><span className="lbl">Step response against the specs</span></div>
          <Canvas
            height={380}
            draw={(ctx, w, h) => {
              const f = drawResponse(ctx, w, h, p, { T, markers: false })
              hline(ctx, f, 1 + sp.mp, ACCENT, [5, 4])
              if (sp.tp <= T) vline(ctx, f, sp.tp, ACCENT, [5, 4])
              if (sp.td <= T) vline(ctx, f, sp.td, ACCENT, [5, 4])
              note(ctx, 'max', 'M', 'p', f.r - 62, f.sy(1 + sp.mp) - 6, ACCENT)
              note(ctx, 'max', 'T', 'p', f.sx(sp.tp) + 5, f.t + 14, ACCENT)
              note(ctx, 'max', 'T', 'd', f.sx(sp.td) + 5, f.t + 30, ACCENT)
              if (s.tp <= T) dot(ctx, f.sx(s.tp), f.sy(1 + s.mp), ok.mp && ok.tp ? ACCENT : WARN, 4.5)
            }}
          />
        </div>
      </div>

      <div className="chips">
        <Chip good={ok.mp}><Sub m="M" s="p" /> = {nf(s.mp * 100, 0)} %</Chip>
        <Chip good={ok.tp}><Sub m="T" s="p" /> = {nf(s.tp)} s</Chip>
        <Chip good={ok.td}><Sub m="T" s="d" /> = {nf(s.td)} s</Chip>
      </div>
      <div className={'callout' + (all ? '' : ' warn')}>
        {all ? (
          <><b>All three specs are met.</b> Any pole in the shaded region works. Its corner closest to the origin is the slowest pole that still meets them.</>
        ) : (
          <>
            <b>Not there yet.</b>{' '}
            {!ok.mp && <>Too much overshoot: tilt the pole further from the j<i>ω</i> axis. </>}
            {!ok.tp && <>Peak too late: move the pole up. </>}
            {!ok.td && <>Settles too slowly: move the pole left. </>}
          </>
        )}
      </div>
    </>
  )
}
