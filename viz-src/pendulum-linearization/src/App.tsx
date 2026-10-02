import { useEffect, useMemo, useState } from 'react'
import { Canvas } from './Canvas'
import {
  DT, G_L, N, T_END,
  eigen, fLinear, fNonlinear, jacobian, simulate,
  type State,
} from './physics'
import './viz.css'

const INK = '#1d2326'
const MUTE = '#8b9497'
const LINE = '#d1d8da'
const FIELD = '#b7c1c4'
const ACCENT = 'oklch(0.52 0.09 250)'
const ACCENT_SOFT = 'oklch(0.52 0.09 250 / 0.1)'
const MONO = "'IBM Plex Mono', monospace"

const D_MAX = Math.PI // phase-portrait half-width, rad
const V_MAX = 6 // phase-portrait half-height, rad/s
const BAND = 0.55 // |δ| where sin δ is 5 % below δ

type Eq = 'down' | 'up'
type FieldMode = 'nonlinear' | 'linear'

const deg = (r: number) => (r * 180) / Math.PI
const fmt = (x: number, n = 2) => (Math.abs(x) < 0.005 ? 0 : x).toFixed(n).replace('-', '−')

function arrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, len: number) {
  const m = Math.hypot(dx, dy)
  if (m < 1e-9) return
  const ux = dx / m
  const uy = dy / m
  const x0 = x - (ux * len) / 2
  const y0 = y - (uy * len) / 2
  const x1 = x + (ux * len) / 2
  const y1 = y + (uy * len) / 2
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 - ux * 4 + uy * 2.4, y1 - uy * 4 - ux * 2.4)
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 - ux * 4 - uy * 2.4, y1 - uy * 4 + ux * 2.4)
  ctx.stroke()
}

function Legend() {
  return (
    <span className="legend">
      <span><i className="sw nl" />nonlinear</span>
      <span><i className="sw lin" />linearized</span>
    </span>
  )
}

/** Small play/pause pill for the header of every animated plot. */
function PlayToggle(props: { playing: boolean; setPlaying: (p: boolean) => void }) {
  return (
    <button className={'play' + (props.playing ? '' : ' paused')} onClick={() => props.setPlaying(!props.playing)}>
      {props.playing ? 'Pause' : 'Play'}
    </button>
  )
}

function Slider(props: {
  name: React.ReactNode
  value: string
  min: number
  max: number
  step: number
  v: number
  onChange: (v: number) => void
}) {
  return (
    <div className="ctrl">
      <div className="clabel">
        <span className="cname">{props.name}</span>
        <span className="cval">{props.value}</span>
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.v}
        onChange={(e) => props.onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}

export default function App() {
  const [eq, setEq] = useState<Eq>('down')
  const [x0, setX0] = useState<State>([0.6, 0])
  const [b, setB] = useState(0.3)
  const [fieldMode, setFieldMode] = useState<FieldMode>('nonlinear')
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)

  const thetaE = eq === 'down' ? 0 : Math.PI
  const eig = useMemo(() => eigen(thetaE, b), [thetaE, b])
  const A = useMemo(() => jacobian(thetaE, b), [thetaE, b])
  const traj = useMemo(() => simulate(x0, b, thetaE), [x0, b, thetaE])

  const restart = () => setT(0)

  // --- playback -------------------------------------------------------------
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      setT((p) => (p + dt >= T_END ? 0 : p + dt))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  // --- tell the host page how tall we are so its iframe can fit us ----------
  useEffect(() => {
    const post = () =>
      window.parent?.postMessage({ type: 'viz-height', height: document.documentElement.scrollHeight }, '*')
    const ro = new ResizeObserver(post)
    ro.observe(document.body)
    post()
    return () => ro.disconnect()
  }, [])

  const idx = Math.min(N, Math.round(t / DT))
  const nowNl: State = [traj.nl[2 * idx], traj.nl[2 * idx + 1]]
  const nowLin: State = [traj.lin[2 * idx], traj.lin[2 * idx + 1]]

  const setEquilibrium = (e: Eq) => {
    setEq(e)
    setX0([e === 'down' ? 0.6 : 0.15, 0])
    restart()
  }
  const setD0 = (deg0: number) => {
    setX0([(deg0 * Math.PI) / 180, 0])
    restart()
  }

  // ===== phase portrait ======================================================
  const PM = { l: 40, r: 12, t: 10, b: 30 }
  const drawPhase = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const pw = w - PM.l - PM.r
    const ph = h - PM.t - PM.b
    const sx = (d: number) => PM.l + ((d + D_MAX) / (2 * D_MAX)) * pw
    const sy = (v: number) => PM.t + ((V_MAX - v) / (2 * V_MAX)) * ph

    // small-angle validity band
    ctx.fillStyle = ACCENT_SOFT
    ctx.fillRect(sx(-BAND), PM.t, sx(BAND) - sx(-BAND), ph)
    ctx.font = `10px ${MONO}`
    ctx.fillStyle = MUTE
    ctx.textAlign = 'center'
    ctx.fillText('sin δ ≈ δ', sx(0), PM.t + 12)

    // axes
    ctx.strokeStyle = LINE
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(sx(0), PM.t)
    ctx.lineTo(sx(0), PM.t + ph)
    ctx.moveTo(PM.l, sy(0))
    ctx.lineTo(PM.l + pw, sy(0))
    ctx.stroke()
    ctx.strokeRect(PM.l, PM.t, pw, ph)

    ctx.fillStyle = MUTE
    ctx.textAlign = 'center'
    const xt: [number, string][] = [[-Math.PI, '−π'], [-Math.PI / 2, '−π/2'], [0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π']]
    xt.forEach(([d, s]) => ctx.fillText(s, sx(d), PM.t + ph + 14))
    ctx.textAlign = 'right'
    ;[-V_MAX, -3, 0, 3, V_MAX].forEach((v) => ctx.fillText(String(v).replace('-', '−'), PM.l - 6, sy(v) + 3))
    ctx.textAlign = 'right'
    ctx.fillText('δ [rad]', PM.l + pw, PM.t + ph + 26)
    ctx.textAlign = 'left'
    ctx.fillText('δ̇ [rad/s]', PM.l + 6, PM.t + 12 + 0)

    // vector field
    ctx.save()
    ctx.beginPath()
    ctx.rect(PM.l, PM.t, pw, ph)
    ctx.clip()
    ctx.strokeStyle = FIELD
    ctx.lineWidth = 1
    const nx = Math.max(9, Math.round(pw / 38))
    const ny = 9
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const d = -D_MAX + ((i + 0.5) / nx) * 2 * D_MAX
        const v = -V_MAX + ((j + 0.5) / ny) * 2 * V_MAX
        const [fd, fv] = fieldMode === 'nonlinear' ? fNonlinear(d, v, b, thetaE) : fLinear(d, v, b, thetaE)
        arrow(ctx, sx(d), sy(v), fd * (pw / (2 * D_MAX)), -fv * (ph / (2 * V_MAX)), 12)
      }
    }

    // real eigen-directions
    if (eig.dirs.length) {
      ctx.strokeStyle = MUTE
      ctx.setLineDash([2, 4])
      eig.dirs.forEach((lam) => {
        ctx.beginPath()
        ctx.moveTo(sx(-D_MAX), sy(-lam * D_MAX))
        ctx.lineTo(sx(D_MAX), sy(lam * D_MAX))
        ctx.stroke()
      })
      ctx.setLineDash([])
    }

    // trajectories
    const path = (arr: Float64Array) => {
      ctx.beginPath()
      for (let i = 0; i <= N; i += 2) {
        const x = sx(arr[2 * i])
        const y = sy(arr[2 * i + 1])
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    // nonlinear first, linearized dashed on top so it stays visible where they agree
    ctx.lineWidth = 2.5
    ctx.strokeStyle = ACCENT
    path(traj.nl)
    ctx.lineWidth = 1.5
    ctx.strokeStyle = INK
    ctx.setLineDash([5, 4])
    path(traj.lin)
    ctx.setLineDash([])
    ctx.restore()

    // initial state, equilibrium, current state
    ctx.strokeStyle = MUTE
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(sx(x0[0]), sy(x0[1]), 5, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.strokeStyle = INK
    ctx.beginPath()
    ctx.moveTo(sx(0) - 4, sy(0) - 4)
    ctx.lineTo(sx(0) + 4, sy(0) + 4)
    ctx.moveTo(sx(0) + 4, sy(0) - 4)
    ctx.lineTo(sx(0) - 4, sy(0) + 4)
    ctx.stroke()

    const inBox = (p: State) => Math.abs(p[0]) <= D_MAX && Math.abs(p[1]) <= V_MAX
    if (inBox(nowLin)) {
      ctx.strokeStyle = INK
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(sx(nowLin[0]), sy(nowLin[1]), 4.5, 0, 2 * Math.PI)
      ctx.stroke()
    }
    if (inBox(nowNl)) {
      ctx.fillStyle = ACCENT
      ctx.beginPath()
      ctx.arc(sx(nowNl[0]), sy(nowNl[1]), 4, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  const onPhasePointer = (px: number, py: number, w: number, h: number) => {
    const pw = w - PM.l - PM.r
    const ph = h - PM.t - PM.b
    const d = ((px - PM.l) / pw) * 2 * D_MAX - D_MAX
    const v = V_MAX - ((py - PM.t) / ph) * 2 * V_MAX
    const cl = (x: number, m: number) => Math.max(-m, Math.min(m, x))
    setX0([cl(d, D_MAX * 0.98), cl(v, V_MAX * 0.98)])
    restart()
  }

  // ===== time response =======================================================
  const yRange = useMemo(() => {
    let m = 0
    for (let i = 0; i <= N; i++) m = Math.max(m, Math.abs(traj.nl[2 * i]))
    return Math.max(deg(m), 8) * 1.2
  }, [traj])

  const TM = { l: 44, r: 12, t: 10, b: 28 }
  const drawTime = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const pw = w - TM.l - TM.r
    const ph = h - TM.t - TM.b
    const sx = (s: number) => TM.l + (s / T_END) * pw
    const sy = (a: number) => TM.t + ((yRange - a) / (2 * yRange)) * ph

    ctx.strokeStyle = LINE
    ctx.lineWidth = 1
    ctx.strokeRect(TM.l, TM.t, pw, ph)
    ctx.beginPath()
    ctx.moveTo(TM.l, sy(0))
    ctx.lineTo(TM.l + pw, sy(0))
    ctx.stroke()

    ctx.font = `10px ${MONO}`
    ctx.fillStyle = MUTE
    ctx.textAlign = 'center'
    for (let s = 0; s <= T_END; s++) ctx.fillText(String(s), sx(s), TM.t + ph + 14)
    ctx.textAlign = 'right'
    ctx.fillText('t [s]', TM.l + pw, TM.t + ph + 26)
    const yt = Math.round(yRange / 10) * 10 || 10
    ;[-yt, 0, yt].forEach((a) => ctx.fillText(String(a).replace('-', '−') + '°', TM.l - 6, sy(a) + 3))
    ctx.textAlign = 'left'
    ctx.fillText('δ(t)', TM.l + 6, TM.t + 12)

    ctx.save()
    ctx.beginPath()
    ctx.rect(TM.l, TM.t, pw, ph)
    ctx.clip()
    const line = (arr: Float64Array) => {
      ctx.beginPath()
      for (let i = 0; i <= N; i += 2) {
        const x = sx(i * DT)
        const y = sy(deg(arr[2 * i]))
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.lineWidth = 2.5
    ctx.strokeStyle = ACCENT
    line(traj.nl)
    ctx.lineWidth = 1.5
    ctx.strokeStyle = INK
    ctx.setLineDash([5, 4])
    line(traj.lin)
    ctx.setLineDash([])
    ctx.restore()

    ctx.strokeStyle = MUTE
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(sx(t), TM.t)
    ctx.lineTo(sx(t), TM.t + ph)
    ctx.stroke()
  }

  // ===== animated pendulum ===================================================
  const drawPendulum = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const px = w / 2
    // pivot at mid-height so the pendulum can both hang and stand upright
    const py = h / 2 - 8
    const L = Math.min((h - 70) / 2, w * 0.4)
    const bob = (theta: number): [number, number] => [px + L * Math.sin(theta), py + L * Math.cos(theta)]

    // ceiling
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(px - 22, py)
    ctx.lineTo(px + 22, py)
    ctx.stroke()

    // equilibrium reference and small-angle cone
    const [ex, ey] = bob(thetaE)
    ctx.strokeStyle = MUTE
    ctx.lineWidth = 1
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(ex, ey)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = ACCENT_SOFT
    ctx.beginPath()
    ctx.moveTo(px, py)
    const a0 = Math.PI / 2 - (thetaE - BAND)
    const a1 = Math.PI / 2 - (thetaE + BAND)
    ctx.arc(px, py, L * 0.98, a0, a1, true)
    ctx.closePath()
    ctx.fill()

    // linearized (ghost)
    const [lx, ly] = bob(thetaE + nowLin[0])
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.5
    ctx.setLineDash([5, 4])
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(lx, ly)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(248,250,251,0.9)'
    ctx.beginPath()
    ctx.arc(lx, ly, 10, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()

    // nonlinear
    const [nx, ny] = bob(thetaE + nowNl[0])
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(nx, ny)
    ctx.stroke()
    ctx.fillStyle = ACCENT
    ctx.beginPath()
    ctx.arc(nx, ny, 9, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = INK
    ctx.beginPath()
    ctx.arc(px, py, 3, 0, 2 * Math.PI)
    ctx.fill()

    ctx.font = `10px ${MONO}`
    ctx.fillStyle = MUTE
    ctx.textAlign = 'left'
    ctx.fillText(`θ = ${fmt(deg(thetaE + nowNl[0]), 1)}°`, 10, h - 26)
    ctx.fillText(`θ_lin = ${fmt(deg(thetaE + nowLin[0]), 1)}°`, 10, h - 10)
  }

  // ===== readouts ============================================================
  const d0 = x0[0]
  const restoring = Math.abs(d0) < 1e-6 ? 0 : (1 - Math.sin(d0) / d0) * 100
  const maxErrDeg = deg(traj.maxErr)
  const eigText =
    eig.im1 !== 0
      ? `${fmt(eig.re1)} ± ${fmt(eig.im1)}j`
      : `${fmt(eig.re1)},  ${fmt(eig.re2)}`

  return (
    <div className="viz">
      <div className="vrow">
        <div className="plot-wrap">
          <div className="plot-title">
            <span>Phase portrait · <span className="math">(δ, δ̇)</span></span>
            <span className="right"><Legend /><PlayToggle playing={playing} setPlaying={setPlaying} /></span>
          </div>
          <Canvas height={340} draw={drawPhase} onPointer={onPhasePointer} cursor="crosshair" />
          <div className="plot-foot">Arrows show the direction of motion at each state. Click or drag to set the initial state.</div>
        </div>
        <div className="side-col">
          <div className="plot-wrap">
            <div className="plot-title"><span>Pendulum</span><PlayToggle playing={playing} setPlaying={setPlaying} /></div>
            <Canvas height={290} draw={drawPendulum} />
          </div>
          <div className="readouts">
            <div className="ro">
              <div className="rk">Jacobian A</div>
              <div className="mat">
                <span>0</span><span>1</span>
                <span>{fmt(A[1][0])}</span><span>{fmt(A[1][1])}</span>
              </div>
            </div>
            <div className="ro">
              <div className="rk">Eigenvalues <span className="math">λ</span></div>
              <div className="rv small">{eigText}</div>
              <div className="regime"><b>{eig.kind}</b></div>
            </div>
          </div>
        </div>
      </div>

      <div className="plot-wrap wide-plot">
        <div className="plot-title">
          <span>Response · <span className="math">δ(t) = θ(t) − θₑ</span></span>
          <span className="right"><Legend /><PlayToggle playing={playing} setPlaying={setPlaying} /></span>
        </div>
        <Canvas height={230} draw={drawTime} />
      </div>

      <div className="vrow controls">
        <div>
          <div className="ctrl">
            <div className="clabel"><span className="cname">Equilibrium &nbsp;<em>θₑ</em></span></div>
            <div className="seg">
              <button className={eq === 'down' ? 'on' : ''} onClick={() => setEquilibrium('down')}>θₑ = 0 · hanging</button>
              <button className={eq === 'up' ? 'on' : ''} onClick={() => setEquilibrium('up')}>θₑ = π · upright</button>
            </div>
          </div>
          <Slider
            name={<>Initial deviation &nbsp;<em>δ₀</em></>}
            value={`${fmt(deg(d0), 0)}°`}
            min={-170}
            max={170}
            step={1}
            v={Math.round(deg(d0))}
            onChange={setD0}
          />
          <Slider
            name={<>Damping &nbsp;<em>b</em></>}
            value={`${fmt(b)} 1/s`}
            min={0}
            max={1.5}
            step={0.01}
            v={b}
            onChange={(v) => { setB(v); restart() }}
          />
        </div>
        <div>
          <div className="ctrl">
            <div className="clabel"><span className="cname">Vector field</span></div>
            <div className="seg">
              <button className={fieldMode === 'nonlinear' ? 'on' : ''} onClick={() => setFieldMode('nonlinear')}>nonlinear</button>
              <button className={fieldMode === 'linear' ? 'on' : ''} onClick={() => setFieldMode('linear')}>linearized</button>
            </div>
          </div>
          <Slider
            name={<>Time &nbsp;<em>t</em></>}
            value={`${t.toFixed(2)} s`}
            min={0}
            max={T_END}
            step={0.01}
            v={t}
            onChange={(v) => { setPlaying(false); setT(v) }}
          />
          <div className="seg transport">
            <button onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</button>
            <button onClick={restart}>Restart</button>
          </div>
        </div>
      </div>

      <div className="readouts four">
        <div className="ro">
          <div className="rk">Restoring-term error <small>at δ₀</small></div>
          <div className="rv">{restoring.toFixed(1)}<small> %</small></div>
        </div>
        <div className="ro">
          <div className="rk">Max trajectory error <small>over {T_END} s</small></div>
          <div className="rv">{traj.maxErr >= 2 * Math.PI - 1e-6 ? '> 360' : maxErrDeg.toFixed(1)}<small> °</small></div>
        </div>
        <div className="ro">
          <div className="rk">Linearized model</div>
          <div className="rv small">δ̈ = {fmt(A[1][0])} δ {A[1][1] < 0 ? '−' : '+'} {fmt(Math.abs(A[1][1]))} δ̇</div>
        </div>
        <div className="ro">
          <div className="rk"><span className="math">g / l</span></div>
          <div className="rv">{G_L.toFixed(2)}<small> 1/s²</small></div>
        </div>
      </div>

      <div className="subhead">What to notice</div>
      <div className="notes">
        <p>
          The arrows in the phase portrait are the vector field: at each state (δ, δ̇) an arrow points the way the system
          moves, and every trajectory follows them. Switch the field between nonlinear and linearized. Inside the shaded band
          the two fields are almost the same; farther out they differ, and that difference is the error the linearization
          makes.
        </p>
        <p>
          Around θₑ = 0 the model is θ̈ = −(g/l) sin θ − bθ̇. Replacing sin δ by δ gives a linear system whose Jacobian has a
          complex pair of eigenvalues: a stable focus. For releases inside the shaded band the two trajectories are almost
          identical. Push δ₀ out and the nonlinear pendulum swings more slowly than the linear one, because sin δ is smaller
          than δ — the curves drift out of phase.
        </p>
        <p>
          Around θₑ = π the same procedure gives cos θₑ = −1, so the eigenvalues have opposite signs: a saddle. The linearized
          model says any small deviation grows exponentially along the unstable eigenvector (dotted line). The real pendulum
          does fall, but then swings around θ = 0, which the linear model cannot describe. Linearization tells you the
          equilibrium is unstable; it does not tell you where the system goes next.
        </p>
      </div>
    </div>
  )
}
