// Section 3: move the pole along one line and compare five responses side by side.
import { useState } from 'react'
import { Canvas } from '../shared/Canvas'
import { ACCENT, grid, hline, polyline, vline } from '../shared/plot'
import { nf } from '../shared/tex'
import { Pills } from '../shared/ui'
import { DARK, cross } from '../est/splane'
import { dashed, envelope, note, planeBase, rayEnd, respFrame } from './draw'
import { SPEC_SYM, Sub } from './fx'
import { curve, fromZeta, specs, type Pole } from './model'

const T = 8
type Fam = 'w' | 's' | 'zeta' | 'wn'
type Col = 't100' | 'tp' | 'mp' | 'td' | 'wn'

const FAMS: { key: Fam; label: React.ReactNode; poles: Pole[]; keep: Col; text: React.ReactNode }[] = [
  {
    key: 'w',
    label: <>Same <i>ω</i>: move left</>,
    poles: [-0.3, -0.6, -1, -1.6, -2.4].map((s) => ({ s, w: 2.4 })),
    keep: 'tp',
    text: <>All five peaks sit at the same time <Sub m="T" s="p" /> = π/<i>ω</i>: the oscillation inside is the same. Moving left only makes the envelope shrink faster, so overshoot and settling time drop.</>,
  },
  {
    key: 's',
    label: <>Same <i>σ</i>: move up</>,
    poles: [0.8, 1.4, 2, 2.6, 3.2].map((w) => ({ s: -0.6, w })),
    keep: 'td',
    text: <>All five responses live inside the same envelope 1 ± <i>e</i><sup>−0.6<i>t</i></sup>, so <Sub m="T" s="d" /> is the same. Higher poles oscillate faster: they peak earlier and higher, because the envelope has had less time to shrink.</>,
  },
  {
    key: 'zeta',
    label: <>Same ζ: along a ray</>,
    poles: [0.8, 1.3, 1.9, 2.5, 3.2].map((w) => ({ s: -0.3 * w, w })),
    keep: 'mp',
    text: <>Five copies of the same curve, stretched in time. The overshoot is identical; every time spec scales with 1/<i>ω</i><sub>n</sub>, so the pole furthest from the origin is the fastest.</>,
  },
  {
    key: 'wn',
    label: <>Same <i>ω</i><sub>n</sub>: around a circle</>,
    poles: [0.1, 0.3, 0.5, 0.7, 0.9].map((z) => fromZeta(z, 2.6)),
    keep: 'wn',
    text: <>Swinging the pole towards the j<i>ω</i> axis lowers ζ: the overshoot grows from {nf(specs(fromZeta(0.9, 2.6)).mp * 100, 1)} % to {nf(specs(fromZeta(0.1, 2.6)).mp * 100, 0)} % and the response takes much longer to settle, while <i>ω</i><sub>n</sub> stays the same.</>,
  },
]

/** Light to strong in the order of the poles, the same order on the dark s-plane and the light plots. */
const lightShade = (i: number) => `oklch(${0.8 - 0.085 * i} 0.1 250)`
const darkShade = (i: number) => `oklch(${0.9 - 0.07 * i} 0.11 245)`

const COLS: { key: Col; head: React.ReactNode; v: (p: Pole) => string }[] = [
  { key: 't100', head: SPEC_SYM.t100, v: (p) => nf(specs(p).t100) + ' s' },
  { key: 'tp', head: SPEC_SYM.tp, v: (p) => nf(specs(p).tp) + ' s' },
  { key: 'mp', head: SPEC_SYM.mp, v: (p) => nf(specs(p).mp * 100, 1) + ' %' },
  { key: 'td', head: SPEC_SYM.td, v: (p) => nf(specs(p).td) + ' s' },
  { key: 'wn', head: <><i>ω</i><sub>n</sub></>, v: (p) => nf(specs(p).wn) },
]

export default function SectionFamilies() {
  const [fam, setFam] = useState<Fam>('w')
  const F = FAMS.find((f) => f.key === fam)!
  const ts = grid(0, T, 800)

  return (
    <>
      <h2 className="sec-h"><span className="n">2</span>Move the pole along one line</h2>
      <p className="sec-sub">
        Put five poles on one line of the s-plane and compare their responses. Each line keeps one thing fixed. The table shows which column stops changing.
      </p>

      <div className="ctrls-row">
        <Pills items={FAMS.map((f) => ({ key: f.key, label: f.label }))} value={fam} onChange={setFam} />
      </div>

      <div className="est-row spec-split">
        <div className="plot-wrap dark">
          <div className="plot-title"><span className="lbl">The s-plane</span></div>
          <Canvas
            height={380}
            draw={(ctx, w, h) => {
              const { f, range } = planeBase(ctx, w, h)
              const A = DARK.accent
              const p0 = F.poles[2]
              if (fam === 'w') for (const y of [f.sy(p0.w), f.sy(-p0.w)]) dashed(ctx, [[f.l, y], [f.sx(0), y]], A)
              if (fam === 's') dashed(ctx, [[f.sx(p0.s), f.t], [f.sx(p0.s), f.b]], A)
              if (fam === 'zeta') {
                const e = rayEnd(p0, range)
                dashed(ctx, [[f.sx(0), f.sy(0)], [f.sx(e.s), f.sy(e.w)]], A)
                dashed(ctx, [[f.sx(0), f.sy(0)], [f.sx(e.s), f.sy(-e.w)]], A)
              }
              if (fam === 'wn') {
                ctx.strokeStyle = A
                ctx.lineWidth = 1.5
                ctx.setLineDash([6, 5])
                ctx.beginPath()
                ctx.arc(f.sx(0), f.sy(0), f.sx(0) - f.sx(-2.6), Math.PI / 2, (3 * Math.PI) / 2)
                ctx.stroke()
                ctx.setLineDash([])
              }
              F.poles.forEach((p, i) => {
                cross(ctx, f.sx(p.s), f.sy(p.w), darkShade(i), 5.5, 2.2)
                cross(ctx, f.sx(p.s), f.sy(-p.w), darkShade(i), 5.5, 2.2)
              })
              if (F.keep !== 'wn' && F.keep !== 't100') note(ctx, 'same', F.keep[0].toUpperCase(), F.keep.slice(1), f.l + 6, f.t + 14, A)
              else if (F.keep === 'wn') note(ctx, 'same', 'ω', 'n', f.l + 6, f.t + 14, A)
            }}
          />
        </div>
        <div className="plot-wrap">
          <div className="plot-title"><span className="lbl">Step responses</span></div>
          <Canvas
            height={380}
            draw={(ctx, w, h) => {
              const f = respFrame(ctx, w, h, T)
              const p0 = F.poles[2]
              if (fam === 's') envelope(ctx, f, p0, T, ACCENT, 1.5)
              if (fam === 'w') vline(ctx, f, specs(p0).tp, ACCENT)
              if (fam === 'zeta') hline(ctx, f, 1 + specs(p0).mp, ACCENT)
              F.poles.forEach((p, i) => polyline(ctx, f, ts, curve(p, ts), { color: lightShade(i), width: 2 }))
            }}
          />
        </div>
      </div>

      <div className="panel ledger-wrap">
        <table className="ledger">
          <thead>
            <tr>
              <th />
              <th>Pole</th>
              {COLS.map((c) => (
                <th key={c.key} className={c.key === F.keep ? 'keep' : ''}>{c.head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {F.poles.map((p, i) => (
              <tr key={i}>
                <td><i className="swatch" style={{ background: lightShade(i) }} /></td>
                <td className="mono">{nf(p.s)} ± {nf(p.w)}j</td>
                {COLS.map((c) => (
                  <td key={c.key} className={'mono' + (c.key === F.keep ? ' keep' : '')}>{c.v(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="callout">{F.text}</div>
    </>
  )
}
