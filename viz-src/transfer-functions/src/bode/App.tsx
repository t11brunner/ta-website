// Sketching a Bode plot the way the handout does it: find the start, sort the
// poles and zeros, then walk along ω and bend the line at each of them.
// Below the plot every pole and zero has its own piece; the sketch is their sum.
import { useState } from 'react'
import { Canvas } from '../shared/Canvas'
import { ACCENT, GRID, INK, INK_SOFT, MONO, MUTE, SANS, WARN, dot, frame, polyline, vline, type Frame } from '../shared/plot'
import { Frac, nf } from '../shared/tex'
import { Ctrl, Pills, PlayToggle, Slider, useLoop } from '../shared/ui'
import { AMBER } from '../est/splane'
import {
  EXAMPLES, W0, W1, baseMag, exactMag, exactPh, freqs, magSign, phSign, pieceMag, piecePh, sketchMag, sketchPh, startDb, startPh, typeName,
  type Ex, type ExKey, type Root,
} from './model'

const GREEN = 'oklch(0.52 0.11 160)'
const WALK = 10 // seconds the pen needs for the whole axis
const HOLD = 4 // seconds it rests at the end, with the exact curve shown
const M = { l: 86, r: 14 }
const SUP = '⁰¹²³⁴'
/** 10 to a small integer power, as the handout labels the ω axis. */
const pow10 = (v: number) => {
  const e = Math.round(Math.log10(v))
  return '10' + (e < 0 ? '⁻' : '') + SUP[Math.abs(e)]
}
const LANE = 46

type Step = '1' | '2' | '3'
type Mode = 'mag' | 'ph'

const col = (q: Root) => (q.kind === 'zero' ? GREEN : WARN)
const signed = (v: number, unit: string) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)}${unit}`
const S = () => <i>s</i>
const Z = (p: { children: React.ReactNode }) => <span className="zr">{p.children}</span>
const P = (p: { children: React.ReactNode }) => <span className="pl">{p.children}</span>

function Formula({ k }: { k: ExKey }) {
  if (k === 'handout')
    return (
      <>
        <i>G</i>(<S />) = <Frac n={<><Z>(<S /> + 1)</Z><Z>(<S /> − 100)</Z></>} d={<><P>(<S /> + 10)</P><P>(<S /> + 30)</P><P>(<S /> − 1000)</P></>} />
      </>
    )
  if (k === 'int')
    return (
      <>
        <i>G</i>(<S />) = <Frac n={<>100 <Z>(<S /> + 1)</Z></>} d={<><P><S /></P> <P>(<S /> + 100)</P></>} />
      </>
    )
  return (
    <>
      <i>G</i>(<S />) = <Frac n={<>10 <Z><S /></Z></>} d={<><P>(<S /> + 10)</P><P>(<S /> + 100)</P></>} />
    </>
  )
}

/** Step 1, written out per example: where the plot starts and how steep. */
function Start({ ex }: { ex: Ex }) {
  const db = nf(startDb(ex), 0)
  if (ex.key === 'handout')
    return (
      <>
        <b>1 · Find the start.</b> Nothing sits at <S /> = 0, so the plot starts flat at the Bode gain <i>G</i>(0).
        <span className="fx"><i>G</i>(0) = <Frac n="1 · (−100)" d="10 · 30 · (−1000)" /> = 3.3 · 10<sup>−4</sup></span>
        <span className="fx">→ in dB: 20 log<sub>10</sub>(…) = <b>{db} dB</b></span>
        <i>G</i>(0) is positive, so the phase starts at <b>0°</b>.
      </>
    )
  if (ex.key === 'int')
    return (
      <>
        <b>1 · Find the start.</b> <i>G</i>(0) = ∞: there is a <P>pole at <S /> = 0</P>, an integrator. It has been bending the plot since ω = 0, so the plot <b>starts</b> with slope −20 dB/dec and phase −90°. For the height, plug in the frequency at the left edge, ω<sub>0</sub> = 0.1, and drop <i>j</i>ω next to the larger numbers:
        <span className="fx">|<i>G</i>(<i>j</i> 0.1)| ≈ <Frac n="100 · 1" d="0.1 · 100" /> = 10</span>
        <span className="fx">→ in dB: 20 log<sub>10</sub>(…) = <b>{db} dB</b></span>
      </>
    )
  return (
    <>
      <b>1 · Find the start.</b> <i>G</i>(0) = 0, which is −∞ dB: there is a <Z>zero at <S /> = 0</Z>, a differentiator. The plot <b>starts</b> with slope +20 dB/dec and phase +90°. For the height, plug in the frequency at the left edge, ω<sub>0</sub> = 0.1, and drop <i>j</i>ω next to the larger numbers:
      <span className="fx">|<i>G</i>(<i>j</i> 0.1)| ≈ <Frac n="10 · 0.1" d="10 · 100" /> = 10<sup>−3</sup></span>
        <span className="fx">→ in dB: 20 log<sub>10</sub>(…) = <b>{db} dB</b></span>
    </>
  )
}

function Sorted({ ex }: { ex: Ex }) {
  return (
    <>
      <b>2 · Sort poles and zeros</b> by absolute value, smallest first. That is the order in which we meet them on the ω axis.
      <span className="fx">
        {ex.roots.map((q, i) => (
          <span key={q.name}>
            {i > 0 && ' < '}
            <span className={q.kind === 'zero' ? 'zr' : 'pl'}>|{q.name}| = {nf(Math.abs(q.r))}</span>
          </span>
        ))}
      </span>
      {ex.n0 !== 0 && <>The {ex.n0 < 0 ? 'pole' : 'zero'} at <S /> = 0 is not in the list: it is already in the start.</>}
    </>
  )
}

function Walk({ ex, mode, last, done }: { ex: Ex; mode: Mode; last: Root | null; done: boolean }) {
  const head = <b>3 · Walk along ω and apply the rules.</b>
  if (done)
    return (
      <>
        {head} Done. The blue curve is the exact Bode plot: the sketch is closest far away from the poles and zeros and worst right at them{mode === 'mag' ? ', where it is off by about 3 dB' : ''}.
      </>
    )
  if (!last)
    return (
      <>
        {head} Nothing met yet: the sketch keeps its starting {mode === 'mag' ? `slope of ${signed(20 * ex.n0, ' dB/dec')}` : `phase of ${signed(startPh(ex), '°')}`}.
      </>
    )
  const a = nf(Math.abs(last.r))
  const what = <span className={last.kind === 'zero' ? 'zr' : 'pl'}>{last.name}, a {typeName(last)} at ω = {a}</span>
  return mode === 'mag' ? (
    <>
      {head} Met {what}: the slope changes by <b>{signed(20 * magSign(last), ' dB/dec')}</b> from here on.
    </>
  ) : (
    <>
      {head} Near {what}: the phase turns by <b>{signed(90 * phSign(last), '°')}</b>, spread from ω = {nf(Math.abs(last.r) / 10)} to {nf(Math.abs(last.r) * 10)}. Half of it is done exactly at ω = {a}.
    </>
  )
}

function Rules({ last }: { last: Root | null }) {
  const cell = (kind: Root['kind'], stable: boolean, text: string) => {
    const on = !!last && last.kind === kind && last.r < 0 === stable
    return <td className={(on ? 'on ' : '') + (kind === 'zero' ? 'zr' : 'pl')}>{text}</td>
  }
  return (
    <table className="rule">
      <tbody>
        <tr><th></th><th>−20 dB/dec</th><th>+20 dB/dec</th></tr>
        <tr><th>−90°</th>{cell('pole', true, 'stable pole')}{cell('zero', false, 'non-minimum phase zero')}</tr>
        <tr><th>+90°</th>{cell('pole', false, 'unstable pole')}{cell('zero', true, 'minimum phase zero')}</tr>
      </tbody>
    </table>
  )
}

export default function App() {
  const [key, setKey] = useState<ExKey>('handout')
  const [step, setStep] = useState<Step>('1')
  const [mode, setMode] = useState<Mode>('mag')
  const clock = useLoop(WALK + HOLD, 1)

  const ex = EXAMPLES.find((e) => e.key === key)!
  const frac = step === '3' ? Math.min(1, clock.t / WALK) : 0
  const pen = W0 * (W1 / W0) ** frac
  const done = step === '3' && frac >= 1
  const restart = () => {
    clock.setT(0)
    clock.setPlaying(true)
  }

  const mag = mode === 'mag'
  const sketch = mag ? sketchMag : sketchPh
  const exact = mag ? exactMag : exactPh
  // a root counts as met once it starts to act: at |r| for the magnitude, a decade earlier for the phase
  const reach = (q: Root) => (mag ? Math.abs(q.r) : Math.abs(q.r) / 10)
  const met = (q: Root) => step === '3' && pen >= reach(q)
  const last = [...ex.roots].reverse().find(met) ?? null

  const all = freqs(ex)
  const lo = Math.min(...all.map((w) => Math.min(sketch(ex, w), exact(ex, w))))
  const hi = Math.max(...all.map((w) => Math.max(sketch(ex, w), exact(ex, w))))
  const tick = mag ? 20 : 45
  const y0 = Math.floor((lo - tick / 4) / tick) * tick
  const y1 = Math.ceil((hi + tick / 4) / tick) * tick
  const yTicks: number[] = []
  for (let v = y0; v <= y1; v += tick) yTicks.push(v)

  const now = mag ? 20 * ex.n0 + ex.roots.filter(met).reduce((a, q) => a + 20 * magSign(q), 0) : sketchPh(ex, pen)
  const opts = { x: [W0, W1] as [number, number], y: [y0, y1] as [number, number], xLog: true, yTicks, xTickFmt: pow10, margin: M }
  const lanes: (Root | null)[] = [null, ...ex.roots]

  const marks = (ctx: CanvasRenderingContext2D, f: Frame) => {
    if (step === '1') return
    ex.roots.forEach((q) => {
      const x = Math.round(f.sx(Math.abs(q.r))) + 0.5
      ctx.globalAlpha = met(q) || step === '2' ? 1 : 0.45
      ctx.strokeStyle = col(q)
      ctx.setLineDash([2, 3])
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, f.t)
      ctx.lineTo(x, f.b)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(x, f.b - 7)
      ctx.lineTo(x, f.b + 5)
      ctx.stroke()
      ctx.font = `italic 500 12px ${SANS}`
      ctx.fillStyle = col(q)
      ctx.textAlign = 'center'
      ctx.fillText(q.name, x, f.t + 13)
      ctx.globalAlpha = 1
    })
  }

  return (
    <>
      <p className="intro">
        A Bode plot can be sketched by hand in three steps: find where it <b>starts</b>, <b>sort</b> the poles and zeros, then <b>walk</b> along ω and bend the line at each one. Underneath, every pole and zero has its own simple piece, and the sketch is just these pieces added up.
      </p>

      <div className="ctrls-row">
        <Ctrl name="System">
          <Pills small items={EXAMPLES.map((e) => ({ key: e.key, label: e.label }))} value={key} onChange={(k) => { setKey(k); restart() }} />
        </Ctrl>
        <Ctrl name="Step">
          <Pills small items={[{ key: '1', label: '1 · Start' }, { key: '2', label: '2 · Sort' }, { key: '3', label: '3 · Walk' }]} value={step} onChange={(s: Step) => { setStep(s); restart() }} />
        </Ctrl>
        <Ctrl name="Plot">
          <Pills small items={[{ key: 'mag', label: 'Magnitude' }, { key: 'ph', label: 'Phase' }]} value={mode} onChange={(m: Mode) => setMode(m)} />
        </Ctrl>
        {step === '3' && (
          <Slider
            name={<>Pen at &nbsp;<em>ω</em></>}
            value={`${pen < 10 ? pen.toFixed(2) : pen.toFixed(0)} rad/s`}
            min={0} max={1} step={0.001} v={frac}
            onChange={(v) => { clock.setPlaying(false); clock.setT(v * WALK) }}
          />
        )}
      </div>

      <div className="bode-row">
        <div className="plot-wrap">
          <div className="plot-title">
            <span className="lbl">{mag ? 'Magnitude in dB' : 'Phase in degrees'} over ω in rad/s</span>
            <span className="right">
              <span className="legend">
                <span><i className="sw amb2" /><span className="t">sketch</span></span>
                {done && <span><i className="sw acc" /><span className="t">exact</span></span>}
              </span>
              {step === '3' && <PlayToggle playing={clock.playing} setPlaying={clock.setPlaying} />}
            </span>
          </div>
          <Canvas
            height={270}
            draw={(ctx, w, h) => {
              const f = frame(ctx, w, h, opts)
              marks(ctx, f)
              if (done) polyline(ctx, f, all, all.map((v) => exact(ex, v)), { color: ACCENT, width: 2 })
              const ws = freqs(ex, pen)
              polyline(ctx, f, ws, ws.map((v) => sketch(ex, v)), { color: AMBER, width: 2.4 })
              if (mag) ex.roots.filter(met).forEach((q) => dot(ctx, f.sx(Math.abs(q.r)), f.sy(sketch(ex, Math.abs(q.r))), AMBER, 3.5))
              if (step === '3' && !done) vline(ctx, f, pen, MUTE)
              dot(ctx, f.sx(W0), f.sy(sketch(ex, W0)), AMBER, 4.5)
              if (step === '3') dot(ctx, f.sx(pen), f.sy(sketch(ex, pen)), INK, 4)
            }}
          />

          <div className="lbl lanes-h">The pieces &nbsp;·&nbsp; the sketch is their sum</div>
          <Canvas
            height={lanes.length * LANE + 6}
            draw={(ctx, w) => {
              const pw = w - M.l - M.r
              const span = Math.log10(W1 / W0)
              const X = (v: number) => M.l + (Math.log10(v / W0) / span) * pw
              const scale = mag ? 1.1 : 0.36 // px per dB or per degree
              lanes.forEach((q, i) => {
                const top = i * LANE
                const on = q ? met(q) : true
                const shown = q ? step !== '1' : true
                const c = !shown ? GRID : !on ? MUTE : q ? col(q) : AMBER
                const val = (v: number) => (q ? (mag ? pieceMag(q, v) : piecePh(q, v)) : mag ? baseMag(ex, v) - startDb(ex) : 0)
                // rising pieces start near the bottom of their lane, falling ones near the top
                const dir = Math.sign(val(W1))
                const base = top + LANE / 2 + dir * (LANE / 2 - 9)
                ctx.strokeStyle = GRID
                ctx.lineWidth = 1
                ctx.strokeRect(M.l + 0.5, top + 2.5, pw, LANE - 5)
                ctx.font = `11px ${MONO}`
                ctx.textAlign = 'right'
                ctx.fillStyle = shown ? (q ? col(q) : INK_SOFT) : MUTE
                ctx.fillText(q ? `${q.name} = ${nf(q.r)}` : 'start', M.l - 8, top + LANE / 2 + 4)
                if (!shown) return
                ctx.save()
                ctx.beginPath()
                ctx.rect(M.l, top + 3, pw, LANE - 6)
                ctx.clip()
                const ws = freqs(ex)
                ctx.strokeStyle = c
                ctx.lineWidth = on ? 2 : 1.4
                ctx.lineJoin = 'round'
                ctx.beginPath()
                ws.forEach((v, n) => {
                  const y = base - val(v) * scale
                  if (n) ctx.lineTo(X(v), y)
                  else ctx.moveTo(X(v), y)
                })
                ctx.stroke()
                ctx.restore()
                ctx.font = `500 11px ${SANS}`
                ctx.fillStyle = on ? c : MUTE
                ctx.textAlign = 'right'
                const text = q
                  ? mag ? signed(20 * magSign(q), ' dB/dec') : signed(90 * phSign(q), '°')
                  : mag ? (ex.n0 ? signed(20 * ex.n0, ' dB/dec') : `${nf(startDb(ex), 0)} dB`) : signed(startPh(ex), '°')
                ctx.fillText(text, M.l + pw - 8, dir > 0 ? top + 16 : top + LANE - 10)
              })
              if (step === '3' && !done) {
                const x = Math.round(X(pen)) + 0.5
                ctx.strokeStyle = MUTE
                ctx.setLineDash([3, 3])
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(x, 2)
                ctx.lineTo(x, lanes.length * LANE - 2)
                ctx.stroke()
                ctx.setLineDash([])
              }
            }}
          />
          <div className="plot-foot">
            {mag ? 'Each piece is flat until its pole or zero, then goes up or down by 20 dB per decade.' : 'Each piece turns by 90° in total, over the two decades around its pole or zero.'} A piece lights up when the pen reaches it.
          </div>
        </div>

        <div className="bode-col">
          <div className="panel">
            <div className="fx" style={{ marginBottom: 12 }}><Formula k={key} /></div>
            <div className="bode-step">
              {step === '1' ? <Start ex={ex} /> : step === '2' ? <Sorted ex={ex} /> : <Walk ex={ex} mode={mode} last={last} done={done} />}
            </div>
            {step !== '3' && (
              <div className="row-btns" style={{ marginTop: 14 }}>
                <button className="btn acc" onClick={() => { setStep(step === '1' ? '2' : '3'); restart() }}>Next step →</button>
              </div>
            )}
          </div>

          {step !== '1' && (
            <div className="panel fade">
              <div className="lbl" style={{ marginBottom: 8 }}>The rules</div>
              <Rules last={last} />
              <div className="stats" style={{ gridTemplateColumns: '1fr' }}>
                <div className="stat acc">
                  <div className="lbl">{mag ? 'Slope now' : 'Phase now'}</div>
                  <div className="big">{mag ? signed(now, ' dB/dec') : `${nf(now, 0)}°`}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
