import { useEffect } from 'react'
import BoxTab from './BoxTab'
import './viz.css'

export default function App() {
  // tell the host page how tall we are so its iframe can fit us
  useEffect(() => {
    const post = () =>
      window.parent?.postMessage({ type: 'viz-height', height: document.documentElement.scrollHeight }, '*')
    const ro = new ResizeObserver(post)
    ro.observe(document.body)
    post()
    return () => ro.disconnect()
  }, [])

  return (
    <div className="viz">
      <BoxTab />
    </div>
  )
}
