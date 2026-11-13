// G(jω) read off the pole-zero map: every factor (jω − r) is the arrow from the
// pole or zero r to the point jω. Lengths multiply and divide to |G|, angles add
// and subtract to the phase. Moving jω up the axis traces the Bode and polar plots.
import { Canvas } from '../shared/Canvas'
import { ACCENT, GRID, INK_SOFT, LINE, MONO, MUTE, SANS, ZERO, arrow, dot, frame, niceStep, polyline, vline } from '../shared/plot'
import { Frac, nf } from '../shared/tex'
import { Ctrl, Pills, PlayToggle, Slider, useLoop } from '../shared/ui'
import { DARK } from '../est/splane'
import { EXAMPLES, W0, W1, exactMag, exactPh, typeName, type Root, type Sys } from '../bode/model'
import { useState } from 'react'

type Key = 'ex' | 'handout'
const SYSTEMS: Record<Key, { label: string; sys: Sys }> = {
  ex: {
    label: 'Exercise example',
    sys: {
      K: 1,
      n0: 0,
      roots: [
        { kind: 'zero', r: 1, name: 'z₁' },
        { kind: 'pole', r: -10, name: 'p₁' },
        { kind: 'pole', r: -100, name: 'p₂' },
      ],
    },
  },
  handout: { label: 'Bode sketching example', sys: EXAMPLES[0] },
}

const LOOP = 14
const D_ZERO = 'oklch(0.8 0.12 160)'
const D_POLE = 'oklch(0.76 0.13 30)'
const SUP = '⁰¹²³⁴'
const pow10 = (v: number) => {
  const e = Math.round(Math.log10(v))
  return '10' + (e < 0 ? '⁻' : '') + SUP[Math.abs(e)]
}
const deg = (rad: number) => (rad * 180) / Math.PI
/** Three significant digits, without exponent. */
const sig = (v: number) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2))
const axisNum = (v: number) => String(+v.toPrecision(3)).replace('-', '−')

/** The arrow from the root to jω: its length and its angle in degrees. */
const len = (q: Root, w: number) => Math.hypot(w, q.r)
const ang = (q: Root, w: number) => deg(Math.atan2(w, -q.r))

const S = () => <i>s</i>
function Formula({ k }: { k: Key }) {
  const z = (t: React.ReactNode) => <span className="zr">{t}</span>
  const p = (t: React.ReactNode) => <span className="pl">{t}</span>
  return k === 'ex' ? (
    <>
      <i>G</i>(<S />) = <Frac n={z(<>(<S /> − 1)</>)} d={<>{p(<>(<S /> + 10)</>)}{p(<>(<S /> + 100)</>)}</>} />
    </>
  ) : (
    <>
      <i>G</i>(<S />) = <Frac n={<>{z(<>(<S /> + 1)</>)}{z(<>(<S /> − 100)</>)}</>} d={<>{p(<>(<S /> + 10)</>)}{p(<>(<S /> + 30)</>)}{p(<>(<S /> − 1000)</>)}</>} />
    </>
  )
}

/** a · 10^b for small and large numbers. */
function Sci({ v }: { v: number }) {
  const e = Math.floor(Math.log10(Math.abs(v)))
  if (e >= -1 && e <= 2) return <>{nf(v, 2)}</>
  return (
    <>
      {nf(v / 10 ** e, 1)} · 10<sup>{String(e).replace('-', '−')}</sup>
    </>
  )
}

const join = (items: React.ReactNode[], sep: string) =>
  items.length ? items.map((it, i) => <span key={i}>{i > 0 && sep}{it}</span>) : ['1']

export default function App() {
  const [key, setKey] = useState<Key>('ex')
  const clock = useLoop(LOOP, 1)
  const frac = Math.min(1, clock.t / (LOOP - 2))
  const w = W0 * (W1 / W0) ** frac
  const { sys } = SYSTEMS[key]
  const zeros = sys.roots.filter((q) => q.kind === 'zero')
  const poles = sys.roots.filter((q) => q.kind === 'pole')

  const db = exactMag(sys, w)
  const ph = exactPh(sys, w)
  const gain = 10 ** (db / 20)

  const N = 300
  const ws = Array.from({ length: N + 1 }, (_, k) => W0 * (W1 / W0) ** (k / N))
  const dbs = ws.map((v) => exactMag(sys, v))
  const phs = ws.map((v) => exactPh(sys, v))
  const k = Math.round(frac * N)
  const dbLo = Math.floor((Math.min(...dbs) - 5) / 20) * 20
  const dbHi = Math.ceil((Math.max(...dbs) + 5) / 20) * 20
  const phLo = Math.floor((Math.min(...phs) - 1) / 90) * 90
  const phHi = Math.ceil((Math.max(...phs) + 1) / 90) * 90
  const range = (a: number, b: number, st: number) => Array.from({ length: Math.round((b - a) / st) + 1 }, (_, i) => a + i * st)

  // polar plot: G(jω) as a point, over a wider band than the Bode plots so the curve closes
  const wp = Array.from({ length: 501 }, (_, i) => 1e-3 * 10 ** ((i / 500) * 9))
  const polar = wp.map((v) => {
    const m = 10 ** (exactMag(sys, v) / 20)
    const a = (exactPh(sys, v) * Math.PI) / 180
    return [m * Math.cos(a), m * Math.sin(a)]
  })
  const gNow = [gain * Math.cos((ph * Math.PI) / 180), gain * Math.sin((ph * Math.PI) / 180)]

  const rhpZero = zeros.find((q) => q.r > 0)

  return (
    <>
      <p className="intro">
        To get the frequency response we plug in <S /> = <i>j</i>ω. Every factor (<i>j</i>ω − <i>z</i>) or (<i>j</i>ω − <i>p</i>) is then an <b>arrow</b> from that zero or pole to the point <i>j</i>ω on the imaginary axis. The poles and zeros stay put. The point climbs as ω grows, and the arrows stretch and tilt.
      </p>

      <div className="ctrls-row">
        <Ctrl name="System">
          <Pills small items={(Object.keys(SYSTEMS) as Key[]).map((q) => ({ key: q, label: SYSTEMS[q].label }))} value={key} onChange={setKey} />
        </Ctrl>
        <Slider
          name={<>Frequency &nbsp;<em>ω</em></>}
          value={`${w < 10 ? w.toFixed(2) : w.toFixed(0)} rad/s`}
          min={0} max={1} step={0.001} v={frac}
          onChange={(v) => { clock.setPlaying(false); clock.setT(v * (LOOP - 2)) }}
        />
      </div>

      <div className="pz-row">
        <div className="pz-col">
          <div className="plot-wrap dark">
            <div className="plot-title">
              <span className="lbl">Pole-zero map &nbsp;·&nbsp; zooms out as ω grows</span>
              <span className="right">
                <span className="legend">
                  <span><i className="mk" style={{ color: D_ZERO }}>○</i><span className="t">zero</span></span>
                  <span><i className="mk" style={{ color: D_POLE }}>×</i><span className="t">pole</span></span>
                </span>
                <PlayToggle playing={clock.playing} setPlaying={clock.setPlaying} />
              </span>
            </div>
            <Canvas
              height={340}
              draw={(ctx, cw, h) => {
                // the view grows with ω so that jω stays at 60 % of the height
                const top = Math.max(w / 0.6, 5)
                const sc = (h - 44) / top
                const ox = cw * 0.72
                const oy = h - 32
                const X = (re: number) => ox + re * sc
                const Y = (im: number) => oy - im * sc
                const st = niceStep(top, 4)
                ctx.lineWidth = 1
                ctx.font = `10px ${MONO}`
                for (let g = Math.ceil(-ox / sc / st) * st; X(g) < cw; g += st) {
                  const px = Math.round(X(g)) + 0.5
                  ctx.strokeStyle = Math.abs(g) < 1e-9 ? DARK.axis : DARK.grid
                  ctx.beginPath()
                  ctx.moveTo(px, 0)
                  ctx.lineTo(px, h)
                  ctx.stroke()
                  if (Math.abs(g) > 1e-9) {
                    ctx.fillStyle = DARK.text
                    ctx.textAlign = 'center'
                    ctx.fillText(axisNum(g), px, oy + 26)
                  }
                }
                for (let g = 0; Y(g) > 0; g += st) {
                  const py = Math.round(Y(g)) + 0.5
                  ctx.strokeStyle = g === 0 ? DARK.axis : DARK.grid
                  ctx.beginPath()
                  ctx.moveTo(0, py)
                  ctx.lineTo(cw, py)
                  ctx.stroke()
                  if (g > 0) {
                    ctx.fillStyle = DARK.text
                    ctx.textAlign = 'left'
                    ctx.fillText(axisNum(g) + 'j', ox + 6, py - 4)
                  }
                }
                const px = ox
                const py = Y(w)
                sys.roots.forEach((q) => {
                  const c = q.kind === 'zero' ? D_ZERO : D_POLE
                  const x = X(q.r)
                  // angle of the arrow, measured from the positive real direction
                  ctx.strokeStyle = c
                  ctx.globalAlpha = 0.55
                  ctx.lineWidth = 1.5
                  ctx.beginPath()
                  ctx.arc(x, oy, 17, 0, -Math.atan2(w, -q.r), true)
                  ctx.stroke()
                  ctx.globalAlpha = 1
                  arrow(ctx, x, oy, px, py, c, 2, 8)
                })
                sys.roots.forEach((q) => {
                  const c = q.kind === 'zero' ? D_ZERO : D_POLE
                  const x = X(q.r)
                  ctx.strokeStyle = c
                  ctx.lineWidth = 2
                  ctx.beginPath()
                  if (q.kind === 'zero') {
                    ctx.fillStyle = 'oklch(0.255 0.026 248)'
                    ctx.arc(x, oy, 5, 0, 2 * Math.PI)
                    ctx.fill()
                  } else {
                    ctx.moveTo(x - 5, oy - 5)
                    ctx.lineTo(x + 5, oy + 5)
                    ctx.moveTo(x + 5, oy - 5)
                    ctx.lineTo(x - 5, oy + 5)
                  }
                  ctx.stroke()
                  ctx.font = `italic 500 12px ${SANS}`
                  ctx.fillStyle = c
                  ctx.textAlign = 'center'
                  ctx.fillText(q.name, x, oy + 14)
                })
                const halo = ctx.createRadialGradient(px, py, 0, px, py, 18)
                halo.addColorStop(0, 'rgba(233, 238, 241, 0.45)')
                halo.addColorStop(1, 'rgba(233, 238, 241, 0)')
                ctx.fillStyle = halo
                ctx.beginPath()
                ctx.arc(px, py, 18, 0, 2 * Math.PI)
                ctx.fill()
                dot(ctx, px, py, DARK.ink, 5)
                ctx.font = `italic 500 13px ${SANS}`
                ctx.fillStyle = DARK.strong
                ctx.textAlign = 'left'
                ctx.fillText('jω', px + 10, py + 4)
              }}
            />
            <div className="plot-foot">Each arc is the angle of its arrow. Far below a pole or zero the arrow barely moves. Far above, it points straight up: 90°, and its length is about ω.</div>
          </div>

          <div className="panel">
            <div className="fx" style={{ marginBottom: 14 }}><Formula k={key} /></div>
            <table className="pz-t">
              <thead>
                <tr><th>Arrow from</th><th>Length</th><th>Angle</th></tr>
              </thead>
              <tbody>
                {sys.roots.map((q) => (
                  <tr key={q.name} className={q.kind === 'zero' ? 'zr' : 'pl'}>
                    <td><i>{q.name}</i> = {nf(q.r)} <span className="soft">· {typeName(q)}</span></td>
                    <td className="num">{sig(len(q, w))}</td>
                    <td className="num">{nf(ang(q, w), 1)}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pz-calc">
              <span className="fx">
                |<i>G</i>| = <Frac n={join(zeros.map((q) => <span className="zr">{sig(len(q, w))}</span>), ' · ')} d={join(poles.map((q) => <span className="pl">{sig(len(q, w))}</span>), ' · ')} />
              </span>
              <span className="res">= <Sci v={gain} /> &nbsp;→&nbsp; {nf(db, 1)} dB</span>
              <span className="fx">
                ∠<i>G</i> = {join(zeros.map((q) => <span className="zr">{nf(ang(q, w), 1)}°</span>), ' + ')}
                {poles.map((q) => <span key={q.name} className="pl"> − {nf(ang(q, w), 1)}°</span>)}
              </span>
              <span className="res">= {nf(ph, 1)}°</span>
            </div>
          </div>
        </div>

        <div className="pz-col">
          <div className="plot-wrap">
            <div className="plot-title"><span className="lbl">Magnitude in dB &nbsp;·&nbsp; lengths of zeros ÷ lengths of poles</span></div>
            <Canvas
              height={150}
              draw={(ctx, cw, h) => {
                const f = frame(ctx, cw, h, { x: [W0, W1], y: [dbLo, dbHi], xLog: true, xTickFmt: pow10, yTicks: range(dbLo, dbHi, 20) })
                polyline(ctx, f, ws, dbs, { color: 'rgba(29, 35, 38, 0.2)', width: 1.5 })
                polyline(ctx, f, ws, dbs, { color: ACCENT, width: 2 }, 0, k)
                vline(ctx, f, w, MUTE)
                dot(ctx, f.sx(w), f.sy(db), ACCENT, 4.5)
              }}
            />
          </div>
          <div className="plot-wrap">
            <div className="plot-title"><span className="lbl">Phase in degrees &nbsp;·&nbsp; angles of zeros − angles of poles</span></div>
            <Canvas
              height={150}
              draw={(ctx, cw, h) => {
                const f = frame(ctx, cw, h, { x: [W0, W1], y: [phLo, phHi], xLog: true, xTickFmt: pow10, yTicks: range(phLo, phHi, 90) })
                polyline(ctx, f, ws, phs, { color: 'rgba(29, 35, 38, 0.2)', width: 1.5 })
                polyline(ctx, f, ws, phs, { color: ACCENT, width: 2 }, 0, k)
                vline(ctx, f, w, MUTE)
                dot(ctx, f.sx(w), f.sy(ph), ACCENT, 4.5)
              }}
            />
          </div>
          <div className="plot-wrap">
            <div className="plot-title"><span className="lbl">Polar plot &nbsp;·&nbsp; <span className="math"><i>G</i>(<i>j</i>ω)</span> as one arrow</span></div>
            <Canvas
              height={230}
              draw={(ctx, cw, h) => {
                const xs = polar.map((p) => p[0])
                const ys = polar.map((p) => p[1])
                const x0 = Math.min(0, ...xs), x1 = Math.max(0, ...xs), y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys)
                const pad = 26
                const sc = Math.min((cw - 2 * pad) / (x1 - x0), (h - 2 * pad) / (y1 - y0))
                const X = (v: number) => cw / 2 + (v - (x0 + x1) / 2) * sc
                const Y = (v: number) => h / 2 - (v - (y0 + y1) / 2) * sc
                const st = niceStep(Math.max(x1 - x0, y1 - y0), 2.5)
                ctx.lineWidth = 1
                ctx.font = `10px ${MONO}`
                for (let g = Math.ceil((x0 - (cw / 2) / sc) / st) * st; X(g) < cw; g += st) {
                  const px = Math.round(X(g)) + 0.5
                  if (px < 0) continue
                  ctx.strokeStyle = Math.abs(g) < st / 2 ? ZERO : GRID
                  ctx.beginPath()
                  ctx.moveTo(px, 0)
                  ctx.lineTo(px, h)
                  ctx.stroke()
                  if (Math.abs(g) >= st / 2) {
                    ctx.fillStyle = MUTE
                    ctx.textAlign = 'center'
                    ctx.fillText(axisNum(g), px, Math.min(h - 4, Y(0) + 13))
                  }
                }
                for (let g = Math.ceil((y0 - (h / 2) / sc) / st) * st; Y(g) > 0; g += st) {
                  const py = Math.round(Y(g)) + 0.5
                  if (py > h) continue
                  ctx.strokeStyle = Math.abs(g) < st / 2 ? ZERO : GRID
                  ctx.beginPath()
                  ctx.moveTo(0, py)
                  ctx.lineTo(cw, py)
                  ctx.stroke()
                }
                ctx.font = `500 11px ${SANS}`
                ctx.fillStyle = INK_SOFT
                ctx.textAlign = 'right'
                ctx.fillText('Re', cw - 6, Y(0) - 6)
                ctx.textAlign = 'left'
                ctx.fillText('Im', X(0) + 6, 13)
                const path = (to: number, color: string, width: number) => {
                  ctx.strokeStyle = color
                  ctx.lineWidth = width
                  ctx.lineJoin = 'round'
                  ctx.beginPath()
                  for (let i = 0; i <= to; i++) {
                    if (i) ctx.lineTo(X(xs[i]), Y(ys[i]))
                    else ctx.moveTo(X(xs[i]), Y(ys[i]))
                  }
                  ctx.stroke()
                }
                path(500, LINE, 1.5)
                path(Math.round((Math.log10(w / 1e-3) / 9) * 500), ACCENT, 2)
                arrow(ctx, X(0), Y(0), X(gNow[0]), Y(gNow[1]), ACCENT, 1.6, 7)
                dot(ctx, X(gNow[0]), Y(gNow[1]), ACCENT, 4.5)
              }}
            />
            <div className="plot-foot">The same two numbers drawn as one arrow: length |<i>G</i>|, angle ∠<i>G</i>.</div>
          </div>
        </div>
      </div>

      <div className="callout">
        {rhpZero ? (
          <>
            <b>Why a right-half-plane zero lowers the phase.</b> The zero <i>{rhpZero.name}</i> = {nf(rhpZero.r)} sits right of the axis, so at ω = 0 its arrow points to the left: 180°. As ω grows the arrow swings <b>down</b> to 90°, where a zero in the left half-plane would swing up from 0° to 90°. Its length grows the same way in both cases, so the magnitude rule stays +20 dB/dec.
          </>
        ) : (
          <>Each arrow turns from 0° to 90° as ω passes its pole or zero, and gets longer from then on.</>
        )}
      </div>
    </>
  )
}
