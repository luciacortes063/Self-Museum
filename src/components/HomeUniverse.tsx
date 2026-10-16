import { useEffect, useMemo, useRef } from 'react'
import { Plus } from 'lucide-react'
import type { Room, WorldMotion } from '../types'

function fallbackMotion(index: number): WorldMotion {
  const slots = [
    [18, 35], [78, 32], [17, 53], [83, 50],
    [21, 72], [78, 72], [42, 42], [62, 58],
    [36, 80], [67, 82], [32, 61], [69, 42]
  ]
  const [anchorX, anchorY] = slots[index % slots.length]
  return {
    anchorX,
    anchorY,
    radiusX: 3.5 + (index % 4) * 1.35,
    radiusY: 2.8 + (index % 3) * 1.15,
    duration: 26 + (index % 6) * 4.5,
    phase: (index * 1.13) % (Math.PI * 2),
    kind: index % 3 === 1 ? 'semicircle' : 'circle'
  }
}

function MovingWorld({
  room,
  index,
  onOpenRoom
}: {
  room: Room
  index: number
  onOpenRoom: (room: Room) => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const motion = room.worldMotion ?? fallbackMotion(index)

  useEffect(() => {
    const node = buttonRef.current
    if (!node) return

    let frame = 0
    let start = 0

    const animate = (time: number) => {
      if (!start) start = time
      const elapsed = (time - start) / 1000
      const viewportWidth = Math.min(window.innerWidth, 620)
      const viewportHeight = window.innerHeight
      const radiusX = viewportWidth * motion.radiusX / 100
      const radiusY = viewportHeight * motion.radiusY / 100

      let dx = 0
      let dy = 0
      let opacity = 1

      if (motion.kind === 'semicircle') {
        const phaseOffset = ((motion.phase / (Math.PI * 2)) % 1 + 1) % 1
        const progress = ((elapsed / motion.duration) + phaseOffset) % 1

        if (progress < 0.90) {
          const u = progress / 0.90
          const theta = motion.phase - Math.PI * u
          dx = Math.cos(theta) * radiusX
          dy = Math.sin(theta) * radiusY

          if (u > 0.82) {
            opacity = Math.max(0, 1 - (u - 0.82) / 0.18)
          }
        } else {
          const reset = (progress - 0.90) / 0.10
          const theta = motion.phase
          dx = Math.cos(theta) * radiusX
          dy = Math.sin(theta) * radiusY
          opacity = Math.min(1, reset * 1.35)
        }
      } else {
        const theta = motion.phase - (elapsed / motion.duration) * Math.PI * 2
        dx = Math.cos(theta) * radiusX
        dy = Math.sin(theta) * radiusY
      }

      node.style.transform =
        `translate(-50%, -50%) translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`
      node.style.opacity = String(opacity)
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [motion])

  const image = room.worldImageUrl || '/worlds/libros.webp'
  const size = Math.round(106 * (room.worldScale ?? 1))

  return (
    <div
      className="world-anchor"
      style={{
        left: `${motion.anchorX}%`,
        top: `${motion.anchorY}%`
      }}
    >
      <button
        ref={buttonRef}
        className="moving-world"
        onClick={() => onOpenRoom(room)}
        aria-label={`Abrir ${room.title}`}
        style={{ width: `${size}px` }}
      >
        <img src={image} alt="" draggable={false} />
        <span>{room.title}</span>
      </button>
    </div>
  )
}

export default function HomeUniverse({
  rooms,
  onOpenRoom,
  onCreateRoom
}: {
  rooms: Room[]
  onOpenRoom: (room: Room) => void
  onCreateRoom: () => void
}) {
  const ordered = useMemo(() => rooms, [rooms])

  return (
    <section className="universe-home" aria-label="Mis Universos">
      <img
        className="universe-background"
        src="/universe/orion-background.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <div className="universe-shade" />

      <div className="worlds-layer">
        {ordered.map((room, index) => (
          <MovingWorld
            key={room.id}
            room={room}
            index={index}
            onOpenRoom={onOpenRoom}
          />
        ))}
      </div>

      <button className="add-world-button" onClick={onCreateRoom}>
        <Plus size={18} />
        Añadir Mundo
      </button>
    </section>
  )
}
