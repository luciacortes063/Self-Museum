import type { RoomTheme } from '../types'

export default function RoomAmbience({
  theme
}: {
  theme: RoomTheme
}) {
  switch (theme) {
    case 'enchanted-forest':
      return (
        <div className="ambience forest-ambience">
          <div className="forest-arch" />

          <div className="vine vine-left">
            <i />
            <i />
            <i />
            <i />
          </div>

          <div className="vine vine-right">
            <i />
            <i />
            <i />
          </div>

          <div className="forest-mushrooms">
            <span />
            <span />
            <span />
          </div>

          <div className="firefly f1" />
          <div className="firefly f2" />
          <div className="firefly f3" />
          <div className="firefly f4" />
        </div>
      )

    case 'celestial-library':
      return (
        <div className="ambience library-ambience">
          <div className="library-arch" />

          <div className="book-column left">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>

          <div className="book-column right">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>

          <div className="library-moon" />

          <div className="floating-book book-a" />
          <div className="floating-book book-b" />
        </div>
      )

    case 'moon-gallery':
      return (
        <div className="ambience moon-ambience">
          <div className="gallery-panel panel-left" />
          <div className="gallery-panel panel-right" />

          <div className="moon-disc">
            <span />
          </div>

          <div className="gallery-light light-left" />
          <div className="gallery-light light-right" />
        </div>
      )

    case 'crystal-cabinet':
      return (
        <div className="ambience crystal-ambience">
          <div className="crystal-window" />

          <div className="crystal c1" />
          <div className="crystal c2" />
          <div className="crystal c3" />

          <div className="crystal-rays" />
        </div>
      )

    case 'ancient-castle':
      return (
        <div className="ambience castle-ambience">
          <div className="castle-window">
            <div className="castle-moon" />
          </div>

          <div className="castle-banner left" />
          <div className="castle-banner right" />

          <div className="castle-stone stone-a" />
          <div className="castle-stone stone-b" />
          <div className="castle-stone stone-c" />
        </div>
      )

    case 'ocean-dream':
      return (
        <div className="ambience ocean-ambience">
          <div className="ocean-window" />

          <div className="seaweed seaweed-left">
            <span />
            <span />
            <span />
          </div>

          <div className="seaweed seaweed-right">
            <span />
            <span />
          </div>

          <div className="bubble bubble-a" />
          <div className="bubble bubble-b" />
          <div className="bubble bubble-c" />
          <div className="bubble bubble-d" />
        </div>
      )
  }
}