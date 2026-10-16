import { useMemo, useState } from 'react'
import { Canvas } from '../shared/Canvas'
import { evalTerms, ratMul, residues, type Rat } from '../shared/math'
import {
  ACCENT, ACCENT_FILL, INK, MUTE, dot, fillArea, fmt, frame, grid, polyline, rangeOf, tag, vline,
} from '../shared/plot'
import { RatView, S, TermsView, nf } from '../shared/tex'
import { Pills, PlayToggle, Scrub, Slider, useLoop } from '../shared/ui'

const T = 10
const N = 500
const DT = T / N
const TS = grid(0, T, N)

type InKey = 'step' | 'sine' | 'exp'
type PlantKey = 'lag' | 'msd'

const input = (k: InKey, w: number): { u: (t: number) => number; U: Rat; name: string } =>
  k === 'step'
    ? { u: () => 1, U: { num: [1], den: [1, 0] }, name: 'step' }
    : k === 'sine'
      ? { u: (t) => Math.sin(w * t), U: { num: [w], den: [1, 0, w * w] }, name: `sin(${nf(w)}t)` }
      : { u: (t) => Math.exp(-0.5 * t), U: { num: [1], den: [1, 0.5] }, name: 'e^−0.5t' }

const PLANTS: Record<PlantKey, Rat> = {
  lag: { num: [1], den: [1, 1] },
  msd: { num: [4], den: [1, 0.8, 4] },
}
const H: Rat = { num: [3], den: [1, 3] }

/** Impulse response of g, sampled on the time grid (inverse Laplace via partial fractions). */
const impulse = (g: Rat) => {
  const terms = residues(g)
  return TS.map((t) => evalTerms(terms, t))
}

/** y(t_k) = ∫₀^{t_k} g(t_k − τ) u(τ) dτ for every k, by the trapezoid rule. */
function convolve(g: Float64Array, u: Float64Array) {
  const y = new Float64Array(N + 1)
  for (let k = 1; k <= N; k++) {
    let acc = 0
    for (let i = 0; i <= k; i++) acc += g[k - i] * u[i]
    y[k] = DT * (acc - 0.5 * (g[k] * u[0] + g[0] * u[k]))
  }
  return y
}

const ops = (K: number) => (K * (K + 3)) / 2 // Σ_{k=1..K} (k + 1) multiply-adds
const big = (n: number) => Math.round(n).toLocaleString('en-US')

/** One stage of the convolution: input, flipped impulse response and their product at time t. */
function WindowPlot(props: { u: Float64Array; g: Float64Array; K: number; uName: string; gName: string; outName: string; playing: boolean; setPlaying: (p: boolean) => void }) {
  const { u, g, K } = props
  const range = useMemo(() => rangeOf([u, g], 1, 0.1), [u, g])
  const t = K * DT
  return (
    <div className="plot-wrap">
      <div className="plot-title">
        <span className="lbl">Inside the integral at <span className="math">t = {t.toFixed(2)} s</span></span>
        <span className="right">
          <span className="legend">
            <span><i className="sw" />{props.uName}(τ)</span>
            <span><i className="sw acc" />{props.gName}(t − τ)</span>
            <span><i className="sw fill" />product</span>
          </span>
          <PlayToggle playing={props.playing} setPlaying={props.setPlaying} />
        </span>
      </div>
      <Canvas
        height={170}
        draw={(ctx, w, h) => {
          const f = frame(ctx, w, h, { x: [0, T], y: range, xUnit: 's' })
          const flip = new Float64Array(K + 1)
          const prod = new Float64Array(K + 1)
          for (let i = 0; i <= K; i++) {
            flip[i] = g[K - i]
            prod[i] = u[i] * g[K - i]
          }
          fillArea(ctx, f, TS, prod, ACCENT_FILL, 0, K)
          polyline(ctx, f, TS, u, { color: INK, width: 1.8 })
          polyline(ctx, f, TS, flip, { color: ACCENT, width: 2 }, 0, K)
          vline(ctx, f, t, MUTE)
          tag(ctx, Math.min(Math.max(f.sx(t / 2), f.l + 70), f.r - 70), f.t + 16, `area = ${props.outName}(${t.toFixed(1)})`)
        }}
      />
      <div className="plot-foot">
        The block's impulse response is flipped and slid to time t. Multiply it with {props.uName} point by point and add everything up: the shaded area is {props.outName}(t). Every new t needs a fresh integral.
      </div>
    </div>
  )
}

function OutputPlot(props: { yConv: Float64Array; yExact: Float64Array; K: number; name: string; last: boolean }) {
  const { yConv, yExact, K } = props
  const range = useMemo(() => rangeOf([yExact], 0.5), [yExact])
  return (
    <div className="plot-wrap">
      <div className="plot-title">
        <span className="lbl">{props.last ? 'Output' : 'Intermediate signal'} &nbsp;·&nbsp; <span className="math">{props.name}(t)</span></span>
        <span className="legend">
          <span><i className="sw acc" />convolution, step by step</span>
          <span><i className="sw ghost" />from the s-domain</span>
        </span>
      </div>
      <Canvas
        height={150}
        draw={(ctx, w, h) => {
          const f = frame(ctx, w, h, { x: [0, T], y: range, xUnit: 's' })
          polyline(ctx, f, TS, yExact, { color: MUTE, width: 1.5, dash: [5, 4] })
          polyline(ctx, f, TS, yConv, { color: ACCENT, width: 2.2 }, 0, K)
          dot(ctx, f.sx(K * DT), f.sy(yConv[K]), ACCENT)
        }}
      />
    </div>
  )
}

/** ∫ from 0 to t, with the limits stacked beside the sign. */
function Int() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', margin: '0 2px' }}>
      <span style={{ fontSize: '1.5em', lineHeight: 1 }}>∫</span>
      <span style={{ display: 'inline-flex', flexDirection: 'column', fontSize: '0.65em', lineHeight: 1.15, marginLeft: 1 }}>
        <i>t</i>
        <span>0</span>
      </span>
    </span>
  )
}

function Block(props: { name: string; g: Rat; sym: string }) {
  return (
    <div className="block sm">
      <span className="lbl">{props.name}</span>
      <span className="fx">
        <i>{props.sym}</i>(<S />) = <RatView num={props.g.num} den={props.g.den} />
      </span>
    </div>
  )
}

export default function App() {
  const [inKey, setInKey] = useState<InKey>('step')
  const [w, setW] = useState(1.5)
  const [plantKey, setPlantKey] = useState<PlantKey>('msd')
  const [chain, setChain] = useState(false)
  const clock = useLoop(T, 1)
  const K = Math.min(N, Math.round(clock.t / DT))

  const inp = input(inKey, w)
  const G = PLANTS[plantKey]
  const sim = useMemo(() => {
    const u = TS.map(inp.u)
    const g = impulse(G)
    const v = convolve(g, u)
    const V = ratMul(G, inp.U)
    const vTerms = residues(V)
    const vExact = TS.map((t) => evalTerms(vTerms, t))
    const h = impulse(H)
    const y = convolve(h, v)
    const Y = ratMul(H, V)
    const yTerms = residues(Y)
    const yExact = TS.map((t) => evalTerms(yTerms, t))
    return { u, g, v, V, vTerms, vExact, h, y, Y, yTerms, yExact }
  }, [inKey, w, plantKey])

  const uTex =
    inKey === 'step' ? <>1</> : inKey === 'sine' ? <>sin({nf(w)}<i>t</i>)</> : <>e<sup>−0.5<i>t</i></sup></>
  const Yrat = chain ? sim.Y : sim.V
  const terms = chain ? sim.yTerms : sim.vTerms
  const stages = chain ? 2 : 1
  const opsNow = stages * ops(K)
  const opsAll = stages * ops(N)
  // coefficient products when multiplying the fractions, numerators and denominators
  const mulCost = (a: Rat, b: Rat) => a.num.length * b.num.length + a.den.length * b.den.length
  const sCost = mulCost(G, inp.U) + (chain ? mulCost(H, sim.V) : 0)

  return (
    <>
      <p className="intro">
        In the time domain, every block acts on its input through a <b>convolution integral</b>. In the s-domain, the same block just <b>multiplies</b>. Watch the integral being evaluated at every instant on the left, while the s-domain gets the whole answer with one multiplication on the right. Both give the same curve.
      </p>

      <div className="ctrls-row">
        <div className="ctrl">
          <div className="clabel"><span className="cname">Input &nbsp;<em>u(t)</em></span></div>
          <Pills
            items={[
              { key: 'step', label: 'Step' },
              { key: 'sine', label: 'Sine' },
              { key: 'exp', label: 'Decaying exp.' },
            ]}
            value={inKey}
            onChange={setInKey}
          />
        </div>
        <div className="ctrl">
          <div className="clabel"><span className="cname">Plant &nbsp;<em>G(s)</em></span></div>
          <Pills
            items={[
              { key: 'lag', label: 'First-order lag' },
              { key: 'msd', label: 'Mass-spring-damper' },
            ]}
            value={plantKey}
            onChange={setPlantKey}
          />
        </div>
        <div className="ctrl">
          <div className="clabel"><span className="cname">Blocks</span></div>
          <Pills
            items={[
              { key: 'one', label: 'One block' },
              { key: 'two', label: 'Two in series' },
            ]}
            value={chain ? 'two' : 'one'}
            onChange={(k) => setChain(k === 'two')}
          />
        </div>
        {inKey === 'sine' && (
          <div className="ctrl">
            <Slider name={<>Input frequency &nbsp;<em>ω</em></>} value={`${w.toFixed(1)} rad/s`} min={0.5} max={4} step={0.1} v={w} onChange={setW} />
          </div>
        )}
        <div className="ctrl">
          <Scrub t={clock.t} T={T} setT={clock.setT} setPlaying={clock.setPlaying} />
        </div>
      </div>

      <div className="strip" style={{ gridTemplateColumns: chain ? 'auto 1fr auto 1fr auto 1fr auto 1fr auto' : 'auto 1fr auto 1fr auto' }}>
        <span className="sig">u</span>
        <span className="wire" />
        <Block name="Plant" g={G} sym="G" />
        <span className={'wire' + (chain ? '' : ' y')} />
        {chain && (
          <>
            <span className="sig">v</span>
            <span className="wire" />
            <Block name="Second block" g={H} sym="H" />
            <span className="wire y" />
          </>
        )}
        <span className="sig y">y</span>
      </div>

      <div className="panel" style={{ marginBottom: 22 }}>
        <div className="eqs">
          <span className="lbl">Time response</span>
          <div className="lines fx">
            <div>
              <i>y</i><sub>F</sub>(<i>t</i>) = <Int /> <i>C</i>e<sup><i>A</i>(<i>t</i>−<i>τ</i>)</sup><i>B</i>&thinsp;<i>u</i>(<i>τ</i>) d<i>τ</i> + <i>D</i>&thinsp;<i>u</i>(<i>t</i>)
              <span className="soft" style={{ fontSize: 13, marginLeft: 12 }}>forced response, <i>x</i>(0) = 0</span>
            </div>
            <div className="choice">
              = <Int /> <i>g</i>(<i>t</i>−<i>τ</i>)&thinsp;<i>u</i>(<i>τ</i>) d<i>τ</i> = (<i>g</i> ∗ <i>u</i>)(<i>t</i>), &ensp; with <i>g</i>(<i>t</i>) = <i>C</i>e<sup><i>At</i></sup><i>B</i>
            </div>
            <div className="hint">
              The integrand <i>C</i>e<sup><i>A</i>(<i>t</i>−<i>τ</i>)</sup><i>B</i> is the impulse response <i>g</i>, shifted to <i>t</i>. Both plants here are strictly proper, so <i>D</i> = 0. The time-domain column below evaluates exactly this integral, again for every <i>t</i>.
            </div>
          </div>
        </div>
      </div>

      <div className="vrow">
        <div className="stack" style={{ marginBottom: 0 }}>
          <div className="lbl" style={{ marginBottom: -4 }}>Time domain &nbsp;·&nbsp; <span className="math">y = g ∗ u</span> &nbsp;(convolution)</div>
          <WindowPlot u={sim.u} g={sim.g} K={K} uName="u" gName="g" outName={chain ? 'v' : 'y'} playing={clock.playing} setPlaying={clock.setPlaying} />
          <OutputPlot yConv={sim.v} yExact={sim.vExact} K={K} name={chain ? 'v' : 'y'} last={!chain} />
          {chain && (
            <>
              <WindowPlot u={sim.v} g={sim.h} K={K} uName="v" gName="h" outName="y" playing={clock.playing} setPlaying={clock.setPlaying} />
              <OutputPlot yConv={sim.y} yExact={sim.yExact} K={K} name="y" last />
            </>
          )}
        </div>

        <div className="stack" style={{ marginBottom: 0 }}>
          <div className="lbl" style={{ marginBottom: -4 }}>s-domain &nbsp;·&nbsp; <span className="math">Y = G · U</span> &nbsp;(multiplication)</div>
          <div className="panel fx">
            <div className="fx-row">
              <span className="tagname"><i>U</i>(<S />)</span><span>= ℒ{'{'}<i>u</i>(<i>t</i>){'}'} = ℒ{'{'}{uTex}{'}'} = <RatView num={inp.U.num} den={inp.U.den} /></span>
              <span className="soft" style={{ fontSize: 13 }}>Laplace transform of the input, from the table</span>
            </div>
            <div className="fx-row">
              <span className="tagname"><i>G</i>(<S />)</span><span>= <RatView num={G.num} den={G.den} /></span>
            </div>
            {chain && (
              <div className="fx-row">
                <span className="tagname"><i>H</i>(<S />)</span><span>= <RatView num={H.num} den={H.den} /></span>
              </div>
            )}
            <div className="fx-row acc">
              <span className="tagname"><i>Y</i>(<S />)</span><span>= {chain && <><i>H</i>·</>}<i>G</i>·<i>U</i> = <RatView num={Yrat.num} den={Yrat.den} /></span>
            </div>
            <div className="lbl" style={{ margin: '16px 0 6px' }}>Back to time: <span className="math">y(t) = ℒ⁻¹{'{'}Y(s){'}'}</span>, by partial fractions and the table, term by term</div>
            <div className="fx-row" style={{ fontSize: 15 }}>
              <span><TermsView terms={terms} /></span>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="lbl">Convolution</div>
                <div className="big">{big(opsNow)}</div>
                <div className="small">multiply-adds so far, {big(opsAll)} for the full plot</div>
                <div className="bar"><div style={{ width: `${(100 * opsNow) / opsAll}%` }} /></div>
              </div>
              <div className="stat acc">
                <div className="lbl">Multiplication</div>
                <div className="big">{sCost}</div>
                <div className="small">coefficient products, then one table row per pole</div>
              </div>
            </div>
            <div className="callout" style={{ fontSize: 14 }}>
              The dashed curves on the left are this formula. The convolution reaches the same values, but only after {big(opsAll)} operations, and the cost grows with the square of the time span{chain ? ' and doubles with every block' : ''}. Try <b>Two in series</b>: on the left the whole intermediate signal v(t) has to exist before the second block can start, on the right you just multiply once more.
            </div>
          </div>
        </div>
      </div>
      <p className="plot-foot" style={{ marginTop: 4 }}>
        Input {inp.name}, sampled every {DT} s. Convolution theorem: ℒ{'{'}g ∗ u{'}'} = G(s)·U(s).
        {' '}Max. difference between the two curves: {fmt(Math.max(...Array.from(chain ? sim.y : sim.v, (v, i) => Math.abs(v - (chain ? sim.yExact : sim.vExact)[i]))), 4)}.
      </p>
    </>
  )
}
