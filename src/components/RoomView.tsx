import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Filter,
  ImagePlus,
  PencilLine,
  Sparkles
} from 'lucide-react'

import type {
  Exhibit,
  Room,
  ShelfTemplate
} from '../types'

export default function RoomView({
  room,
  template,
  exhibits,
  selectedFilter,
  onFilter,
  onAddExhibit,
  onEditRoom,
  onEditExhibit,
  onMoveExhibit
}: {
  room: Room
  template?: ShelfTemplate
  exhibits: Exhibit[]
  selectedFilter: string | null
  onFilter: (value: string | null) => void
  onAddExhibit: () => void
  onEditRoom: () => void
  onEditExhibit: (item: Exhibit) => void
  onMoveExhibit: (
    item: Exhibit,
    x: number,
    y: number,
    pageIndex: number
  ) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const [viewportWidth, setViewportWidth] = useState(390)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const dragRef = useRef<{
    id: string
    startX: number
    startY: number
    moved: boolean
  } | null>(null)

  useEffect(() => {
    if (!scrollRef.current) return

    const node = scrollRef.current

    const update = () => {
      setViewportWidth(node.clientWidth)
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const visibleExhibits = useMemo(() => {
    if (!selectedFilter) return exhibits

    return exhibits.filter(
      item => item.category === selectedFilter
    )
  }, [exhibits, selectedFilter])

  const aspectRatio = template?.aspectRatio ?? 0.5625
  const segmentHeight = Math.max(
    540,
    viewportWidth / aspectRatio
  )
  const totalHeight = segmentHeight * room.segments

  function startDrag(
    e: React.PointerEvent,
    item: Exhibit
  ) {
    e.stopPropagation()

    e.currentTarget.setPointerCapture(e.pointerId)

    dragRef.current = {
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      moved: false
    }

    setActiveDragId(item.id)
  }

  function updateDrag(
    e: React.PointerEvent,
    item: Exhibit
  ) {
    if (
      !scrollRef.current ||
      !dragRef.current ||
      dragRef.current.id !== item.id
    ) {
      return
    }

    const distance = Math.hypot(
      e.clientX - dragRef.current.startX,
      e.clientY - dragRef.current.startY
    )

    if (distance > 4) {
      dragRef.current.moved = true
    }

    const rect =
      scrollRef.current.getBoundingClientRect()

    const scrollTop =
      scrollRef.current.scrollTop

    const rawX =
      (e.clientX - rect.left) /
      rect.width

    const x = Math.min(
      0.9,
      Math.max(0.1, rawX)
    )

    const contentY =
      scrollTop +
      (e.clientY - rect.top)

    const boundedY = Math.min(
      totalHeight - 20,
      Math.max(0, contentY)
    )

    const pageIndex = Math.min(
      room.segments - 1,
      Math.max(
        0,
        Math.floor(
          boundedY / segmentHeight
        )
      )
    )

    const localY =
      (
        boundedY -
        pageIndex * segmentHeight
      ) /
      segmentHeight

    const y = Math.min(
      0.94,
      Math.max(0.06, localY)
    )

    onMoveExhibit(
      item,
      x,
      y,
      pageIndex
    )
  }

  function endDrag(
    e: React.PointerEvent,
    item: Exhibit
  ) {
    try {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      )
    } catch {}

    const drag = dragRef.current

    dragRef.current = null
    setActiveDragId(null)

    if (drag && !drag.moved) {
      onEditExhibit(item)
    }
  }

  if (!template) {
    return (
      <section className="empty-room">
        <div>
          <Sparkles size={30} />
          <h3>Esta sala no tiene plantilla</h3>
          <p>
            Edita la sala y elige una imagen de estantería.
          </p>

          <button
            className="primary-button"
            onClick={onEditRoom}
          >
            <PencilLine size={16} />
            Editar sala
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="room-stage">
      <header className="room-header">
        <div>
          <p className="eyebrow">
            EXPOSITOR
          </p>

          <h2>
            {room.title}
          </h2>

          {room.subtitle && (
            <p>{room.subtitle}</p>
          )}
        </div>
      </header>

      {room.filters.length > 0 && (
        <div className="filter-strip">
          <button
            className={
              !selectedFilter
                ? 'filter-pill active'
                : 'filter-pill'
            }
            onClick={() => onFilter(null)}
          >
            <Filter size={14} />
            Todo
          </button>

          {room.filters.map(filter => (
            <button
              key={filter}
              className={
                selectedFilter === filter
                  ? 'filter-pill active'
                  : 'filter-pill'
              }
              onClick={() =>
                onFilter(filter)
              }
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      <div
        className="room-scroll"
        ref={scrollRef}
      >
        <div
          className="room-content"
          style={{ height: totalHeight }}
        >
          {Array.from({
            length: room.segments
          }).map((_, index) => (
            <div
              key={index}
              className="template-segment"
              style={{
                top:
                  index *
                  segmentHeight,
                height:
                  segmentHeight
              }}
            >
              <img
                src={template.imageUrl}
                alt={template.name}
                draggable={false}
              />
            </div>
          ))}

          {visibleExhibits.map(
            item => {
              const top =
                item.pageIndex *
                  segmentHeight +
                item.y *
                  segmentHeight

              return (
                <article
                  key={item.id}
                  className={
                    `exhibit-card ${
                      activeDragId ===
                      item.id
                        ? 'dragging'
                        : ''
                    }`
                  }
                  style={{
                    left:
                      `${item.x * 100}%`,
                    top,
                    transform:
                      `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg)`
                  }}
                  onPointerDown={e =>
                    startDrag(e, item)
                  }
                  onPointerMove={e =>
                    updateDrag(e, item)
                  }
                  onPointerUp={e =>
                    endDrag(e, item)
                  }
                  onPointerCancel={e =>
                    endDrag(e, item)
                  }
                >
                  <div className="exhibit-inner">
                    <img
                      src={item.imageDataUrl}
                      alt={item.title}
                      draggable={false}
                    />

                    <span>
                      {item.title}
                    </span>
                  </div>
                </article>
              )
            }
          )}

          {exhibits.length === 0 && (
            <div className="empty-overlay">
              <Sparkles size={28} />

              <h3>
                Tu estantería está vacía
              </h3>

              <p>
                Sube imágenes y arrástralas
                donde quieras.
              </p>

              <button
                className="primary-button compact"
                onClick={onAddExhibit}
              >
                <ImagePlus size={16} />
                Añadir imagen
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="room-floating-actions">
        <button
          className="soft-button"
          onClick={onEditRoom}
        >
          <PencilLine size={16} />
          Editar
        </button>

        <button
          className="primary-button floating-add"
          onClick={onAddExhibit}
        >
          <ImagePlus size={17} />
          Añadir
        </button>
      </div>
    </section>
  )
}
