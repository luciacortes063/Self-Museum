import {
  BookOpen,
  Check,
  Crown,
  Feather,
  Flame,
  Flower2,
  Gem,
  Leaf,
  Moon,
  Shell,
  Sparkles,
  Star,
  Trash2,
  X
} from 'lucide-react'

import { useState } from 'react'

import type {
  Decoration,
  DecorationKind
} from '../types'

const options: {
  kind: DecorationKind
  label: string
  icon: React.ReactNode
}[] = [
  {
    kind: 'plant',
    label: 'Planta',
    icon: <Leaf />
  },
  {
    kind: 'candle',
    label: 'Vela',
    icon: <Flame />
  },
  {
    kind: 'moon',
    label: 'Luna',
    icon: <Moon />
  },
  {
    kind: 'star',
    label: 'Estrella',
    icon: <Star />
  },
  {
    kind: 'books',
    label: 'Libros',
    icon: <BookOpen />
  },
  {
    kind: 'flower',
    label: 'Flores',
    icon: <Flower2 />
  },
  {
    kind: 'crystal',
    label: 'Cristal',
    icon: <Gem />
  },
  {
    kind: 'shell',
    label: 'Concha',
    icon: <Shell />
  },
  {
    kind: 'crown',
    label: 'Corona',
    icon: <Crown />
  },
  {
    kind: 'feather',
    label: 'Pluma',
    icon: <Feather />
  }
]

export function DecorationPicker({
  onClose,
  onSelect
}: {
  onClose: () => void
  onSelect: (kind: DecorationKind) => void
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal-sheet glass">
        <div className="modal-handle" />

        <header>
          <div>
            <p className="eyebrow">
              DECORAR
            </p>

            <h3>
              Añadir objeto
            </h3>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
          >
            <X />
          </button>
        </header>

        <p className="decor-help">
          Añade objetos a la exposición y colócalos
          libremente igual que las fotografías.
        </p>

        <div className="decor-grid">
          {options.map(option => (
            <button
              key={option.kind}
              className="decor-choice"
              onClick={() =>
                onSelect(option.kind)
              }
            >
              <span>
                {option.icon}
              </span>

              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DecorationEditor({
  decoration,
  onClose,
  onSave,
  onDelete
}: {
  decoration: Decoration
  onClose: () => void
  onSave: (
    decoration: Decoration
  ) => void
  onDelete: (
    decoration: Decoration
  ) => void
}) {
  const [scale, setScale] =
    useState(decoration.scale)

  const [rotation, setRotation] =
    useState(decoration.rotation)

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet glass">
        <div className="modal-handle" />

        <header>
          <div>
            <p className="eyebrow">
              DECORACIÓN
            </p>

            <h3>
              Ajustar objeto
            </h3>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
          >
            <X />
          </button>
        </header>

        <div className="decor-preview">
          <Sparkles />
        </div>

        <label className="range-field">
          <span>Tamaño</span>

          <input
            type="range"
            min=".5"
            max="2"
            step=".02"
            value={scale}
            onChange={e =>
              setScale(+e.target.value)
            }
          />
        </label>

        <label className="range-field">
          <span>Inclinación</span>

          <input
            type="range"
            min="-35"
            max="35"
            step="1"
            value={rotation}
            onChange={e =>
              setRotation(+e.target.value)
            }
          />
        </label>

        <div className="modal-actions">
          <button
            className="danger-button"
            onClick={() =>
              onDelete(decoration)
            }
          >
            <Trash2 size={16} />
            Eliminar
          </button>

          <button
            className="primary-button"
            onClick={() =>
              onSave({
                ...decoration,
                scale,
                rotation
              })
            }
          >
            <Check size={17} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}