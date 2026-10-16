import { useMemo, useRef, useState } from 'react'
import { Canvas } from '../shared/Canvas'
import { cabs, carg, cx, proots, simulate, tfEval, type Rat } from '../shared/math'
import {
  ACCENT, INK, INK_SOFT, LINE, MUTE, SANS, WARN,
  arrow, dot, fmt, frame, grid, hline, label, polyline, rangeOf, vline,
} from '../shared/plot'
import { ParseError, parsePoly } from '../shared/polyparse'
import { Cnum, RatView, S } from '../shared/tex'
import { Pills, PlayToggle, Slider, useLoop } from '../shared/ui'

type SysKey = 'handout' | 'msd' | 'lag' | 'int' | 'custom'

const SYS_LABEL: Record<SysKey, string> = {
  handout: 'Handout example',
  msd: 'Mass-spring-damper',
  lag: 'First-order lag',
  int: 'Integrator 1/s',
  custom: 'Your own G(s)',
}

/** Starting points for "Your own G(s)", each showing one effect. */
const EXAMPLES: { key: string; label: string; num: string; den: string; hint: string }[] = [
  { key: 'notch', label: 'Notch', num: 's^2 + 1', den: 's^2 + 0.5s + 1', hint: 'The zeros at ±j cancel ω = 1 completely: that frequency never gets through.' },
  { key: 'res', label: 'Sharp resonance', num: '1', den: 's^2 + 0.1s + 1', hint: 'Very little damping: around ω = 1 the output is ten times the input.' },
  { key: 'lead', label: 'Lead', num: 's + 1', den: '0.1s + 1', hint: 'Positive phase: the output peaks before the input does.' },
  { key: 'third', label: 'Three lags', num: '1', den: '(s + 1)^3', hint: 'Every pole adds up to −90°: at high ω the output lags by almost 270°.' },
]

const W_MIN = 0.1
const W_MAX = 10
const N = 3000
const PHASOR_PERIOD = 2.6 // seconds of animation per input period

function system(k: Exclude<SysKey, 'custom'>, zeta: number, tau: number): Rat {
  if (k === 'handout') return { num: [1], den: [1, 2, 2] }
  if (k === 'msd') return { num: [4], den: [1, 4 * zeta, 4] }
  if (k === 'lag') return { num: [1], den: [tau, 1] }
  return { num: [1], den: [1, 0] }
}

/** Parse the two typed polynomials into a proper G(s), or say what is wrong. */
function parseG(numStr: string, denStr: string): { G: Rat } | { error: string } {
  try {
    const num = parsePoly(numStr)
    const den = parsePoly(denStr)
    if (den.every((a) => Math.abs(a) < 1e-12)) return { error: 'The denominator must not be zero.' }
    if (num.length > den.length)
      return { error: 'The numerator has a higher degree than the denominator. Such a G(s) is not proper: it would need to differentiate the input, which no real system can do.' }
    if (den.length === 1) return { error: 'Put at least one s into the denominator, otherwise G(s) is just a gain.' }
    return { G: { num, den } }
  } catch (e) {
    if (e instanceof ParseError) return { error: e.message }
    throw e
  }
}

/** Phase of G(jω) on a log grid, unwrapped so it is continuous in ω. */
function bode(G: Rat, ws: Float64Array) {
  const mag = new Float64Array(ws.length)
  const ph = new Float64Array(ws.length)
  let prev = 0
  ws.forEach((w, i) => {
    const z = tfEval(G, cx(0, w))
    mag[i] = cabs(z)
    let p = carg(z)
    if (i) while (p - prev > Math.PI) p -= 2 * Math.PI
    if (i) while (p - prev < -Math.PI) p += 2 * Math.PI
    ph[i] = p
    prev = p
  })
  return { mag, ph }
}

const WS = (() => {
  const n = 500
  const a = new Float64Array(n + 1)
  for (let i = 0; i <= n; i++) a[i] = 10 ** (Math.log10(0.05) + ((Math.log10(20) - Math.log10(0.05)) * i) / n)
  return a
})()

export default function App() {
  const [sys, setSys] = useState<SysKey>('handout')
  const [zeta, setZeta] = useState(0.15)
  const [tau, setTau] = useState(1)
  const [lw, setLw] = useState(0)
  const [numStr, setNumStr] = useState(EXAMPLES[0].num)
  const [denStr, setDenStr] = useState(EXAMPLES[0].den)
  const w = 10 ** lw
  const parsed = useMemo(() => parseG(numStr, denStr), [numStr, denStr])
  // while the typed G(s) is invalid, keep showing the last valid one
  const lastGood = useRef<Rat>({ num: [1], den: [1, 0.5, 1] })
  if ('G' in parsed) lastGood.current = parsed.G
  const customG = lastGood.current
  const G = useMemo(() => (sys === 'custom' ? customG : system(sys, zeta, tau)), [sys, zeta, tau, customG])
  const poles = useMemo(() => proots(G.den), [G])
  const rhp = poles.filter((p) => p.re > 1e-9)
  const onAxis = poles.filter((p) => Math.abs(p.re) <= 1e-9 && Math.abs(p.im) > 1e-9)
  const example = EXAMPLES.find((e) => e.num === numStr && e.den === denStr)
  const stable = poles.every((p) => p.re < -1e-9)
  const marginal = !stable && poles.every((p) => p.re <= 1e-9)
  const unstable = !stable && !marginal

  const Gjw = tfEval(G, cx(0, w))
  const A = cabs(Gjw)
  const finiteA = Number.isFinite(A) && A < 1e4
  const showA = (d = 2) => (finiteA ? fmt(A, d) : '∞')
  const phasorOK = !unstable && finiteA
  const bd = useMemo(() => bode(G, WS), [G])
  // phase at ω from the unwrapped curve, so lags past −180° read correctly
  const phi = (() => {
    const raw = carg(Gjw)
    let i = 0
    while (i < WS.length - 1 && WS[i] < w) i++
    let p = raw
    while (p - bd.ph[i] > Math.PI) p -= 2 * Math.PI
    while (p - bd.ph[i] < -Math.PI) p += 2 * Math.PI
    return p
  })()

  const P = (2 * Math.PI) / w
  // transient length from the slowest decaying pole (poles on the axis never decay)
  const slowest = Math.min(...poles.map((p) => (p.re < -1e-9 ? -p.re : Infinity)))
  const settle = unstable ? 0 : Math.min(4 / slowest, 80)
  const T = unstable ? Math.min(12, Math.max(3, 2 * P)) : Math.min(400, Math.max(6 * P, settle + 3 * P))
  const ts = useMemo(() => grid(0, T, N), [T])
  const u = useMemo(() => ts.map((t) => Math.cos(w * t)), [ts, w])
  const y = useMemo(() => simulate(G, (t) => Math.cos(w * t), T, N), [G, w, T])

  // measured steady-state amplitude: largest |y| over the last period
  const measured = (() => {
    if (unstable) return NaN
    let m = 0
    for (let k = 0; k <= N; k++) if (ts[k] >= T - P) m = Math.max(m, Math.abs(y[k]))
    return m
  })()

  const clock = useLoop(PHASOR_PERIOD, 1)
  const theta = (2 * Math.PI * clock.t) / PHASOR_PERIOD
  const tCursor = unstable ? (theta / w) % T : T - P + theta / w

  // phase as a time shift Δt = −φ/ω, with φ in (−2π, π]: Δt < 0 means the output leads
  let phiD = phi
  while (phiD > Math.PI) phiD -= 2 * Math.PI
  while (phiD <= -2 * Math.PI) phiD += 2 * Math.PI
  const dT = -phiD / w

  // plane extent: big enough for the whole trace over the slider range
  const R = useMemo(() => {
    let m = 1
    WS.forEach((ww, i) => {
      if (ww >= W_MIN && ww <= W_MAX) m = Math.max(m, bd.mag[i])
    })
    return Math.min(m, 12) * 1.15
  }, [bd])

  return (
    <>
      <p className="intro">
        Feed a sinusoid into a stable LTI system. Once the transient has died out, a sinusoid comes out with the <b>same frequency</b>, but a different amplitude and shifted in time. Both changes are packed into one complex number: plug in <b>s = jω</b> and read off <b>|G(jω)|</b> (amplitude ratio) and <b>∠G(jω)</b> (phase shift).
      </p>

      <div className="ctrls-row">
        <div className="ctrl">
          <div className="clabel"><span className="cname">System</span></div>
          <Pills items={(Object.keys(SYS_LABEL) as SysKey[]).map((k) => ({ key: k, label: SYS_LABEL[k] }))} value={sys} onChange={setSys} />
        </div>
        <div className="ctrl" style={{ minWidth: 260 }}>
          <Slider name={<>Input frequency &nbsp;<em>ω</em></>} value={`${fmt(w, 2)} rad/s`} min={Math.log10(W_MIN)} max={Math.log10(W_MAX)} step={0.005} v={lw} onChange={setLw} />
        </div>
        {sys === 'msd' && (
          <div className="ctrl">
            <Slider name={<>Damping &nbsp;<em>ζ</em></>} value={fmt(zeta, 2)} min={0.05} max={1} step={0.01} v={zeta} onChange={setZeta} />
          </div>
        )}
        {sys === 'lag' && (
          <div className="ctrl">
            <Slider name={<>Time constant &nbsp;<em>τ</em></>} value={`${fmt(tau, 1)} s`} min={0.2} max={5} step={0.1} v={tau} onChange={setTau} />
          </div>
        )}
      </div>

      {sys === 'custom' && (
        <div className="panel tf-input">
          <div className="tf-edit">
            <div>
              <div className="lbl" style={{ marginBottom: 10 }}>Type your own <span className="math">G(s)</span></div>
              <div className="tf-frac">
                <span className="fx tf-g"><i>G</i>(<S />) =</span>
                <div className="tf-fields">
                  <input className={'tf' + ('error' in parsed ? ' err' : '')} value={numStr} onChange={(e) => setNumStr(e.target.value)} spellCheck={false} aria-label="Numerator" placeholder="numerator, e.g. s + 1" />
                  <div className="tf-bar" />
                  <input className={'tf' + ('error' in parsed ? ' err' : '')} value={denStr} onChange={(e) => setDenStr(e.target.value)} spellCheck={false} aria-label="Denominator" placeholder="denominator, e.g. s^2 + 2s + 2" />
                </div>
              </div>
            </div>
            <div className="tf-side">
              {'error' in parsed ? (
                <div className="tf-msg err">{parsed.error}</div>
              ) : (
                <div className="tf-msg">
                  Poles: {poles.map((p, i) => <span key={i} className={p.re > 1e-9 ? 'warn-t' : ''}>{i ? ', ' : ''}<Cnum z={p} /></span>)}
                  {unstable ? <span className="warn-t"> · unstable</span> : marginal ? ' · on the imaginary axis' : ' · all in the left half-plane, stable'}
                </div>
              )}
              <div className="tf-help">Use numbers, <i>s</i>, + − * / ^ and brackets: <code>s^2 + 2s + 2</code>, <code>(s + 1)^3</code>, <code>4(s + 0.5)</code>.</div>
              <div className="ctrl" style={{ marginTop: 12 }}>
                <div className="clabel"><span className="cname">Try</span></div>
                <Pills
                  small
                  items={EXAMPLES.map((e) => ({ key: e.key, label: e.label }))}
                  value={example?.key ?? null}
                  onChange={(k) => {
                    const e = EXAMPLES.find((x) => x.key === k)!
                    setNumStr(e.num)
                    setDenStr(e.den)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="strip">
        <span className="sig">u = cos({fmt(w, 2)}<i>t</i>)</span>
        <span className="wire" />
        <div className="block">
          <span className="lbl">{SYS_LABEL[sys]}</span>
          <span className="fx"><i>G</i>(<S />) = <RatView num={G.num} den={G.den} /></span>
        </div>
        <span className="wire y" />
        <span className="sig y">{unstable ? 'y → ∞' : A < 1e-3 ? 'y → 0' : <>y → {showA()}·cos({fmt(w, 2)}<i>t</i> {phi <= 0 ? '−' : '+'} {fmt(Math.abs(phi), 2)})</>}</span>
      </div>

      <div className="plot-wrap" style={{ marginBottom: 16 }}>
        <div className="plot-title">
          <span className="lbl">Input and output over time</span>
          <span className="right">
            <span className="legend">
              <span><i className="sw" />u(t)</span>
              <span><i className="sw acc" />y(t)</span>
              {!unstable && <span><i className="sw acc dash" />± |G(jω)|</span>}
            </span>
            <PlayToggle playing={clock.playing} setPlaying={clock.setPlaying} />
          </span>
        </div>
        <Canvas
          height={250}
          draw={(ctx, wd, h) => {
            const rg = unstable ? ([-6, 6] as [number, number]) : rangeOf([u, y], 1, 0.22)
            const f = frame(ctx, wd, h, { x: [0, T], y: rg, xUnit: 's' })
            if (settle > 0) {
              ctx.fillStyle = 'rgba(29,35,38,0.035)'
              const xe = f.sx(Math.min(settle, T))
              ctx.fillRect(f.l, f.t, xe - f.l, f.b - f.t)
              label(ctx, 'transient', f.l + 8, f.b - 8, MUTE)
              label(ctx, 'steady state', Math.min(xe + 8, f.r - 80), f.b - 8, MUTE)
            }
            if (!unstable && finiteA) {
              hline(ctx, f, A, ACCENT, [5, 4], Math.max(0, T - 2.5 * P), T)
              hline(ctx, f, -A, ACCENT, [5, 4], Math.max(0, T - 2.5 * P), T)
            }
            polyline(ctx, f, ts, u, { color: INK, width: 1.6 })
            polyline(ctx, f, ts, y, { color: ACCENT, width: 2.2 })
            if (!unstable && finiteA && A > 1e-3 && Math.abs(dT) > 1e-3) {
              // last input peak whose output peak still fits in the window
              let tu = Math.floor((T - Math.max(dT, 0)) / P) * P
              if (tu < T - 2.5 * P) tu = T - 2.5 * P
              const xu = f.sx(tu)
              const xy = f.sx(tu + dT)
              const top = f.t + 16
              ctx.setLineDash([2, 3])
              ctx.strokeStyle = MUTE
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(xu, top)
              ctx.lineTo(xu, f.sy(1))
              ctx.moveTo(xy, top)
              ctx.lineTo(xy, f.sy(A))
              ctx.stroke()
              ctx.setLineDash([])
              if (Math.abs(xy - xu) > 10) arrow(ctx, xu, top, xy, top, INK_SOFT, 1.3, 6)
              dot(ctx, xu, f.sy(1), INK, 3.5)
              dot(ctx, xy, f.sy(A), ACCENT, 3.5)
              label(ctx, `Δt = ${fmt(dT, 2)} s${dT < 0 ? ' (leads)' : ''}`, (xu + xy) / 2, top - 4 > f.t + 8 ? top - 4 : top + 14, INK_SOFT, 'center')
            }
            if (tCursor <= T) {
              vline(ctx, f, tCursor, MUTE)
              const k = Math.round((tCursor / T) * N)
              dot(ctx, f.sx(tCursor), f.sy(u[k]), INK, 4)
              if (Math.abs(y[k]) < 1e3) dot(ctx, f.sx(tCursor), f.sy(y[k]), ACCENT, 4.5)
            }
          }}
        />
        <div className="plot-foot">
          {unstable
            ? 'The output runs away, whatever the input frequency.'
            : sys === 'int'
              ? 'The integrator has no transient for a cosine input: y(t) = sin(ωt)/ω right away. Slow inputs get amplified, fast ones crushed.'
              : marginal
                ? 'A pole sits on the imaginary axis, so part of the response never dies out (a constant offset or a free oscillation). y(t) never becomes a clean sinusoid around zero.'
                : <>Shaded: the transient from starting at rest. After that, y(t) is a pure cosine with the input's frequency, scaled by {showA()} (simulation: {fmt(measured, 2)}) and {dT >= 0 ? 'delayed' : 'shifted earlier'} by Δt = −∠G/ω.</>}
        </div>
      </div>

      <div className="three">
        <div className="plot-wrap">
          <div className="plot-title">
            <span className="lbl"><span className="math">G(jω)</span> in the complex plane</span>
          </div>
          <Canvas
            height={260}
            draw={(ctx, wd, h) => {
              const half = Math.min(wd, h) / 2 - 16
              const cx0 = wd / 2
              const cy0 = h / 2
              const sc = half / R
              const X = (re: number) => cx0 + re * sc
              const Y = (im: number) => cy0 - im * sc
              ctx.strokeStyle = LINE
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(8, cy0)
              ctx.lineTo(wd - 8, cy0)
              ctx.moveTo(cx0, 6)
              ctx.lineTo(cx0, h - 6)
              ctx.stroke()
              ctx.setLineDash([2, 3])
              ctx.beginPath()
              ctx.arc(cx0, cy0, sc, 0, 2 * Math.PI)
              ctx.stroke()
              ctx.setLineDash([])
              label(ctx, '|G| = 1', X(Math.SQRT1_2) + 4, Y(Math.SQRT1_2) - 2, MUTE)
              label(ctx, 'Re', wd - 10, cy0 - 6, INK_SOFT, 'right', `italic 12px ${SANS}`)
              label(ctx, 'Im', cx0 + 6, 16, INK_SOFT, 'left', `italic 12px ${SANS}`)
              // the trace of G(jω) over the slider range
              ctx.save()
              ctx.beginPath()
              ctx.rect(4, 4, wd - 8, h - 8)
              ctx.clip()
              ctx.strokeStyle = 'oklch(0.52 0.09 250 / 0.35)'
              ctx.lineWidth = 1.5
              ctx.beginPath()
              let started = false
              WS.forEach((ww) => {
                if (ww < W_MIN * 0.999 || ww > W_MAX * 1.001) return
                const z = tfEval(G, cx(0, ww))
                if (started) ctx.lineTo(X(z.re), Y(z.im))
                else ctx.moveTo(X(z.re), Y(z.im))
                started = true
              })
              ctx.stroke()
              ;[0.1, 1, 10].forEach((ww) => {
                const z = tfEval(G, cx(0, ww))
                if (Math.abs(z.re) > R || Math.abs(z.im) > R) return
                dot(ctx, X(z.re), Y(z.im), 'oklch(0.52 0.09 250 / 0.5)', 2.5)
                label(ctx, `ω=${ww}`, X(z.re) + 5, Y(z.im) + 12, MUTE, 'left', `10px ${SANS}`)
              })
              ctx.restore()
              // angle arc
              const ra = Math.min(26, (A * sc) / 2)
              if (ra > 6) {
                ctx.strokeStyle = INK_SOFT
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.arc(cx0, cy0, ra, 0, -phi, phi > 0)
                ctx.stroke()
              }
              const tipX = X(Math.max(-R, Math.min(R, Gjw.re)))
              const tipY = Y(Math.max(-R, Math.min(R, Gjw.im)))
              arrow(ctx, cx0, cy0, tipX, tipY, unstable ? WARN : ACCENT, 2.4, 8)
              label(ctx, 'G(jω)', tipX + (Gjw.re >= 0 ? 8 : -8), tipY + (Gjw.im >= 0 ? -6 : 14), unstable ? WARN : ACCENT, Gjw.re >= 0 ? 'left' : 'right', `600 12px ${SANS}`)
            }}
          />
          <div className="plot-foot">Length = amplitude ratio, angle = phase shift. The faint curve is where the arrow tip goes as ω sweeps from 0.1 to 10.</div>
        </div>

        <div className="plot-wrap">
          <div className="plot-title">
            <span className="lbl">Phasors &nbsp;·&nbsp; <span className="math">u</span> and <span className="math">y</span> spinning</span>
          </div>
          <Canvas
            height={260}
            draw={(ctx, wd, h) => {
              const half = Math.min(wd, h) / 2 - 16
              const cx0 = wd / 2
              const cy0 = h / 2
              const Rm = Math.max(1, phasorOK ? A : 1) * 1.08
              const sc = half / Rm
              ctx.strokeStyle = LINE
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(8, cy0)
              ctx.lineTo(wd - 8, cy0)
              ctx.moveTo(cx0, 6)
              ctx.lineTo(cx0, h - 6)
              ctx.stroke()
              ctx.setLineDash([2, 3])
              ctx.beginPath()
              ctx.arc(cx0, cy0, sc, 0, 2 * Math.PI)
              if (phasorOK) ctx.arc(cx0, cy0, sc * A, 0, 2 * Math.PI)
              ctx.stroke()
              ctx.setLineDash([])
              const ux = cx0 + sc * Math.cos(theta)
              const uy = cy0 - sc * Math.sin(theta)
              const yx = cx0 + sc * A * Math.cos(theta + phi)
              const yy = cy0 - sc * A * Math.sin(theta + phi)
              if (phasorOK) {
                ctx.strokeStyle = INK_SOFT
                ctx.lineWidth = 1
                ctx.beginPath()
                const ra = Math.min(22, sc * Math.min(1, A) * 0.5)
                ctx.arc(cx0, cy0, ra, -theta, -(theta + phi), phi > 0)
                ctx.stroke()
              }
              ctx.setLineDash([2, 3])
              ctx.strokeStyle = MUTE
              ctx.beginPath()
              ctx.moveTo(ux, uy)
              ctx.lineTo(ux, cy0)
              if (phasorOK) {
                ctx.moveTo(yx, yy)
                ctx.lineTo(yx, cy0)
              }
              ctx.stroke()
              ctx.setLineDash([])
              arrow(ctx, cx0, cy0, ux, uy, INK, 2, 7)
              dot(ctx, ux, cy0, INK, 3.5)
              label(ctx, 'u', ux + 6, uy - 4, INK, 'left', `italic 600 13px ${SANS}`)
              if (phasorOK) {
                arrow(ctx, cx0, cy0, yx, yy, ACCENT, 2.4, 8)
                dot(ctx, yx, cy0, ACCENT, 3.5)
                label(ctx, 'y', yx + 6, yy - 4, ACCENT, 'left', `italic 600 13px ${SANS}`)
              }
            }}
          />
          <div className="plot-foot">Both arrows turn at the same rate ω: <b>same frequency</b>. The y arrow is the u arrow times G(jω), stretched by |G| and turned by ∠G. The signals are their shadows on the real axis.</div>
        </div>

        <div className="panel">
          <div className="lbl" style={{ marginBottom: 12 }}>Plug in <span className="math">s = jω</span></div>
          <div className="kv">
            <span className="k">ω</span>
            <span className="v">{fmt(w, 2)} rad/s</span>
            <span className="k">G(jω)</span>
            <span className="v acc"><Cnum z={Gjw} /></span>
            <span className="k">|G(jω)|</span>
            <span className="v">{showA(3)}</span>
            <span className="k">∠G(jω)</span>
            <span className="v">{fmt(phi, 2)} rad = {fmt((phi * 180) / Math.PI, 0)}°</span>
          </div>
          {unstable ? (
            <div className="callout warn">
              <b>Unstable: the numbers above don't describe the output.</b> {rhp.length === 1 ? 'A pole lies' : 'Poles lie'} in the right half-plane (s = {rhp.map((p, i) => <span key={i}>{i ? ', ' : ''}<Cnum z={p} /></span>)}), so the response grows without bound and never settles to a sinusoid. G(jω) can still be computed, but "amplitude ratio and phase shift" only make sense once the transient has died out, and that needs a stable system.
            </div>
          ) : !finiteA ? (
            <div className="callout warn">
              <b>ω sits exactly on a pole</b> (s = ±j{fmt(w, 2)}): G(jω) is infinite. The input hits the system's own oscillation, the swing gets pushed at exactly the right rhythm, and the output grows forever.
            </div>
          ) : (
            <div className="callout">
              {marginal && onAxis.length > 0 && <><b>Careful:</b> poles on the imaginary axis keep a free oscillation going, so you'll only see this ratio on top of it. </>}
              {A < 1e-3 ? <>The system <b>blocks</b> this frequency completely: a zero sits right at s = j{fmt(w, 2)}, so y(t) → 0.</> : <>
              {A > 1.05 ? <>The system <b>amplifies</b> this frequency ×{fmt(A, 2)}</> : A < 0.95 ? <>The system <b>attenuates</b> this frequency to ×{fmt(A, 2)}</> : <>The amplitude passes through almost unchanged</>}
              {' '}and the output {dT >= 0 ? 'lags' : 'leads'} by {fmt(Math.abs(phiD * 180) / Math.PI, 0)}°, i.e. Δt = {fmt(dT, 2)} s.</>}
              {sys === 'custom' && example && <> {example.hint}</>}
              {sys === 'handout' && Math.abs(w - 1) < 0.01 && <> This is the slide: G(j) = 1/5 − 2/5 j, |G| ≈ 0.45, ∠G ≈ −1.11 rad.</>}
              {sys === 'msd' && <> Push near ω<sub>n</sub> = 2 rad/s with small ζ: that's the swing, hit at the right rhythm.</>}
            </div>
          )}
        </div>
      </div>

      <div className="two">
        {(['mag', 'ph'] as const).map((which) => (
          <div className="plot-wrap" key={which}>
            <div className="plot-title">
              <span className="lbl">{which === 'mag' ? <>Amplitude ratio <span className="math">|G(jω)|</span> over <span className="math">ω</span></> : <>Phase <span className="math">∠G(jω)</span> over <span className="math">ω</span></>}</span>
              <span className="legend"><span>click to set ω &nbsp;·&nbsp; preview of week 9</span></span>
            </div>
            <Canvas
              height={170}
              cursor="pointer"
              draw={(ctx, wd, h) => {
                const vals = which === 'mag' ? bd.mag : bd.ph.map((p) => (p * 180) / Math.PI)
                let yr: [number, number]
                if (which === 'mag') {
                  let lo = Infinity
                  let hi = 0
                  vals.forEach((v) => {
                    lo = Math.min(lo, v)
                    hi = Math.max(hi, v)
                  })
                  yr = [Math.max(1e-3, Math.min(lo, 0.5) / 1.5), Math.max(hi, 2) * 1.5]
                } else {
                  const r = rangeOf([vals], 90, 0.1)
                  yr = [Math.floor(r[0] / 45) * 45, Math.ceil(r[1] / 45) * 45]
                }
                const f = frame(ctx, wd, h, {
                  x: [0.05, 20],
                  y: yr,
                  xLog: true,
                  yLog: which === 'mag',
                  xUnit: 'rad/s',
                  yTickFmt: which === 'ph' ? (v) => `${fmt(v, 0)}°` : undefined,
                })
                if (which === 'mag') hline(ctx, f, 1, INK_SOFT, [4, 4])
                polyline(ctx, f, WS, vals, { color: unstable ? WARN : ACCENT, width: 2 })
                vline(ctx, f, w, INK)
                const cur = which === 'mag' ? A : (phi * 180) / Math.PI
                dot(ctx, f.sx(w), f.sy(cur), INK, 4.5)
              }}
              onPointer={(x, _y, wd) => {
                const l = 44
                const r = wd - 14
                const v = Math.log10(0.05) + ((x - l) / (r - l)) * (Math.log10(20) - Math.log10(0.05))
                setLw(Math.max(Math.log10(W_MIN), Math.min(Math.log10(W_MAX), v)))
              }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
