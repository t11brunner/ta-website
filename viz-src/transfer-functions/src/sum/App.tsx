// Any input is a sum of pieces U·e^{st}: every piece is an arrow in the complex
// plane, the arrows are added tip to tail, and the tip of the chain is u(t).
import { useState } from 'react'
import { Canvas } from '../shared/Canvas'
import { cabs, cexp, cmul, cscale, cx, type C } from '../shared/math'
import { ACCENT, GRID, INK, INK_SOFT, MONO, MUTE, SANS, ZERO, arrow, dot, fmt, frame, grid, polyline, vline } from '../shared/plot'
import { Frac } from '../shared/tex'
import { Ctrl, Pills, PlayToggle, Scrub, Slider, useLoop } from '../shared/ui'
import { E } from '../est/fx'
import { AMBER, DARK, label as sLabel, sGrid, sMap, type Range } from '../est/splane'

const T = 10
const N = 800
const TS = grid(0, T, N)

/** One piece U·e^{st}. */
interface Term {
  s: C
  U: C
}

type Key = 'cos' | 'sin' | 'step' | 'decay' | 'damped' | 'square'

const PRESETS: { key: Key; label: string }[] = [
  { key: 'cos', label: 'Cosine' },
  { key: 'sin', label: 'Sine' },
  { key: 'step', label: 'Step' },
  { key: 'decay', label: 'Decay' },
  { key: 'damped', label: 'Damped cosine' },
  { key: 'square', label: 'Square wave' },
]

/** The pieces of each input; a square wave uses the first n pairs of its Fourier series. */
function termsOf(key: Key, n: number): Term[] {
  switch (key) {
    case 'cos':
      return [
        { s: cx(0, 2), U: cx(0.5) },
        { s: cx(0, -2), U: cx(0.5) },
      ]
    case 'sin':
      return [
        { s: cx(0, 2), U: cx(0, -0.5) },
        { s: cx(0, -2), U: cx(0, 0.5) },
      ]
    case 'step':
      return [{ s: cx(0), U: cx(1) }]
    case 'decay':
      return [{ s: cx(-1), U: cx(1) }]
    case 'damped':
      return [
        { s: cx(-0.4, 3), U: cx(0.5) },
        { s: cx(-0.4, -3), U: cx(0.5) },
      ]
    case 'square': {
      const out: Term[] = []
      for (let i = 0; i < n; i++) {
        const k = 2 * i + 1
        const a = 2 / (Math.PI * k)
        out.push({ s: cx(0, k), U: cx(0, -a) }, { s: cx(0, -k), U: cx(0, a) })
      }
      return out
    }
  }
}

/** The arrow U·e^{st} at time t. */
const piece = (q: Term, t: number) => cmul(q.U, cexp(cscale(q.s, t)))

/** Colour of a piece: accent turns left (ω > 0), amber turns right, ink does not turn. */
const hue = (q: Term, dark: boolean) =>
  q.s.im > 0 ? (dark ? DARK.accent : ACCENT) : q.s.im < 0 ? (dark ? DARK.amber : AMBER) : dark ? DARK.ink : INK

const J = () => <i>j</i>
const Tt = () => <i>t</i>
const Half = () => <Frac n="1" d="2" />

function formula(key: Key) {
  switch (key) {
    case 'cos':
      return (
        <>
          <i>u</i>(<Tt />) = <span className="acc"><Half /> <E x={<>2<J /><Tt /></>} /></span> + <span className="amb-t"><Half /> <E x={<>−2<J /><Tt /></>} /></span> = cos(2<Tt />)
        </>
      )
    case 'sin':
      return (
        <>
          <i>u</i>(<Tt />) = <span className="acc"><Frac n="1" d={<>2<J /></>} /> <E x={<>2<J /><Tt /></>} /></span> − <span className="amb-t"><Frac n="1" d={<>2<J /></>} /> <E x={<>−2<J /><Tt /></>} /></span> = sin(2<Tt />)
        </>
      )
    case 'step':
      return (
        <>
          <i>u</i>(<Tt />) = 1 · <E x={<>0<Tt /></>} /> = 1
        </>
      )
    case 'decay':
      return (
        <>
          <i>u</i>(<Tt />) = 1 · <E x={<>−<Tt /></>} />
        </>
      )
    case 'damped':
      return (
        <>
          <i>u</i>(<Tt />) = <span className="acc"><Half /> <E x={<>(−0.4 + 3<J />)<Tt /></>} /></span> + <span className="amb-t"><Half /> <E x={<>(−0.4 − 3<J />)<Tt /></>} /></span> = <E x={<>−0.4<Tt /></>} /> cos(3<Tt />)
        </>
      )
    case 'square':
      return (
        <>
          <i>u</i>(<Tt />) = Σ<sub><i>k</i> = ±1, ±3, …</sub> <Frac n="2" d={<><J />π<i>k</i></>} /> <E x={<><J /><i>k</i><Tt /></>} />
        </>
      )
  }
}

function story(key: Key, n: number) {
  switch (key) {
    case 'cos':
      return <><b>Two pieces.</b> The arrows have length ½ and turn in opposite directions at 2 rad/s. Their imaginary parts always cancel, so the tip of the chain slides back and forth on the real axis: that is cos(2<Tt />).</>
    case 'sin':
      return <><b>Same <i>s</i>, different <i>U</i>.</b> The two points in the s-plane are the same as for the cosine. Only the weights <i>U</i> changed: they turn each arrow by a quarter turn at <Tt /> = 0, so the sum starts at 0 instead of 1.</>
    case 'step':
      return <><b>One piece at <i>s</i> = 0.</b> The arrow neither turns nor shrinks, so the input stays at 1 for all <Tt /> ≥ 0.</>
    case 'decay':
      return <><b>One piece on the real axis.</b> A real <i>s</i> does not turn the arrow. With <i>s</i> = −1 it shrinks to <E x="−1" /> ≈ 0.37 of its length every second.</>
    case 'damped':
      return <><b>Two pieces in the left half-plane.</b> The imaginary part ±3 turns the arrows, the real part −0.4 shrinks them. They spiral into the origin, and the sum is a cosine that dies out.</>
    case 'square':
      return <><b>{2 * n} of infinitely many pieces.</b> A square wave needs a pair of arrows for every odd multiple of its frequency, each pair shorter and faster than the one before. Add pairs with the slider: the sum gets closer to the dashed square wave.</>
  }
}

const num = (v: number) => String(+v.toFixed(2)).replace('-', '−')
function sName(s: C) {
  if (s.im === 0) return num(s.re)
  const w = Math.abs(s.im)
  const im = `${s.im < 0 ? '−' : s.re === 0 ? '' : '+'}${s.re === 0 ? '' : ' '}${w === 1 ? '' : num(w)}j`
  return s.re === 0 ? im : `${num(s.re)} ${im}`
}

export default function App() {
  const [key, setKey] = useState<Key>('cos')
  const [pairs, setPairs] = useState(3)
  const clock = useLoop(T, 1)
  const t = clock.t

  const terms = termsOf(key, pairs)
  const u = TS.map((tt) => terms.reduce((a, q) => a + piece(q, tt).re, 0))
  const now = terms.reduce((a, q) => a + piece(q, t).re, 0)
  const k = Math.round((t / T) * N)
  const square = key === 'square'
  const plane: Range = square ? { re: [-3, 1.5], im: [-10, 10] } : { re: [-3, 1.5], im: [-5, 5] }
  const R = square ? 1.45 : 1.25
  const target = square ? TS.map((tt) => (Math.sin(tt) >= 0 ? 1 : -1)) : null

  return (
    <>
      <p className="intro">
        Every input we care about can be written as a sum of pieces <b><i>U</i><E x={<i>st</i>} /></b>: a complex weight <i>U</i> times an exponential with a complex <i>s</i>. Each piece is an <b>arrow</b> in the complex plane. Put the arrows tip to tail and the end of the chain is <i>u</i>(<Tt />).
      </p>

      <div className="ctrls-row">
        <Ctrl name="Input">
          <Pills small items={PRESETS} value={key} onChange={setKey} />
        </Ctrl>
        {square && <Slider name="Pairs of pieces" value={pairs} min={1} max={5} step={1} v={pairs} onChange={setPairs} />}
        <Scrub t={t} T={T} setT={clock.setT} setPlaying={clock.setPlaying} />
      </div>

      <div className="panel sum-fx">
        <span className="fx">{formula(key)}</span>
        {square && <span className="note">shown with {2 * pairs} pieces</span>}
      </div>

      <div className="sum-row">
        <div className="plot-wrap dark">
          <div className="plot-title">
            <span className="lbl">Where the <i>s</i> sit</span>
          </div>
          <Canvas
            height={300}
            draw={(ctx, w, h) => {
              const f = sMap(w, h, plane)
              sGrid(ctx, f, plane)
              terms.forEach((q) => {
                const x = f.sx(q.s.re)
                const y = f.sy(q.s.im)
                ctx.fillStyle = hue(q, true)
                ctx.beginPath()
                ctx.arc(x, y, Math.min(8, 3 + 6 * cabs(q.U)), 0, 2 * Math.PI)
                ctx.fill()
                if (terms.length <= 2) {
                  ctx.font = `11px ${MONO}`
                  ctx.fillStyle = DARK.strong
                  ctx.textAlign = 'right'
                  ctx.fillText(sName(q.s), x - 12, y + 4)
                }
              })
              if (square) sLabel(ctx, 'smaller dot = shorter arrow', f.l + 6, f.b - 8, DARK.text, 'left', 11)
            }}
          />
          <div className="plot-foot">One dot per piece. Its height is how fast the arrow turns, its distance left of the axis how fast it shrinks.</div>
        </div>

        <div className="plot-wrap">
          <div className="plot-title">
            <span className="lbl">The arrows <span className="math"><i>U</i><E x={<i>st</i>} /></span></span>
            <PlayToggle playing={clock.playing} setPlaying={clock.setPlaying} />
          </div>
          <Canvas
            height={300}
            draw={(ctx, w, h) => {
              const M = { l: 12, r: 12, t: 10, b: 10 }
              const sc = Math.min(w - M.l - M.r, h - M.t - M.b) / (2 * R)
              const X = (re: number) => w / 2 + re * sc
              const Y = (im: number) => h / 2 - im * sc
              const xr = (w / 2 - M.l) / sc
              const yr = (h / 2 - M.t) / sc
              ctx.lineWidth = 1
              for (let g = -Math.floor(xr * 2) / 2; g <= xr; g += 0.5) {
                const px = Math.round(X(g)) + 0.5
                ctx.strokeStyle = g === 0 ? ZERO : GRID
                ctx.beginPath()
                ctx.moveTo(px, M.t)
                ctx.lineTo(px, h - M.b)
                ctx.stroke()
              }
              for (let g = -Math.floor(yr * 2) / 2; g <= yr; g += 0.5) {
                const py = Math.round(Y(g)) + 0.5
                ctx.strokeStyle = g === 0 ? ZERO : GRID
                ctx.beginPath()
                ctx.moveTo(M.l, py)
                ctx.lineTo(w - M.r, py)
                ctx.stroke()
              }
              ctx.font = `10px ${MONO}`
              ctx.fillStyle = MUTE
              ctx.textAlign = 'center'
              ctx.fillText('1', X(1), Y(0) + 14)
              ctx.fillText('−1', X(-1), Y(0) + 14)
              ctx.font = `500 11px ${SANS}`
              ctx.fillStyle = INK_SOFT
              ctx.textAlign = 'right'
              ctx.fillText('Re', w - M.r - 4, Y(0) - 6)
              ctx.textAlign = 'left'
              ctx.fillText('Im', X(0) + 6, M.t + 11)

              // the sum on the real axis, under the arrows
              ctx.strokeStyle = 'rgba(29, 35, 38, 0.16)'
              ctx.lineWidth = 7
              ctx.lineCap = 'round'
              ctx.beginPath()
              ctx.moveTo(X(0), Y(0))
              ctx.lineTo(X(now), Y(0))
              ctx.stroke()
              ctx.lineCap = 'butt'

              let p = cx(0)
              let side = 0 // which side of the real axis the chain is on
              terms.forEach((q) => {
                const z = piece(q, t)
                const e = cx(p.re + z.re, p.im + z.im)
                arrow(ctx, X(p.re), Y(p.im), X(e.re), Y(e.im), hue(q, false), 2.2, 8)
                side += p.im + e.im
                p = e
              })
              dot(ctx, X(now), Y(0), INK, 4.5)
              ctx.font = `italic 500 12px ${SANS}`
              ctx.fillStyle = INK
              ctx.textAlign = 'center'
              ctx.fillText('u(t)', X(now), Y(0) + (side < 0 ? -14 : 24))
            }}
          />
          <div className="plot-foot">
            At <Tt /> = {fmt(t, 1)} s the chain ends at <b>{fmt(now, 2)}</b> on the real axis.
          </div>
        </div>

        <div className="plot-wrap">
          <div className="plot-title">
            <span className="lbl">The input over time</span>
            <span className="legend">
              <span><i className="sw" /><span className="t"><i>u</i>(<Tt />)</span></span>
              {square && <span><i className="sw ghost" /><span className="t">square wave</span></span>}
            </span>
          </div>
          <Canvas
            height={300}
            draw={(ctx, w, h) => {
              const f = frame(ctx, w, h, { x: [0, T], y: [-R, R], xUnit: 's' })
              if (target) polyline(ctx, f, TS, target, { color: MUTE, width: 1.2, dash: [4, 4] })
              polyline(ctx, f, TS, u, { color: 'rgba(29, 35, 38, 0.22)', width: 1.5 })
              polyline(ctx, f, TS, u, { color: INK, width: 2 }, 0, k)
              vline(ctx, f, t, MUTE)
              dot(ctx, f.sx(t), f.sy(now), INK, 4.5)
            }}
          />
          <div className="plot-foot">The dot is the end of the arrow chain, plotted against time.</div>
        </div>
      </div>

      <div className="callout">{story(key, pairs)}</div>

      <div className="notes" style={{ marginTop: 22 }}>
        <p>
          <b>Why this matters:</b> an LTI system answers every piece <E x={<i>st</i>} /> with the same piece, multiplied by one complex number <i>G</i>(<i>s</i>). Once the input is split into such pieces, the output is the same sum with every arrow scaled and turned by <i>G</i>(<i>s</i>).
        </p>
      </div>
    </>
  )
}
