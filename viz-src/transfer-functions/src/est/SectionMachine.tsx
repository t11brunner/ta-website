// Section 2: e^{st} goes through G and comes out multiplied by one number, G(s).
import { useMemo, useRef } from 'react'
import { Canvas } from '../shared/Canvas'
import { cabs, carg, csub, cx, proots, simulate, tfEval, type C, type Rat } from '../shared/math'
import { ACCENT, INK, SANS, clip, fmt, frame, grid, polyline, rangeOf } from '../shared/plot'
import { Cnum, PolyView, RatView, S, nf } from '../shared/tex'
import { Pills } from '../shared/ui'
import { E, Est, OdeSide, PieceView, PoleView, waveOf } from './fx'
import { BOX, PLANE, drawPlane } from './SectionPoint'
import { SYSTEMS, type SysKey } from './signals'
import { AMBER_FILL, DARK, cross, dragTo, sMap, sPoint, type SFrame } from './splane'

const T = 10
const N = 1000
const TS = grid(0, T, N)

/** |G(s)| over the visible plane as a soft glow, at a third of the resolution. */
function glowImage(G: Rat, f: SFrame) {
  const cw = Math.max(2, Math.round((f.r - f.l) / 3))
  const ch = Math.max(2, Math.round((f.b - f.t) / 3))
  const c = document.createElement('canvas')
  c.width = cw
  c.height = ch
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(cw, ch)
  for (let j = 0; j < ch; j++)
    for (let i = 0; i < cw; i++) {
      const s = cx(f.ire(f.l + ((i + 0.5) * (f.r - f.l)) / cw), f.iim(f.t + ((j + 0.5) * (f.b - f.t)) / ch))
      const a = Math.min(1, Math.max(0, (Math.log10(cabs(tfEval(G, s))) + 1.3) / 2.3))
      const k = 4 * (j * cw + i)
      img.data[k] = 150
      img.data[k + 1] = 188
      img.data[k + 2] = 236
      img.data[k + 3] = Math.round(255 * (0.02 + 0.5 * a * a))
    }
  ctx.putImageData(img, 0, 0)
  return c
}

export default function SectionMachine(props: { s: C; setS: (s: C) => void; sys: SysKey; setSys: (k: SysKey) => void }) {
  const { s, sys } = props
  const G = SYSTEMS[sys].G
  const poles = useMemo(() => proots(G.den), [G])
  const slow = Math.max(...poles.map((p) => p.re))
  const slowPole = poles.find((p) => p.re === slow)!
  const nearest = poles.reduce((a, b) => (cabs(csub(a, s)) < cabs(csub(b, s)) ? a : b))
  const onPole = cabs(csub(nearest, s)) < 0.06
  const Gs = tfEval(G, s)
  const A = cabs(Gs)
  const phi = carg(Gs)
  const glow = useRef<{ key: string; img: HTMLCanvasElement } | null>(null)

  const sim = useMemo(() => {
    const u = (t: number) => Math.exp(s.re * t) * Math.cos(s.im * t)
    return {
      u: TS.map(u),
      y: simulate(G, u, T, N),
      forced: TS.map((t) => A * Math.exp(s.re * t) * Math.cos(s.im * t + phi)),
    }
  }, [s.re, s.im, G, A, phi])

  const n = G.den.length - 1
  const derivs = [1, 2].filter((k) => k <= n)

  return (
    <>
      <h2 className="sec-h"><span className="n">2</span>Why <Est />? The system only multiplies it</h2>
      <p className="sec-sub">
        Differentiate <Est /> and you get <Est /> back, times <i>s</i>. So when <Est /> goes into a linear ODE, nothing new can come out: the output is the same <Est />, multiplied by one complex number. That number is <i>G</i>(<i>s</i>). Drag <i>s</i> here or in section 1.
      </p>

      <div className="ctrls-row">
        <div className="ctrl">
          <div className="clabel"><span className="cname">System</span></div>
          <Pills small items={(Object.keys(SYSTEMS) as SysKey[]).map((k) => ({ key: k, label: SYSTEMS[k].label }))} value={sys} onChange={props.setSys} />
        </div>
      </div>

      <div className="est-row">
        <div className="panel">
          <div className="lbl" style={{ marginBottom: 12 }}>The ODE, fed with <span className="math"><Est /></span></div>
          <div className="deriv">
            <div className="step">
              <span className="k">1</span>
              <span className="fx"><OdeSide p={G.den} v="y" /> = <OdeSide p={G.num} v="u" /></span>
            </div>
            <div className="step">
              <span className="k">2</span>
              <span className="fx">
                <i>u</i> = <Est />, &ensp;<i>y</i> = <i>Y</i>·<Est />
                {derivs.map((k) => (
                  <span key={k}>
                    , &ensp;<i>y{k === 1 ? '̇' : '̈'}</i> = <i>s</i>{k > 1 && <sup>{k}</sup>}<i>Y</i>·<Est />
                  </span>
                ))}
              </span>
            </div>
            <div className="step">
              <span className="k">3</span>
              <span className="fx">(<PolyView p={G.den} />)·<i>Y</i>·<Est /> = {G.num.length === 1 && G.num[0] === 1 ? '' : <>{nf(G.num[0])}·</>}<Est /></span>
            </div>
            <div className="step">
              <span className="k">4</span>
              <span className="fx choice"><i>Y</i> = <RatView num={G.num} den={G.den} /> = <i>G</i>(<S />)</span>
            </div>
            <div className="step">
              <span />
              <span className="hint">
                Divide by <Est /> (it is never zero): the ODE has turned into algebra. At the current <i>s</i> = <Cnum z={s} />, the whole system is the single number <i>G</i>(<i>s</i>) = {onPole ? '∞' : <Cnum z={Gs} />}.
              </span>
            </div>
          </div>
        </div>

        <div className="plot-wrap dark">
          <div className="plot-title">
            <span className="lbl"><span className="math">|G(s)|</span> over the s-plane</span>
            <span className="legend">
              <span><i className="mk amb">×</i><span className="t">poles of <i>G</i></span></span>
              <span><i className="mk dot" /><span className="t"><i>s</i></span></span>
            </span>
          </div>
          <Canvas
            height={300}
            cursor="crosshair"
            draw={(ctx, w, h) => {
              const f = drawPlane(ctx, w, h, (f) => {
                const key = `${sys}|${w}|${h}`
                if (glow.current?.key !== key) glow.current = { key, img: glowImage(G, f) }
                ctx.imageSmoothingEnabled = true
                ctx.drawImage(glow.current.img, f.l, f.t, f.r - f.l, f.b - f.t)
              })
              // right of the slowest pole, e^{st} outlasts every mode of G
              const xs = f.sx(slow)
              ctx.fillStyle = 'rgba(255, 255, 255, 0.035)'
              ctx.fillRect(xs, f.t, f.r - xs, f.b - f.t)
              ctx.strokeStyle = DARK.amber
              ctx.lineWidth = 1
              ctx.setLineDash([4, 4])
              ctx.beginPath()
              ctx.moveTo(xs, f.t)
              ctx.lineTo(xs, f.b)
              ctx.stroke()
              ctx.setLineDash([])
              const yl = f.b - 8
              ctx.font = `500 11px ${SANS}`
              ctx.fillStyle = DARK.text
              ctx.textAlign = 'right'
              ctx.fillText('← transient wins', xs - 6, yl)
              ctx.textAlign = 'left'
              // "G(s)·e^{st} wins →" with a raised exponent
              let x = xs + 6
              for (const [txt, sup] of [['G(s)·e', false], ['st', true], [' wins →', false]] as const) {
                ctx.font = sup ? `500 8.5px ${SANS}` : `500 11px ${SANS}`
                ctx.fillText(txt, x, sup ? yl - 5 : yl)
                x += ctx.measureText(txt).width + (sup ? 1 : 0)
              }
              poles.forEach((p) => cross(ctx, f.sx(p.re), f.sy(p.im), DARK.amber))
              sPoint(ctx, f, s)
            }}
            onPointer={(x, y, w, h) => props.setS(dragTo(sMap(w, h, PLANE), x, y, BOX))}
          />
          <div className="plot-foot">Bright means large |<i>G</i>|: the poles are where <i>G</i> blows up. The amber line marks the slowest pole of <i>G</i>.</div>
        </div>
      </div>

      <div className="strip">
        <span className="sig">u = <PieceView {...waveOf(s, cx(1))} /></span>
        <span className="wire" />
        <div className="block">
          <span className="lbl">{SYSTEMS[sys].label}</span>
          <span className="fx"><i>G</i>(<S />) = <RatView num={G.num} den={G.den} /></span>
        </div>
        <span className="wire y" />
        <span className="sig y">{onPole ? 'grows without bound' : <>y → <PieceView {...waveOf(s, Gs)} /></>}</span>
      </div>

      <div className="plot-wrap" style={{ marginBottom: 16 }}>
        <div className="plot-title">
          <span className="lbl">Starting from rest</span>
          <span className="legend">
            <span><i className="sw" /><span className="t"><i>u</i>(<i>t</i>)</span></span>
            <span><i className="sw acc" /><span className="t"><i>y</i>(<i>t</i>)</span></span>
            <span><i className="sw dash acc" /><span className="t"><i>G</i>(<i>s</i>)·<Est /></span></span>
            <span><i className="sw fill amb" /><span className="t">transient</span></span>
          </span>
        </div>
        <Canvas
          height={200}
          draw={(ctx, w, h) => {
            const f = frame(ctx, w, h, { x: [0, T], y: rangeOf([sim.u, sim.y], 1), xUnit: 's' })
            if (!onPole) {
              ctx.save()
              clip(ctx, f)
              ctx.fillStyle = AMBER_FILL
              ctx.beginPath()
              const lim = (v: number) => Math.max(-1e4, Math.min(1e4, f.sy(v)))
              TS.forEach((t, k) => (k ? ctx.lineTo(f.sx(t), lim(sim.y[k])) : ctx.moveTo(f.sx(t), lim(sim.y[k]))))
              for (let k = N; k >= 0; k--) ctx.lineTo(f.sx(TS[k]), lim(sim.forced[k]))
              ctx.closePath()
              ctx.fill()
              ctx.restore()
            }
            polyline(ctx, f, TS, sim.u, { color: INK, width: 1.4 })
            if (!onPole) polyline(ctx, f, TS, sim.forced, { color: ACCENT, width: 1.6, dash: [5, 4] })
            polyline(ctx, f, TS, sim.y, { color: ACCENT, width: 2.2 })
          }}
        />
        <div className="plot-foot">The system starts at rest, so at first <i>y</i> also contains the system's own modes (amber). Where they have died out, <i>y</i> runs exactly on <i>G</i>(<i>s</i>)·<Est />.</div>
      </div>

      <div className="panel">
        <div className="probe-read">
          <div className="kv">
            <span className="k">s</span>
            <span className="v"><Cnum z={s} /></span>
            <span className="k">G(s)</span>
            <span className="v acc">{onPole ? '∞' : <Cnum z={Gs} />}</span>
            <span className="k">|G(s)|</span>
            <span className="v">{onPole ? '∞' : fmt(A, 3)}</span>
            <span className="k">∠G(s)</span>
            <span className="v">{onPole ? '—' : <>{fmt(phi, 2)} rad = {fmt((phi * 180) / Math.PI, 0)}°</>}</span>
          </div>
          {onPole ? (
            <div className="callout warn" style={{ marginTop: 0 }}>
              <b>s sits on a pole of G.</b> There <i>G</i>(<i>s</i>) is infinite: the input is one of the system's own modes, so it keeps pushing in step with it, and the output grows like <i>t</i>·<Est />. Move <i>s</i> a little and <i>G</i>(<i>s</i>) is finite again.
            </div>
          ) : s.re < slow ? (
            <div className="callout amb" style={{ marginTop: 0 }}>
              <b>The transient wins here.</b> <Est /> dies out faster than the slowest mode of the system, <E x={<>(<PoleView p={slowPole} />)<i>t</i></>} />. The forced part <i>G</i>(<i>s</i>)·<Est /> is still in <i>y</i>, but the amber transient outlasts it.
            </div>
          ) : (
            <div className="callout" style={{ marginTop: 0 }}>
              Once the amber transient has faded, <b><i>y</i>(<i>t</i>) is exactly <i>G</i>(<i>s</i>)·<Est /></b>: same σ, same ω, only scaled by |<i>G</i>(<i>s</i>)| = {fmt(A, 2)} and shifted by ∠<i>G</i>(<i>s</i>) = {fmt(phi, 2)} rad. One complex number instead of solving the ODE.
              {s.re === 0 && s.im === 0 && <> At <i>s</i> = 0, <Est /> = 1 is the step, and <i>G</i>(0) = {nf(Gs.re, 3)} is the static gain.</>}
              {s.re === 0 && s.im !== 0 && <> With σ = 0 this is exactly the sine machine: <i>G</i>(<i>j</i>ω).</>}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

