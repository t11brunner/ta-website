import { useMemo, useState } from 'react'
import { Canvas } from './Canvas'
import {
  ACCENT, INK, INK_SOFT, LINE, MONO, MUTE, SANS,
  arrow, arrowHead, cursorLine, dot, fmt, frame, plotSeries, rangeOf, sample,
} from './plot'
import { DT, N_PLANT, PLANTS, simulatePlant, type Plant, type PlantKey, type Sensor } from './sim'
import { Ctrl, Pills, PlayToggle, Slider, Transport, useClock } from './ui'

type Mode = 'closed' | 'open'

function niceTicks(lo: number, hi: number) {
  const raw = (hi - lo) / 6
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  const st = (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p
  const out: number[] = []
  for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) out.push(v)
  return out
}

function tag(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
  ctx.font = `500 11px ${SANS}`
  const w = ctx.measureText(text).width + 14
  ctx.fillStyle = 'oklch(0.52 0.09 250 / 0.12)'
  ctx.beginPath()
  ctx.roundRect(x - w / 2, y - 10, w, 20, 10)
  ctx.fill()
  ctx.fillStyle = ACCENT
  ctx.textAlign = 'center'
  ctx.fillText(text, x, y + 4)
}

// ===== car ====================================================================
function drawCar(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  p: number, v: number, a: number, u: number, sensor: Sensor, pRange: [number, number],
) {
  const [lo, hi] = pRange
  const sx = (q: number) => 50 + ((q - lo) / (hi - lo)) * (w - 100)
  const road = h - 62

  // road and ruler
  ctx.strokeStyle = INK
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(14, road)
  ctx.lineTo(w - 14, road)
  ctx.stroke()
  ctx.font = `10px ${MONO}`
  ctx.fillStyle = MUTE
  ctx.textAlign = 'center'
  ctx.strokeStyle = LINE
  ctx.lineWidth = 1
  niceTicks(lo, hi).forEach((q) => {
    ctx.beginPath()
    ctx.moveTo(sx(q), road + 2)
    ctx.lineTo(sx(q), road + 7)
    ctx.stroke()
    ctx.fillText(fmt(q, Math.abs(q) < 10 && q % 1 ? 1 : 0), sx(q), road + 19)
  })
  ctx.textAlign = 'right'
  ctx.fillText('p [m]', w - 14, road + 19)

  // car body
  const cx = sx(p)
  const cw = 64
  const ch = 26
  ctx.fillStyle = '#f8fafb'
  ctx.strokeStyle = INK
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(cx - cw / 2, road - ch - 12, cw, ch, 4)
  ctx.fill()
  ctx.stroke()
  ;[-18, 18].forEach((dx) => {
    ctx.beginPath()
    ctx.arc(cx + dx, road - 7, 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  })
  ctx.fillStyle = INK
  ctx.font = `italic 13px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillText('m', cx, road - 20)

  // input force
  if (Math.abs(u) > 1e-3) {
    const len = 26 * u
    const y0 = road - 25
    const x0 = u > 0 ? cx - cw / 2 - Math.abs(len) - 4 : cx + cw / 2 + Math.abs(len) + 4
    arrow(ctx, x0, y0, x0 + len, y0, INK, 2)
    ctx.fillStyle = INK
    ctx.font = `italic 13px ${SANS}`
    ctx.fillText('F', x0 + len / 2, y0 - 7)
  }

  // sensor reading
  const top = road - ch - 12
  if (sensor.key === 'pos') {
    const yb = road + 34
    const x0 = sx(0)
    ctx.strokeStyle = ACCENT
    ctx.fillStyle = ACCENT
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x0, yb - 5)
    ctx.lineTo(x0, yb + 5)
    ctx.stroke()
    if (Math.abs(cx - x0) > 6) arrow(ctx, x0, yb, cx, yb, ACCENT, 1.5)
    ctx.setLineDash([2, 3])
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx, road + 2)
    ctx.lineTo(cx, yb)
    ctx.stroke()
    ctx.setLineDash([])
  } else if (sensor.key === 'vel') {
    arrow(ctx, cx, top - 14, cx + 22 * v, top - 14, ACCENT, 2.5)
  } else {
    arrow(ctx, cx, top - 14, cx + 30 * a, top - 14, ACCENT, 2.5)
    if (Math.abs(a) > 0.02) arrowHead(ctx, cx + 30 * a - Math.sign(a) * 7, top - 14, Math.sign(a), 0, 7)
  }
  tag(ctx, cx, top - 36, `${sensor.device}: y = ${fmt(sensor.fn([p, v], u))} ${sensor.unit}`)
}

// ===== pendulum ===============================================================
function drawPendulum(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  th: number, om: number, u: number, sensor: Sensor,
) {
  const px = w / 2
  const py = 26
  const R = Math.min(118, h - 96)
  const bx = px + R * Math.sin(th)
  const by = py + R * Math.cos(th)

  // ceiling
  ctx.strokeStyle = INK
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(px - 40, py)
  ctx.lineTo(px + 40, py)
  ctx.stroke()
  ctx.lineWidth = 1
  for (let i = -36; i <= 36; i += 9) {
    ctx.beginPath()
    ctx.moveTo(px + i, py)
    ctx.lineTo(px + i + 6, py - 6)
    ctx.stroke()
  }
  // vertical reference
  ctx.strokeStyle = LINE
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  ctx.moveTo(px, py)
  ctx.lineTo(px, py + R + 16)
  ctx.stroke()
  ctx.setLineDash([])

  // sensor overlays below the rod
  const ruler = py + R + 44
  if (sensor.key === 'ang') {
    ctx.strokeStyle = ACCENT
    ctx.lineWidth = 2
    ctx.beginPath()
    // canvas angles: down = π/2, the rod sits at π/2 − θ
    ctx.arc(px, py, 46, Math.PI / 2, Math.PI / 2 - th, th > 0)
    ctx.stroke()
  } else if (sensor.key === 'rate') {
    const span = Math.max(-2.2, Math.min(2.2, 0.35 * om))
    if (Math.abs(span) > 0.02) {
      const a0 = Math.PI / 2 - th
      const a1 = a0 - span
      ctx.strokeStyle = ACCENT
      ctx.fillStyle = ACCENT
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(px, py, 30, a0, a1, span > 0)
      ctx.stroke()
      const ex = px + 30 * Math.cos(a1)
      const ey = py + 30 * Math.sin(a1)
      const s = span > 0 ? -1 : 1
      arrowHead(ctx, ex, ey, -Math.sin(a1) * s, Math.cos(a1) * s, 7)
    }
  } else {
    // camera: projection of the bob onto a horizontal ruler
    ctx.strokeStyle = LINE
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(px - R - 10, ruler)
    ctx.lineTo(px + R + 10, ruler)
    ctx.stroke()
    ctx.font = `10px ${MONO}`
    ctx.fillStyle = MUTE
    ctx.textAlign = 'center'
    ;[-1, -0.5, 0, 0.5, 1].forEach((q) => {
      ctx.beginPath()
      ctx.moveTo(px + q * R, ruler - 3)
      ctx.lineTo(px + q * R, ruler + 3)
      ctx.stroke()
      ctx.fillText(fmt(q, q % 1 ? 1 : 0), px + q * R, ruler + 15)
    })
    ctx.strokeStyle = ACCENT
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    ctx.moveTo(bx, by)
    ctx.lineTo(bx, ruler)
    ctx.stroke()
    ctx.setLineDash([])
    dot(ctx, bx, ruler, ACCENT, 5)
  }

  // rod and bob
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(px, py)
  ctx.lineTo(bx, by)
  ctx.stroke()
  ctx.fillStyle = '#f8fafb'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(bx, by, 11, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = INK
  ctx.font = `italic 12px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillText('m', bx, by + 4)
  dot(ctx, px, py, INK, 3)

  // input force, horizontal at the bob
  if (Math.abs(u) > 1e-3) {
    const len = Math.max(-70, Math.min(70, 5 * u))
    const x0 = u > 0 ? bx - 14 - Math.abs(len) : bx + 14 + Math.abs(len)
    arrow(ctx, x0, by, x0 + len, by, INK, 2)
    ctx.fillStyle = INK
    ctx.font = `italic 13px ${SANS}`
    ctx.fillText('Fₚ', x0 + len / 2, by - 8)
  }

  tag(ctx, px, h - 14, `${sensor.device}: y = ${fmt(sensor.fn([th, om], u))} ${sensor.unit}`)
}

// ===== closed box =============================================================
function ClosedBox() {
  return (
    <div style={{ padding: '46px 8px 40px' }}>
      <div className="strip" style={{ margin: 0 }}>
        <span className="sig">u(t)</span>
        <span className="wire" />
        <div className="block closed">
          <span className="corner">x</span>
          <span className="sigma">Σ</span>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>what is inside?</div>
        </div>
        <span className="wire y" />
        <span className="sig y">y(t)</span>
      </div>
    </div>
  )
}

export default function BoxTab() {
  const [mode, setMode] = useState<Mode>('closed')
  const [plantKey, setPlantKey] = useState<PlantKey>('car')
  const [inputKey, setInputKey] = useState('pulse')
  const [sensorKey, setSensorKey] = useState('pos')
  const [x0, setX0] = useState<[number, number]>([0, 0])
  const [ghost, setGhost] = useState<{ y: Float64Array; what: string } | null>(null)
  const { t, setT, playing, setPlaying } = useClock()

  const plant: Plant = PLANTS[plantKey]
  const sensor = plant.sensors.find((s) => s.key === sensorKey) ?? plant.sensors[0]
  const input = plant.inputs.find((i) => i.key === inputKey) ?? plant.inputs[0]

  const sim = useMemo(() => simulatePlant(plant, input.fn, x0, sensor), [plant, input, x0, sensor])
  const uData = useMemo(() => sample(input.fn, 0, N_PLANT), [input])
  const k = Math.min(N_PLANT, Math.round(t / DT))
  const xNow: [number, number] = [sim.xs[0][k], sim.xs[1][k]]
  const uNow = uData[k]

  // ranges fixed per simulation so the axes don't jump while the cursor runs
  const uRange = useMemo(() => rangeOf([uData], [0], 1), [uData])
  const yRange = useMemo(
    () => rangeOf(ghost ? [sim.y, ghost.y] : [sim.y], ghost ? [0, 0] : [0], 0.5),
    [sim, ghost],
  )
  const xRanges = useMemo(() => [rangeOf([sim.xs[0]], [0], 0.5), rangeOf([sim.xs[1]], [0], 0.5)], [sim])
  const pRange = useMemo((): [number, number] => {
    const [lo, hi] = rangeOf([sim.xs[0]], [0], 4)
    return [Math.min(lo, -0.5), Math.max(hi, 0.5)]
  }, [sim])

  const keepGhost = (what: string) => setGhost({ y: sim.y, what })

  const changePlant = (pk: PlantKey) => {
    setPlantKey(pk)
    setSensorKey(PLANTS[pk].sensors[0].key)
    setInputKey('pulse')
    setX0(PLANTS[pk].x0Default)
    setGhost(null)
    setT(0)
  }
  const changeSensor = (sk: string) => {
    if (sk === sensor.key) return
    keepGhost(`previous sensor: ${sensor.label.toLowerCase()}`)
    setSensorKey(sk)
  }
  const changeX0 = (i: 0 | 1, v: number) => {
    if (!ghost || !ghost.what.startsWith('previous initial')) keepGhost('previous initial state')
    setX0((x) => (i === 0 ? [v, x[1]] : [x[0], v]))
  }
  const shakeHidden = () => {
    keepGhost('before the change inside')
    const [[a0, a1], [b0, b1]] = plant.x0Range
    const r = (lo: number, hi: number) => Math.round((lo + Math.random() * (hi - lo)) * 10) / 10
    let nx: [number, number]
    do nx = [r(a0 * 0.6, a1 * 0.6), r(b0 * 0.6, b1 * 0.6)]
    while (Math.abs(nx[0] - x0[0]) + Math.abs(nx[1] - x0[1]) < 0.4)
    setX0(nx)
    setT(0)
    setPlaying(true)
  }

  const drawU = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const f = frame(ctx, w, h, uRange, `input u = ${plant.uName}(t) [${plant.uUnit}]`)
    plotSeries(ctx, f, { data: uData, t0: 0, color: INK })
    cursorLine(ctx, f, t)
  }
  const drawY = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const f = frame(ctx, w, h, yRange, `output y(t) [${sensor.unit}]`)
    if (ghost) plotSeries(ctx, f, { data: ghost.y, t0: 0, color: MUTE, width: 1.5, dash: [5, 4] })
    plotSeries(ctx, f, { data: sim.y, t0: 0, color: ACCENT, width: 2.5, upTo: t })
    cursorLine(ctx, f, t)
    dot(ctx, f.sx(t), f.sy(sim.y[k]), ACCENT, 4.5)
  }
  const drawX = (i: 0 | 1) => (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const f = frame(ctx, w, h, xRanges[i], `x${i ? '₂' : '₁'} = ${plant.states[i]} [${plant.stateUnits[i]}]`)
    plotSeries(ctx, f, { data: sim.xs[i], t0: 0, color: INK_SOFT, width: 2, upTo: t })
    cursorLine(ctx, f, t)
    dot(ctx, f.sx(t), f.sy(sim.xs[i][k]), INK_SOFT, 4)
  }
  const drawScene = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (plantKey === 'car') drawCar(ctx, w, h, xNow[0], xNow[1], plant.dyn(xNow, uNow)[1], uNow, sensor, pRange)
    else drawPendulum(ctx, w, h, xNow[0], xNow[1], uNow, sensor)
  }

  const open = mode === 'open'
  const [[a0, a1], [b0, b1]] = plant.x0Range

  return (
    <div className="fade">
      <p className="intro">
        From outside, a system is a box: an input goes in, an output comes out. Inside are the <b>states</b> x — the
        system&apos;s memory — and two rules: <b>f</b>, how the states evolve (physics), and <b>h</b>, what we actually measure
        (our choice of sensor). Start with the box closed, then open it.
      </p>

      <div className="vrow">
        <div className="plot-wrap">
          <div className="plot-title">
            <span className="lbl">{open ? `${plant.label} · inside the box` : 'Black box'}</span>
            {open && <PlayToggle playing={playing} setPlaying={setPlaying} />}
          </div>
          {open ? <Canvas height={230} draw={drawScene} /> : <ClosedBox />}
        </div>
        <div>
          <Ctrl name="Box">
            <Pills
              items={[{ key: 'closed' as Mode, label: 'Closed' }, { key: 'open' as Mode, label: 'Open' }]}
              value={mode}
              onChange={setMode}
            />
          </Ctrl>
          <Ctrl name="System">
            <Pills
              items={[{ key: 'car' as PlantKey, label: 'Car' }, { key: 'pendulum' as PlantKey, label: 'Pendulum' }]}
              value={plantKey}
              onChange={changePlant}
            />
          </Ctrl>
          <Ctrl name={<>Input &nbsp;<em>u = {plant.uName}</em></>}>
            <Pills
              items={plant.inputs.map((i) => ({ key: i.key, label: i.label }))}
              value={input.key}
              onChange={(kk) => { setInputKey(kk); setGhost(null); setT(0) }}
            />
          </Ctrl>
          {open ? (
            <Ctrl name={<>Sensor &nbsp;<em>h</em></>}>
              <Pills
                items={plant.sensors.map((s) => ({ key: s.key, label: s.label }))}
                value={sensor.key}
                onChange={changeSensor}
              />
            </Ctrl>
          ) : (
            <Ctrl name="Inside the box">
              <div className="row-btns">
                <button className="btn acc" onClick={shakeHidden}>Change something inside</button>
              </div>
              <div className="plot-foot" style={{ marginTop: 8 }}>
                The input stays exactly the same. Watch the output.
              </div>
            </Ctrl>
          )}
        </div>
      </div>

      <div className="stack">
        <div className="plot-wrap">
          <div className="plot-title"><span className="lbl">Input</span><PlayToggle playing={playing} setPlaying={setPlaying} /></div>
          <Canvas height={150} draw={drawU} />
        </div>
        {open ? (
          <div className="two" style={{ marginBottom: 0 }}>
            <div className="plot-wrap">
              <div className="plot-title"><span className="lbl">State <span className="math">x₁</span></span><PlayToggle playing={playing} setPlaying={setPlaying} /></div>
              <Canvas height={150} draw={drawX(0)} />
            </div>
            <div className="plot-wrap">
              <div className="plot-title"><span className="lbl">State <span className="math">x₂</span></span><PlayToggle playing={playing} setPlaying={setPlaying} /></div>
              <Canvas height={150} draw={drawX(1)} />
            </div>
          </div>
        ) : (
          <div className="hatch" style={{ height: 120 }}>
            states x₁(t), x₂(t) — hidden inside the box
          </div>
        )}
        <div className="plot-wrap">
          <div className="plot-title">
            <span className="lbl">Output</span>
            <span className="right">
              <span className="legend">
                <span><i className="sw acc" />y(t){open ? ` · ${sensor.label.toLowerCase()}` : ''}</span>
                {ghost && <span><i className="sw ghost" />{ghost.what}</span>}
              </span>
              <PlayToggle playing={playing} setPlaying={setPlaying} />
            </span>
          </div>
          <Canvas height={170} draw={drawY} />
        </div>
      </div>

      <div className="vrow">
        <div className="panel">
          {open ? (
            <div className="eqs">
              <span className="lbl">States</span>
              <div className="lines">x₁ = {plant.states[0]}, &nbsp;x₂ = {plant.states[1]}</div>
              <span className="lbl"><span className="math">f</span> · physics</span>
              <div className="lines phys">
                {plant.f[0]}<br />{plant.f[1]}
                <div className="hint">Fixed by the physics. Changing the sensor does not touch it.</div>
              </div>
              <span className="lbl"><span className="math">h</span> · sensor</span>
              <div className="lines">
                <div className="choice">{sensor.h}</div>
                <div className="hint">{sensor.device} — {sensor.note}</div>
              </div>
            </div>
          ) : (
            <div className="eqs">
              <span className="lbl">Model</span>
              <div className="lines">
                ẋ(t) = f(x(t), u(t))<br />y(t) = h(x(t), u(t))
                <div className="hint">From outside, only u and y are visible. Open the box to see x, f and h.</div>
              </div>
            </div>
          )}
        </div>
        <div>
          {open && (
            <>
              <Slider
                name={<>Initial state &nbsp;<em>x₁(0)</em></>}
                value={`${fmt(x0[0])} ${plant.stateUnits[0]}`}
                min={a0} max={a1} step={plant.x0Step[0]} v={x0[0]}
                onChange={(v) => changeX0(0, v)}
              />
              <Slider
                name={<>Initial state &nbsp;<em>x₂(0)</em></>}
                value={`${fmt(x0[1])} ${plant.stateUnits[1]}`}
                min={b0} max={b1} step={plant.x0Step[1]} v={x0[1]}
                onChange={(v) => changeX0(1, v)}
              />
            </>
          )}
          <Transport t={t} playing={playing} setPlaying={setPlaying} setT={setT} />
          {ghost && (
            <div className="row-btns" style={{ marginTop: -8 }}>
              <button className="btn" onClick={() => setGhost(null)}>Hide dashed comparison</button>
            </div>
          )}
        </div>
      </div>

      <div className="subhead">What to notice</div>
      <div className="notes">
        <p>
          <b>Closed box:</b> press “Change something inside”. The input is identical, yet the output changes. Something inside
          must remember what happened before t = 0 — that memory is the <b>state</b>. Knowing u alone is not enough; you also
          need x(0).
        </p>
        <p>
          <b>Open box, then switch the sensor:</b> the input plot and both state plots stay exactly the same, only y changes. The
          physics f is fixed; the output map h is our choice. For the car, the GPS outputs x₁, the speedometer outputs x₂, and the
          accelerometer outputs something that is not a state at all — it depends on u directly. For the pendulum, a camera sees
          l·sin θ: same states, but a nonlinear h.
        </p>
        <p>
          That is why the model ẋ = f(x, u), y = h(x, u) is not unique for a given system (Ex02): <b>the output depends on the
          chosen sensor</b>, the system underneath does not.
        </p>
      </div>
    </div>
  )
}

