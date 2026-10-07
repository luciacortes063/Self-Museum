import {
  BookOpen,
  Crown,
  Feather,
  Filter,
  Flame,
  Flower2,
  Gem,
  Leaf,
  Moon,
  Palette,
  Pencil,
  Plus,
  Shell,
  Sparkles,
  Star
} from 'lucide-react'

import {
  useMemo,
  useRef,
  useState
} from 'react'

import type {
  Decoration,
  DecorationKind,
  Exhibit,
  Room
} from '../types'

import RoomAmbience
  from './RoomAmbience'

function DecorationIcon({
  kind
}: {
  kind: DecorationKind
}) {
  switch (kind) {
    case 'plant':
      return <Leaf />

    case 'candle':
      return <Flame />

    case 'moon':
      return <Moon />

    case 'star':
      return <Star />

    case 'books':
      return <BookOpen />

    case 'flower':
      return <Flower2 />

    case 'crystal':
      return <Gem />

    case 'shell':
      return <Shell />

    case 'crown':
      return <Crown />

    case 'feather':
      return <Feather />
  }
}

export default function RoomView({
  room,
  exhibits,
  decorations,
  selectedFilter,
  onFilter,
  onAdd,
  onEdit,
  onEditRoom,
  onMove,
  onOpenDecorationPicker,
  onEditDecoration,
  onMoveDecoration
}: {
  room: Room
  exhibits: Exhibit[]
  decorations: Decoration[]

  selectedFilter: string | null

  onFilter:
    (filter: string | null) => void

  onAdd: () => void

  onEdit:
    (item: Exhibit) => void

  onEditRoom: () => void

  onMove:
    (
      item: Exhibit,
      x: number,
      y: number
    ) => void

  onOpenDecorationPicker:
    () => void

  onEditDecoration:
    (item: Decoration) => void

  onMoveDecoration:
    (
      item: Decoration,
      x: number,
      y: number
    ) => void
}) {
  const canvasRef =
    useRef<HTMLDivElement>(null)

  const dragRef = useRef<{
    type: 'item' | 'decor'
    id: string
    startX: number
    startY: number
    moved: boolean
  } | null>(null)

  const [
    activeDrag,
    setActiveDrag
  ] = useState<string | null>(null)

  const visible =
    useMemo(
      () =>
        exhibits.filter(
          item =>
            !selectedFilter ||
            item.category ===
              selectedFilter
        ),
      [
        exhibits,
        selectedFilter
      ]
    )

  function positionFromPointer(
    e: React.PointerEvent
  ) {
    if (!canvasRef.current) {
      return null
    }

    const rect =
      canvasRef.current
        .getBoundingClientRect()

    return {
      x: Math.min(
        .94,
        Math.max(
          .06,
          (
            e.clientX -
            rect.left
          ) /
          rect.width
        )
      ),

      y: Math.min(
        .92,
        Math.max(
          .08,
          (
            e.clientY -
            rect.top
          ) /
          rect.height
        )
      )
    }
  }

  function dragStarted(
    e: React.PointerEvent,
    type:
      | 'item'
      | 'decor',
    id: string
  ) {
    e.stopPropagation()

    e.currentTarget
      .setPointerCapture(
        e.pointerId
      )

    dragRef.current = {
      type,
      id,
      startX: e.clientX,
      startY: e.clientY,
      moved: false
    }

    setActiveDrag(id)
  }

  function dragMoved(
    e: React.PointerEvent,
    item:
      | Exhibit
      | Decoration,
    type:
      | 'item'
      | 'decor'
  ) {
    const drag =
      dragRef.current

    if (
      !drag ||
      drag.id !== item.id ||
      drag.type !== type
    ) {
      return
    }

    const distance =
      Math.hypot(
        e.clientX -
          drag.startX,

        e.clientY -
          drag.startY
      )

    if (distance > 4) {
      drag.moved = true
    }

    const position =
      positionFromPointer(e)

    if (!position) return

    if (type === 'item') {
      onMove(
        item as Exhibit,
        position.x,
        position.y
      )
    } else {
      onMoveDecoration(
        item as Decoration,
        position.x,
        position.y
      )
    }
  }

  function dragEnded(
    e: React.PointerEvent,
    item:
      | Exhibit
      | Decoration,
    type:
      | 'item'
      | 'decor'
  ) {
    const drag =
      dragRef.current

    try {
      e.currentTarget
        .releasePointerCapture(
          e.pointerId
        )
    } catch {}

    setActiveDrag(null)
    dragRef.current = null

    if (
      drag &&
      !drag.moved
    ) {
      if (type === 'item') {
        onEdit(
          item as Exhibit
        )
      } else {
        onEditDecoration(
          item as Decoration
        )
      }
    }
  }

  return (
    <section
      className={
        `room room-${room.theme}`
      }
    >
      <div className="room-glow" />
      <div className="room-vignette" />

      <RoomAmbience
        theme={room.theme}
      />

      <header className="room-header">
        <div>
          <p className="eyebrow">
            EXPOSICIÓN
          </p>

          <h2>
            {room.title}
          </h2>

          {room.subtitle && (
            <p>
              {room.subtitle}
            </p>
          )}
        </div>

        <button
          className="icon-button glass"
          onClick={onEditRoom}
          aria-label="Editar sala"
        >
          <Pencil size={17} />
        </button>
      </header>

      {room.filters.length > 0 && (
        <div className="filter-strip">
          <button
            className={
              !selectedFilter
                ? 'filter-pill active'
                : 'filter-pill'
            }
            onClick={() =>
              onFilter(null)
            }
          >
            <Filter size={13} />
            Todo
          </button>

          {room.filters.map(
            filter => (
              <button
                key={filter}
                className={
                  selectedFilter ===
                  filter
                    ? 'filter-pill active'
                    : 'filter-pill'
                }
                onClick={() =>
                  onFilter(filter)
                }
              >
                {filter}
              </button>
            )
          )}
        </div>
      )}

      <div
        className="museum-canvas"
        ref={canvasRef}
      >
        {room.theme !==
          'moon-gallery' &&
          [29, 52, 75, 91].map(
            y => (
              <div
                key={y}
                className="shelf"
                style={{
                  top: `${y}%`
                }}
              />
            )
          )}

        {room.theme ===
          'moon-gallery' && (
          <>
            <div className="gallery-rail gallery-rail-a" />
            <div className="gallery-rail gallery-rail-b" />
          </>
        )}

        {decorations.map(
          decoration => (
            <div
              key={
                decoration.id
              }
              className={
                `room-decoration decor-${decoration.kind} ${
                  activeDrag ===
                  decoration.id
                    ? 'dragging'
                    : ''
                }`
              }
              style={{
                left:
                  `${
                    decoration.x *
                    100
                  }%`,

                top:
                  `${
                    decoration.y *
                    100
                  }%`,

                transform:
                  `translate(-50%, -50%) scale(${decoration.scale}) rotate(${decoration.rotation}deg)`
              }}

              onPointerDown={
                e =>
                  dragStarted(
                    e,
                    'decor',
                    decoration.id
                  )
              }

              onPointerMove={
                e =>
                  dragMoved(
                    e,
                    decoration,
                    'decor'
                  )
              }

              onPointerUp={
                e =>
                  dragEnded(
                    e,
                    decoration,
                    'decor'
                  )
              }
            >
              <DecorationIcon
                kind={
                  decoration.kind
                }
              />
            </div>
          )
        )}

        {visible.map(
          item => (
            <article
              key={item.id}
              className={
                `exhibit ${
                  activeDrag ===
                  item.id
                    ? 'dragging'
                    : ''
                }`
              }
              style={{
                left:
                  `${item.x * 100}%`,

                top:
                  `${item.y * 100}%`,

                transform:
                  `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg)`
              }}

              onPointerDown={
                e =>
                  dragStarted(
                    e,
                    'item',
                    item.id
                  )
              }

              onPointerMove={
                e =>
                  dragMoved(
                    e,
                    item,
                    'item'
                  )
              }

              onPointerUp={
                e =>
                  dragEnded(
                    e,
                    item,
                    'item'
                  )
              }
            >
              <div className="exhibit-inner">
                <div className="frame-corners" />

                {item.imageUrl ? (
                  <img
                    src={
                      item.imageUrl
                    }
                    alt={
                      item.title
                    }
                    draggable={
                      false
                    }
                  />
                ) : (
                  <div className="placeholder">
                    <Sparkles />
                  </div>
                )}

                <span>
                  {item.title}
                </span>
              </div>
            </article>
          )
        )}

        {exhibits.length ===
          0 && (
          <div className="empty-room glass">
            <Sparkles
              size={30}
            />

            <h3>
              Tu sala espera
              su primera pieza
            </h3>

            <p>
              Añade algo que forme
              parte de ti y crea
              tu propia exposición.
            </p>

            <button
              className="primary-button compact"
              onClick={onAdd}
            >
              <Plus size={16} />
              Añadir pieza
            </button>
          </div>
        )}
      </div>

      <div className="room-floating-tools">
        <button
          className="floating-decor"
          onClick={
            onOpenDecorationPicker
          }
          aria-label="Decorar sala"
        >
          <Palette size={21} />
        </button>

        <button
          className="floating-add"
          onClick={onAdd}
          aria-label="Añadir pieza"
        >
          <Plus size={25} />
        </button>
      </div>
    </section>
  )
}