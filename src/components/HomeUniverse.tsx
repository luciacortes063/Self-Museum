import { Plus, Sparkles } from 'lucide-react'
import type { Room } from '../types'

const PLANET_POSITIONS = [
  { x: 50, y: 48, size: 'xl' },
  { x: 27, y: 58, size: 'lg' },
  { x: 73, y: 44, size: 'md' },
  { x: 78, y: 70, size: 'md' },
  { x: 18, y: 44, size: 'sm' },
  { x: 62, y: 29, size: 'sm' },
  { x: 34, y: 23, size: 'sm' },
  { x: 17, y: 78, size: 'sm' },
  { x: 64, y: 78, size: 'sm' }
] as const

export default function HomeUniverse({
  rooms,
  onOpenRoom,
  onCreateRoom
}: {
  rooms: Room[]
  onOpenRoom: (room: Room) => void
  onCreateRoom: () => void
}) {
  return (
    <section className="universe-home">
      <div className="universe-copy">
        <p className="eyebrow">ORIóN</p>
        <h1>Mis Universos</h1>
        <p>
          Cada planeta es un mundo. Tócalo para entrar o crea uno nuevo.
        </p>
      </div>

      <div className="cosmos-card">
        <div className="orion-stars">
          <span className="star star-a" />
          <span className="star star-b" />
          <span className="star star-c" />
          <span className="star star-d" />
          <span className="star star-e" />
          <span className="star star-f" />
          <svg
            className="orion-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line x1="28" y1="18" x2="40" y2="27" />
            <line x1="40" y1="27" x2="50" y2="36" />
            <line x1="50" y1="36" x2="59" y2="46" />
            <line x1="59" y1="46" x2="69" y2="56" />
            <line x1="40" y1="27" x2="67" y2="22" />
          </svg>
        </div>

        <div className="cosmos-sphere">
          <div className="orbit orbit-1" />
          <div className="orbit orbit-2" />
          <div className="orbit orbit-3" />

          <div className="center-nebula" />

          {rooms.map((room, index) => {
            const pos = PLANET_POSITIONS[index % PLANET_POSITIONS.length]
            return (
              <button
                key={room.id}
                className={`planet-button planet-${pos.size}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`
                }}
                onClick={() => onOpenRoom(room)}
              >
                <span className="planet-core" />
                <span className="planet-label">{room.title}</span>
              </button>
            )
          })}

          <button
            className="add-world-button"
            onClick={onCreateRoom}
          >
            <Plus size={18} />
            Añadir Mundo
          </button>
        </div>
      </div>

      {rooms.length === 0 && (
        <div className="universe-empty">
          <Sparkles size={24} />
          <span>Aún no hay mundos creados</span>
        </div>
      )}
    </section>
  )
}