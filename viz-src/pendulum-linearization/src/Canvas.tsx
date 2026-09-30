import { useEffect, useRef, useState } from 'react'

interface Props {
  height: number
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  onPointer?: (x: number, y: number, w: number, h: number) => void
  cursor?: string
}

/** A DPR-aware canvas that redraws on every render and on resize. */
export function Canvas({ height, draw, onPointer, cursor }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current!
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = ref.current!
    if (!width) return
    const dpr = window.devicePixelRatio || 1
    el.width = Math.round(width * dpr)
    el.height = Math.round(height * dpr)
    const ctx = el.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    draw(ctx, width, height)
  })

  const handle = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onPointer) return
    if (e.type === 'pointermove' && e.buttons === 0) return
    const r = e.currentTarget.getBoundingClientRect()
    onPointer(e.clientX - r.left, e.clientY - r.top, r.width, r.height)
  }

  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height, display: 'block', cursor, touchAction: onPointer ? 'none' : undefined }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        handle(e)
      }}
      onPointerMove={handle}
    />
  )
}
