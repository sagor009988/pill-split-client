import React, { useState, useRef } from 'react'
import Pill from './components/Pill'
import { generateId } from './utils/generatedId'

const MIN_SIZE = 20
const MIN_DRAW_SIZE = 40

const App = () => {
  const [pills, setPills] = useState([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const drawingRef = useRef(null)
  const startPosRef = useRef(null)
  const draggingRef = useRef({ id: null, offsetX: 0, offsetY: 0 })
  const isDragging = useRef(false)
  const dragMoved = useRef(false) // track if mouse moved after mouseDown

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)]
    return color
  }

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY })

    if (startPosRef.current) {
      const { x, y } = startPosRef.current
      const width = Math.max(MIN_DRAW_SIZE, e.clientX - x)
      const height = Math.max(MIN_DRAW_SIZE, e.clientY - y)

      drawingRef.current = {
        ...drawingRef.current,
        width,
        height,
      }

      setPills((prev) => [...prev.slice(0, -1), { ...drawingRef.current, width, height }])
    }

    if (draggingRef.current.id) {
      isDragging.current = true
      dragMoved.current = true

      setPills((prev) =>
        prev.map((pill) =>
          pill.id === draggingRef.current.id
            ? {
                ...pill,
                x: e.clientX - draggingRef.current.offsetX,
                y: e.clientY - draggingRef.current.offsetY,
              }
            : pill
        )
      )
    }
  }

  const handleMouseDown = (e) => {
    dragMoved.current = false

    // Check if clicked on pill to drag it
    const clickedOnPill = pills.some(
      (pill) =>
        e.clientX >= pill.x &&
        e.clientX <= pill.x + pill.width &&
        e.clientY >= pill.y &&
        e.clientY <= pill.y + pill.height
    )
    if (clickedOnPill) return

    startPosRef.current = { x: e.clientX, y: e.clientY }

    const newPill = {
      id: generateId(),
      x: e.clientX,
      y: e.clientY,
      width: MIN_DRAW_SIZE,
      height: MIN_DRAW_SIZE,
      color: getRandomColor(),
      borderRadius: { tl: true, tr: true, bl: true, br: true },
    }

    drawingRef.current = newPill
    setPills((prev) => [...prev, newPill])
  }

  const handleMouseUp = () => {
    startPosRef.current = null
    drawingRef.current = null
    draggingRef.current = { id: null, offsetX: 0, offsetY: 0 }
    isDragging.current = false
  }

  const handleSplit = () => {
    // Only split if NOT dragging and mouse did NOT move (click without drag)
    if (isDragging.current || dragMoved.current) return

    const splitX = mousePos.x
    const splitY = mousePos.y

    setPills((prev) => {
      const newPills = []

      prev.forEach((pill) => {
        const pillRight = pill.x + pill.width
        const pillBottom = pill.y + pill.height

        const intersectV = splitX > pill.x && splitX < pillRight
        const intersectH = splitY > pill.y && splitY < pillBottom

        if (!intersectV && !intersectH) {
          newPills.push(pill)
          return
        }

        // Prevent splitting if pill is already at or below minimum size in any dimension
        if (pill.width <= MIN_SIZE || pill.height <= MIN_SIZE) {
          newPills.push(pill)
          return
        }

        // Vertical split
        if (intersectV && pill.width > MIN_SIZE * 2) {
          const leftWidth = splitX - pill.x
          const rightWidth = pill.width - leftWidth

          if (leftWidth >= MIN_SIZE) {
            newPills.push({
              ...pill,
              id: generateId(),
              width: leftWidth,
              borderRadius: {
                tl: pill.borderRadius.tl,
                bl: pill.borderRadius.bl,
                tr: false,
                br: false,
              },
            })
          }

          if (rightWidth >= MIN_SIZE) {
            newPills.push({
              ...pill,
              id: generateId(),
              x: splitX,
              width: rightWidth,
              borderRadius: {
                tr: pill.borderRadius.tr,
                br: pill.borderRadius.br,
                tl: false,
                bl: false,
              },
            })
          }

          return
        }

        // Horizontal split
        if (intersectH && pill.height > MIN_SIZE * 2) {
          const topHeight = splitY - pill.y
          const bottomHeight = pill.height - topHeight

          if (topHeight >= MIN_SIZE) {
            newPills.push({
              ...pill,
              id: generateId(),
              height: topHeight,
              borderRadius: {
                tl: pill.borderRadius.tl,
                tr: pill.borderRadius.tr,
                bl: false,
                br: false,
              },
            })
          }

          if (bottomHeight >= MIN_SIZE) {
            newPills.push({
              ...pill,
              id: generateId(),
              y: splitY,
              height: bottomHeight,
              borderRadius: {
                bl: pill.borderRadius.bl,
                br: pill.borderRadius.br,
                tl: false,
                tr: false,
              },
            })
          }

          return
        }

        // Too small to split, move aside
        newPills.push({ ...pill, x: pill.x + 10, y: pill.y + 10 })
      })

      return newPills
    })
  }

  const handleDragStart = (e, id) => {
    const pill = pills.find((p) => p.id === id)
    if (!pill) return

    draggingRef.current = {
      id,
      offsetX: e.clientX - pill.x,
      offsetY: e.clientY - pill.y,
    }
  }

  return (
    <div
      className="w-screen h-screen bg-gray-100 relative"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleSplit}
      style={{ userSelect: 'none' }}
    >
      {pills.map((pill) => (
        <Pill key={pill.id} pill={pill} onDrag={handleDragStart} />
      ))}

      {/* Split lines */}
      <div
        className="absolute top-0 h-full w-[4px] bg-red-500 opacity-50 pointer-events-none"
        style={{ left: mousePos.x - 2 }}
      />
      <div
        className="absolute left-0 w-full h-[4px] bg-red-500 opacity-50 pointer-events-none"
        style={{ top: mousePos.y - 2 }}
      />
    </div>
  )
}

export default App
