import { useEffect, useState } from 'react'
import { T_END } from './sim'

/** A looping clock over [0, T_END] that can be paused and scrubbed. */
export function useClock(speed = 1) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1) * speed
      last = now
      setT((p) => (p + dt >= T_END ? 0 : p + dt))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed])
  return { t, setT, playing, setPlaying }
}

export function Pills<K extends string>(props: {
  items: { key: K; label: React.ReactNode }[]
  value: K
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
  value: string
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

export function Transport(props: { t: number; playing: boolean; setPlaying: (p: boolean) => void; setT: (t: number) => void }) {
  return (
    <div className="ctrl">
      <div className="clabel">
        <span className="cname">Time &nbsp;<em>t</em></span>
        <span className="cval">{props.t.toFixed(2)} s</span>
      </div>
      <input
        type="range"
        min={0}
        max={T_END}
        step={0.01}
        value={props.t}
        onChange={(e) => {
          props.setPlaying(false)
          props.setT(parseFloat(e.target.value))
        }}
      />
      <div className="row-btns" style={{ marginTop: 12 }}>
        <button className="btn" onClick={() => props.setPlaying(!props.playing)}>{props.playing ? 'Pause' : 'Play'}</button>
        <button className="btn" onClick={() => props.setT(0)}>Restart</button>
      </div>
    </div>
  )
}
