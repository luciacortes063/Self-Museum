import {
  Orbit,
  Sparkles
} from 'lucide-react'

import type {
  Exhibit,
  Room
} from '../types'

const orionStars = [
  {
    x: 50,
    y: 7,
    r: 5,
    name: 'Meissa'
  },
  {
    x: 27,
    y: 20,
    r: 6,
    name: 'Betelgeuse'
  },
  {
    x: 72,
    y: 22,
    r: 5,
    name: 'Bellatrix'
  },
  {
    x: 43,
    y: 44,
    r: 4,
    name: 'Mintaka'
  },
  {
    x: 51,
    y: 48,
    r: 4,
    name: 'Alnilam'
  },
  {
    x: 60,
    y: 52,
    r: 4,
    name: 'Alnitak'
  },
  {
    x: 26,
    y: 78,
    r: 5,
    name: 'Saiph'
  },
  {
    x: 74,
    y: 83,
    r: 6,
    name: 'Rigel'
  }
]

export default function Orion({
  rooms,
  exhibits,
  onOpenRoom
}: {
  rooms: Room[]
  exhibits: Exhibit[]
  onOpenRoom:
    (id: string) => void
}) {
  return (
    <div className="constellation-page">
      <div className="starfield" />
      <div className="orion-nebula" />

      <header className="constellation-title">
        <p className="eyebrow">
          MI UNIVERSO
        </p>

        <h2>
          Orión
        </h2>

        <p>
          Una constelación que
          sostiene todos tus mundos.
        </p>
      </header>

      <div className="orion-stage">
        <svg
          viewBox="0 0 100 100"
          className="orion-lines"
          aria-hidden="true"
        >
          <path
            d="
              M50 7
              L27 20
              L43 44
              L51 48
              L60 52
              L72 22
              L50 7

              M43 44
              L26 78

              M60 52
              L74 83
            "
          />
        </svg>

        {orionStars.map(
          star => (
            <div
              key={
                star.name
              }
              className="orion-star"
              title={star.name}
              style={{
                left:
                  `${star.x}%`,
                top:
                  `${star.y}%`,
                width:
                  star.r * 2,
                height:
                  star.r * 2
              }}
            >
              <span>
                {star.name}
              </span>
            </div>
          )
        )}

        <div className="you-core">
          <div className="you-ring" />
          <div className="you-ring you-ring-two" />

          <Sparkles
            size={24}
          />

          <strong>
            YO
          </strong>

          <span>
            {exhibits.length}
            {' '}
            recuerdos
          </span>
        </div>

        {rooms.map(
          (
            room,
            index
          ) => {
            const angle =
              (
                index /
                Math.max(
                  rooms.length,
                  1
                )
              ) *
                Math.PI *
                2 -
              Math.PI / 2

            const radius =
              rooms.length > 6
                ? 42
                : 38

            const x =
              50 +
              Math.cos(angle) *
                radius

            const y =
              53 +
              Math.sin(angle) *
                radius

            const count =
              exhibits.filter(
                exhibit =>
                  exhibit.room_id ===
                  room.id
              ).length

            return (
              <button
                key={room.id}
                className={
                  `planet planet-${
                    (
                      index %
                      6
                    ) +
                    1
                  }`
                }
                style={{
                  left:
                    `${x}%`,
                  top:
                    `${y}%`
                }}
                onClick={() =>
                  onOpenRoom(
                    room.id
                  )
                }
              >
                <span className="planet-glow" />
                <span className="planet-ring" />

                <Orbit
                  size={17}
                />

                <strong>
                  {room.title}
                </strong>

                <small>
                  {count}
                  {' '}
                  {count === 1
                    ? 'pieza'
                    : 'piezas'}
                </small>
              </button>
            )
          }
        )}
      </div>

      <p className="orion-note">
        Toca uno de tus mundos
        para viajar hacia él.
      </p>
    </div>
  )
}