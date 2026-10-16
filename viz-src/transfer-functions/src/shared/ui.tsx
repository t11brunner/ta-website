import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './viz.css'

/** Mount a demo: load fonts, render, and report our height to the host iframe. */
export function mount(App: () => React.ReactNode) {
  // Fonts are added at runtime: html-inline cannot inline external <link> tags.
  const fonts = document.createElement('link')
  fonts.rel = 'stylesheet'
  fonts.href =
    'https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap'
  document.head.appendChild(fonts)

  const post = () => window.parent?.postMessage({ type: 'viz-height', height: document.documentElement.scrollHeight }, '*')
  new ResizeObserver(post).observe(document.body)

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <div className="viz">
        <App />
      </div>
    </StrictMode>,
  )
  post()
}

/** A looping clock over [0, T) that can be paused and scrubbed. */
export function useLoop(T: number, speed = 1) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1) * speed
      last = now
      setT((p) => (p + dt >= T ? 0 : p + dt))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, T])
  return { t: Math.min(t, T), setT, playing, setPlaying }
}

export function Pills<K extends string>(props: {
  items: { key: K; label: React.ReactNode }[]
  value: K | null
  onChange: (k: K) => void
  small?: boolean
}) {
  return (
    <div className={'seg' + (props.small ? ' small' : '')}>
      {props.items.map((it) => (
        <button key={it.key} className={props.value === it.key ? 'on' : ''} onClick={() => props.onChange(it.key)}>
          {it.label}
        </button>
      ))}
    </div>
  )
}

export function Ctrl(props: { name: React.ReactNode; value?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="ctrl">
      <div className="clabel">
        <span className="cname">{props.name}</span>
        {props.value !== undefined && <span className="cval">{props.value}</span>}
      </div>
      {props.children}
    </div>
  )
}

export function Slider(props: {
  name: React.ReactNode
  value: React.ReactNode
  min: number
  max: number
  step: number
  v: number
  onChange: (v: number) => void
}) {
  return (
    <Ctrl name={props.name} value={props.value}>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.v}
        onChange={(e) => props.onChange(parseFloat(e.target.value))}
      />
    </Ctrl>
  )
}

/** Small play/pause pill for the header of every animated plot. */
export function PlayToggle(props: { playing: boolean; setPlaying: (p: boolean) => void }) {
  return (
    <button className={'play' + (props.playing ? '' : ' paused')} onClick={() => props.setPlaying(!props.playing)}>
      {props.playing ? 'Pause' : 'Play'}
    </button>
  )
}

/** Time scrubber that pauses the clock while dragging. */
export function Scrub(props: { t: number; T: number; setT: (t: number) => void; setPlaying: (p: boolean) => void; name?: React.ReactNode }) {
  return (
    <Slider
      name={props.name ?? <>Time &nbsp;<em>t</em></>}
      value={`${props.t.toFixed(2)} s`}
      min={0}
      max={props.T}
      step={0.01}
      v={props.t}
      onChange={(v) => {
        props.setPlaying(false)
        props.setT(v)
      }}
    />
  )
}
