import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

const MIN_SCALE = 0.4
const MAX_SCALE = 12

interface Transform {
  scale: number
  tx: number
  ty: number
}

const INITIAL: Transform = { scale: 1, tx: 0, ty: 0 }

/** Wheel-zoom + pointer-drag pan for an SVG (or any) element, no external library. */
export function useZoomPan<T extends Element>() {
  const ref = useRef<T | null>(null)
  const [transform, setTransform] = useState<Transform>(INITIAL)
  const dragState = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
      setTransform((t) => ({ ...t, scale: clamp(t.scale * factor, MIN_SCALE, MAX_SCALE) }))
    }

    const listener = onWheel as EventListener
    node.addEventListener('wheel', listener, { passive: false })
    return () => node.removeEventListener('wheel', listener)
  }, [])

  function onPointerDown(e: ReactPointerEvent) {
    dragState.current = { x: e.clientX, y: e.clientY }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: ReactPointerEvent) {
    if (!dragState.current) return
    const dx = e.clientX - dragState.current.x
    const dy = e.clientY - dragState.current.y
    dragState.current = { x: e.clientX, y: e.clientY }
    setTransform((t) => ({ ...t, tx: t.tx + dx, ty: t.ty + dy }))
  }

  function onPointerUp() {
    dragState.current = null
  }

  function zoomBy(factor: number) {
    setTransform((t) => ({ ...t, scale: clamp(t.scale * factor, MIN_SCALE, MAX_SCALE) }))
  }

  function reset() {
    setTransform(INITIAL)
  }

  return {
    ref,
    transform,
    reset,
    zoomIn: () => zoomBy(1.3),
    zoomOut: () => zoomBy(1 / 1.3),
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerLeave: onPointerUp },
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
