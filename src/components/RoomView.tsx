import { useMemo, useRef, useState } from 'react'
import { Filter, Pencil, Plus, Sparkles } from 'lucide-react'
import type { Exhibit, Room } from '../types'

export default function RoomView({
  room,
  exhibits,
  selectedFilter,
  onFilter,
  onAdd,
  onEdit,
  onEditRoom,
  onMove
}: {
  room: Room
  exhibits: Exhibit[]
  selectedFilter: string | null
  onFilter: (filter: string | null) => void
  onAdd: () => void
  onEdit: (item: Exhibit) => void
  onEditRoom: () => void
  onMove: (item: Exhibit, x: number, y: number) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)

  const visible = useMemo(
    () => exhibits.filter(x => !selectedFilter || x.category === selectedFilter),
    [exhibits, selectedFilter]
  )

  function pointerMove(e: React.PointerEvent, item: Exhibit) {
    if (dragging !== item.id || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.min(.92, Math.max(.08, (e.clientX - rect.left) / rect.width))
    const y = Math.min(.90, Math.max(.14, (e.clientY - rect.top) / rect.height))
    onMove(item, x, y)
  }

  return (
    <section className={`room room-${room.theme}`}>
      <div className="room-glow" />
      <div className="room-vignette" />

      <header className="room-header">
        <div>
          <p className="eyebrow">SALA</p>
          <h2>{room.title}</h2>
          {room.subtitle && <p>{room.subtitle}</p>}
        </div>
        <button className="icon-button glass" onClick={onEditRoom} aria-label="Editar sala">
          <Pencil size={17} />
        </button>
      </header>

      {room.filters.length > 0 && (
        <div className="filter-strip">
          <button className={!selectedFilter ? 'filter-pill active' : 'filter-pill'} onClick={() => onFilter(null)}>
            <Filter size={13} /> Todo
          </button>
          {room.filters.map(filter => (
            <button
              key={filter}
              className={selectedFilter === filter ? 'filter-pill active' : 'filter-pill'}
              onClick={() => onFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      <div className="museum-canvas" ref={canvasRef}>
        <div className="fantasy-window"><span /><span /><span /></div>
        <div className="floating-motes" />
        {[23, 45, 67, 86].map(y => <div key={y} className="shelf" style={{ top: `${y}%` }} />)}

        {visible.map(item => (
          <article
            key={item.id}
            className={`exhibit ${dragging === item.id ? 'dragging' : ''}`}
            style={{
              left: `${item.x * 100}%`,
              top: `${item.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg)`
            }}
            onPointerDown={e => {
              e.currentTarget.setPointerCapture(e.pointerId)
              setDragging(item.id)
            }}
            onPointerMove={e => pointerMove(e, item)}
            onPointerUp={e => {
              e.currentTarget.releasePointerCapture(e.pointerId)
              setDragging(null)
            }}
            onDoubleClick={() => onEdit(item)}
          >
            <button className="exhibit-inner" onClick={() => !dragging && onEdit(item)}>
              <div className="frame-corners" />
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} draggable={false} />
              ) : (
                <div className="placeholder"><Sparkles /></div>
              )}
              <span>{item.title}</span>
            </button>
          </article>
        ))}

        {exhibits.length === 0 && (
          <div className="empty-room glass">
            <Sparkles size={30} />
            <h3>Tu sala espera su primera pieza</h3>
            <p>Añade algo que forme parte de ti y colócalo donde quieras.</p>
            <button className="primary-button compact" onClick={onAdd}><Plus size={16}/> Añadir pieza</button>
          </div>
        )}
      </div>

      <button className="floating-add" onClick={onAdd} aria-label="Añadir pieza">
        <Plus size={25} />
      </button>
    </section>
  )
}
