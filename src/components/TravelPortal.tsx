import {
  BookOpen,
  Castle,
  Gem,
  Leaf,
  Moon,
  Sparkles,
  Waves
} from 'lucide-react'

import type { Room } from '../types'

function roomIcon(
  theme: Room['theme']
) {
  switch (theme) {
    case 'enchanted-forest':
      return <Leaf />

    case 'celestial-library':
      return <BookOpen />

    case 'moon-gallery':
      return <Moon />

    case 'crystal-cabinet':
      return <Gem />

    case 'ancient-castle':
      return <Castle />

    case 'ocean-dream':
      return <Waves />
  }
}

export default function TravelPortal({
  room
}: {
  room: Room
}) {
  return (
    <div
      className={`travel-portal travel-${room.theme}`}
    >
      <div className="travel-stars" />

      <div className="travel-orbit orbit-one" />
      <div className="travel-orbit orbit-two" />

      <div className="travel-planet">
        <div className="travel-planet-light" />

        {roomIcon(room.theme)}
      </div>

      <div className="travel-copy">
        <Sparkles size={14} />

        <span>
          viajando hacia
        </span>

        <strong>
          {room.title}
        </strong>
      </div>
    </div>
  )
}