// Section 1: every point s of the plane is one signal e^{st}.
import { Canvas } from '../shared/Canvas'
import { cx, type C } from '../shared/math'
import { INK, MUTE, SANS, fmt, frame, grid, polyline, tag } from '../shared/plot'
import { Cnum, nf } from '../shared/tex'
import { Ctrl, Pills, Slider } from '../shared/ui'
import { E, Est, Sbar } from './fx'
import { DARK, dragTo, sGrid, sMap, sPoint, type Range, type SFrame } from './splane'

const T = 8
const N = 600
const TS = grid(0, T, N)
/** Visible part of the s-plane in sections 1 and 2, and where s may be dragged. */
export const PLANE: Range = { re: [-3, 1.5], im: [-5, 5] }
export const BOX: Range = { re: [-2.6, 1], im: [-4.6, 4.6] }
/** Growing signals are cut off at this height in the time plot. */
const CAP = 6

type PresetKey = 'const' | 'decay' | 'grow' | 'osc' | 'damped'
const PRESETS: { key: PresetKey; label: string; s: C }[] = [
  { key: 'const', label: 'Constant', s: cx(0) },
  { key: 'decay', label: 'Decay', s: cx(-1) },
  { key: 'grow', label: 'Growth', s: cx(0.4) },
  { key: 'osc', label: 'Oscillation', s: cx(0, 2) },
  { key: 'damped', label: 'Damped oscillation', s: cx(-0.4, 3) },
]

/** Faint sketches of Re e^{st} at a grid of points: the plane as a map of shapes. */
function drawMap(ctx: CanvasRenderingContext2D, f: SFrame) {
  const gw = 34
  const gh = 14
  const n = 48
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1
  for (const sg of [-2, -1, 0, 1])
    for (const w of [-4, -2, 0, 2, 4]) {
      const vals: number[] = []
      let m = 0
      for (let i = 0; i <= n; i++) {
        const tau = (4 * i) / n
        const v = Math.exp(sg * tau) * Math.cos(w * tau)
        vals.push(v)
        m = Math.max(m, Math.abs(v))
      }
      const x0 = f.sx(sg) - gw / 2
      const y0 = f.sy(w)
      ctx.beginPath()
      vals.forEach((v, i) => {
        const x = x0 + (gw * i) / n
        const y = y0 - ((v / m) * gh) / 2
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      })
      ctx.stroke()
    }
}

/** The s-plane with the draggable point s, shared with section 2. */
export function drawPlane(ctx: CanvasRenderingContext2D, w: number, h: number, under?: (f: SFrame) => void) {
  const f = sMap(w, h, PLANE)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)'
  ctx.fillRect(f.sx(0), f.t, f.r - f.sx(0), f.b - f.t)
  under?.(f)
  sGrid(ctx, f, PLANE)
  return f
}

function describe(s: C) {
  const sg = s.re
  const w = Math.abs(s.im)
  const shrink = <>to <E x={nf(sg)} /> ≈ {nf(Math.exp(sg))} of its size every second</>
  const turn = <>oscillates with period {nf((2 * Math.PI) / w)} s (ω = {nf(w)} rad/s)</>
  if (sg === 0 && w === 0)
    return <><b>s = 0:</b> <E x={<>0<i>t</i></>} /> = 1, a constant. A step is made of exactly this one piece.</>
  if (w === 0)
    return <><b>s = {nf(sg)} is real:</b> no oscillation at all. The piece {sg < 0 ? <>shrinks {shrink}</> : <>grows by a factor <E x={nf(sg)} /> ≈ {nf(Math.exp(sg))} every second</>}.</>
  if (sg === 0)
    return <><b>s sits on the jω axis:</b> the piece keeps its size and {turn}. Together with its mirror this is a pure cosine. All pure sinusoids live on this axis.</>
  return (
    <>
      <b>s = <Cnum z={s} />:</b> the piece {turn} and {sg < 0 ? <>shrinks {shrink}</> : <>grows by a factor <E x={nf(sg)} /> ≈ {nf(Math.exp(sg))} every second</>}. {sg < 0 ? 'Left half-plane: a damped oscillation.' : 'Right half-plane: an oscillation that blows up.'}
    </>
  )
}

export default function SectionPoint(props: { s: C; setS: (s: C) => void }) {
  const { s, setS } = props
  const preset = PRESETS.find((p) => p.s.re === s.re && p.s.im === s.im)?.key ?? null
  const growth = Math.exp(s.re * T)

  const sig = TS.map((tt) => Math.exp(s.re * tt) * Math.cos(s.im * tt))
  const env = TS.map((tt) => Math.exp(s.re * tt))

  return (
    <>
      <h2 className="sec-h"><span className="n">1</span>Every point <i>s</i> is a signal</h2>
      <p className="sec-sub">
        The building block is <Est /> with a complex number <i>s</i> = σ + jω. Drag <i>s</i> around: σ decides whether the piece decays (left half) or grows (right half), ω how fast it turns. A real signal always uses <i>s</i> together with its mirror <Sbar />: their imaginary parts cancel and leave <E x={<>σ<i>t</i></>} />cos(ω<i>t</i>).
      </p>

      <div className="ctrls-row">
        <Ctrl name="Try">
          <Pills small items={PRESETS.map((p) => ({ key: p.key, label: p.label }))} value={preset} onChange={(k) => setS(PRESETS.find((p) => p.key === k)!.s)} />
        </Ctrl>
        <Slider name={<>Decay rate &nbsp;<em>σ</em></>} value={fmt(s.re, 2)} min={BOX.re[0]} max={BOX.re[1]} step={0.01} v={s.re} onChange={(v) => setS(cx(v, s.im))} />
        <Slider name={<>Turning rate &nbsp;<em>ω</em></>} value={`${fmt(s.im, 2)} rad/s`} min={BOX.im[0]} max={BOX.im[1]} step={0.01} v={s.im} onChange={(v) => setS(cx(s.re, v))} />
      </div>

      <div className="est-row">
        <div className="plot-wrap dark">
          <div className="plot-title">
            <span className="lbl">The s-plane</span>
            <span className="legend">
              <span><i className="mk dot" /><span className="t"><i>s</i></span></span>
              <span>sketches: the signal at that spot</span>
            </span>
          </div>
          <Canvas
            height={300}
            cursor="crosshair"
            draw={(ctx, w, h) => {
              const f = drawPlane(ctx, w, h, (f) => drawMap(ctx, f))
              ctx.font = `500 11px ${SANS}`
              ctx.fillStyle = DARK.text
              ctx.textAlign = 'right'
              ctx.fillText('← decays', f.sx(0) - 8, f.b - 8)
              ctx.textAlign = 'left'
              ctx.fillText('grows →', f.sx(0) + 8, f.b - 8)
              sPoint(ctx, f, s)
            }}
            onPointer={(x, y, w, h) => setS(dragTo(sMap(w, h, PLANE), x, y, BOX))}
          />
          <div className="plot-foot">Left of the jω axis every piece dies out, right of it every piece blows up. Further up or down, it turns faster.</div>
        </div>

        <div className="plot-wrap">
          <div className="plot-title">
            <span className="lbl">Over time &nbsp;·&nbsp; <span className="math"><E x={<>σ<i>t</i></>} />cos(ω<i>t</i>)</span></span>
            <span className="legend">
              <span><i className="sw" /><span className="t">signal</span></span>
              <span><i className="sw ghost" /><span className="t">± <E x={<>σ<i>t</i></>} /></span></span>
            </span>
          </div>
          <Canvas
            height={300}
            draw={(ctx, w, h) => {
              const top = Math.min(Math.max(1, growth), CAP) * 1.1
              const f = frame(ctx, w, h, { x: [0, T], y: [-top, top], xUnit: 's' })
              polyline(ctx, f, TS, env, { color: MUTE, width: 1.2, dash: [4, 4] })
              polyline(ctx, f, TS, env.map((v) => -v), { color: MUTE, width: 1.2, dash: [4, 4] })
              polyline(ctx, f, TS, sig, { color: INK, width: 2 })
              if (growth > CAP) tag(ctx, f.r - 62, f.t + 14, 'keeps growing ↑', INK, 'rgba(29, 35, 38, 0.07)')
            }}
          />
          <div className="plot-foot">The real signal belonging to <i>s</i>: it oscillates at ω inside the envelope ± <E x={<>σ<i>t</i></>} />.</div>
        </div>
      </div>

      <div className="callout">{describe(s)}</div>
    </>
  )
}
