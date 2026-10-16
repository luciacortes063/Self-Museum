import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  ImagePlus,
  Trash2,
  Upload,
  X
} from 'lucide-react'

import type {
  Exhibit,
  Room,
  ShelfTemplate
} from '../types'

export interface RoomDraft {
  title: string
  subtitle: string
  filters: string[]
  segments: number
  templateId: string | null
  newTemplateFile: File | null
  newTemplateName: string
}

export interface ExhibitDraft {
  title: string
  note: string
  category: string | null
  scale: number
  rotation: number
  file: File | null
}

export function RoomModal({
  room,
  templates,
  onClose,
  onSave,
  onDelete
}: {
  room?: Room | null
  templates: ShelfTemplate[]
  onClose: () => void
  onSave: (draft: RoomDraft) => void
  onDelete?: () => void
}) {
  const [title, setTitle] = useState(room?.title ?? '')
  const [subtitle, setSubtitle] = useState(room?.subtitle ?? '')
  const [filters, setFilters] = useState(room?.filters.join(', ') ?? '')
  const [segments, setSegments] = useState(room?.segments ?? 5)
  const [templateId, setTemplateId] = useState<string | null>(
    room?.templateId ?? templates[0]?.id ?? null
  )
  const [newTemplateFile, setNewTemplateFile] = useState<File | null>(null)
  const [newTemplateName, setNewTemplateName] = useState('')

  const previewUrl = useMemo(
    () => (newTemplateFile ? URL.createObjectURL(newTemplateFile) : null),
    [newTemplateFile]
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (newTemplateFile && !newTemplateName) {
      setNewTemplateName(
        newTemplateFile.name.replace(/\.[^/.]+$/, '')
      )
    }
  }, [newTemplateFile, newTemplateName])

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet">
        <div className="modal-handle" />

        <header className="modal-header">
          <div>
            <p className="eyebrow">MUNDO</p>
            <h3>{room ? 'Editar mundo' : 'Nuevo mundo'}</h3>
          </div>

          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <label className="field">
          <span>Título</span>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Animales"
          />
        </label>

        <label className="field">
          <span>Descripción</span>
          <input
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            placeholder="Mis criaturas favoritas"
          />
        </label>

        <label className="field">
          <span>Filtros opcionales</span>
          <input
            value={filters}
            onChange={e => setFilters(e.target.value)}
            placeholder="Aves, Mamíferos, Acuáticos"
          />
        </label>

        <label className="field">
          <span>Longitud de la estantería</span>
          <input
            type="range"
            min="3"
            max="12"
            step="1"
            value={segments}
            onChange={e => setSegments(Number(e.target.value))}
          />
          <small>{segments} repeticiones de la plantilla</small>
        </label>

        <div className="field">
          <span>Elegir plantilla</span>

          <div className="template-grid">
            {templates.map(template => (
              <button
                key={template.id}
                type="button"
                className={`template-card ${templateId === template.id ? 'active' : ''}`}
                onClick={() => {
                  setTemplateId(template.id)
                  setNewTemplateFile(null)
                }}
              >
                <img src={template.imageUrl} alt={template.name} />
                <span>{template.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>O crear una plantilla con tu propia imagen</span>

          <label className="upload-box">
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0] ?? null
                setNewTemplateFile(file)

                if (file) {
                  setTemplateId(null)
                }
              }}
            />

            <div>
              <Upload size={22} />
              <strong>Subir estantería</strong>
              <p>Se comprimirá automáticamente antes de guardarse.</p>
            </div>
          </label>

          {previewUrl && (
            <div className="new-template-preview">
              <img src={previewUrl} alt="Vista previa" />
            </div>
          )}

          {newTemplateFile && (
            <label className="field nested">
              <span>Nombre de la plantilla</span>
              <input
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                placeholder="Mi nueva estantería"
              />
            </label>
          )}
        </div>

        <div className="modal-actions">
          {room && onDelete && (
            <button className="danger-button" onClick={onDelete}>
              <Trash2 size={16} />
              Eliminar
            </button>
          )}

          <button
            className="primary-button"
            onClick={() =>
              onSave({
                title: title || 'Nueva sala',
                subtitle,
                filters: filters
                  .split(',')
                  .map(x => x.trim())
                  .filter(Boolean),
                segments,
                templateId,
                newTemplateFile,
                newTemplateName
              })
            }
          >
            <Check size={16} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export function ExhibitModal({
  room,
  exhibit,
  onClose,
  onSave,
  onDelete
}: {
  room: Room
  exhibit?: Exhibit | null
  onClose: () => void
  onSave: (draft: ExhibitDraft) => void
  onDelete?: () => void
}) {
  const [title, setTitle] = useState(exhibit?.title ?? '')
  const [note, setNote] = useState(exhibit?.note ?? '')
  const [category, setCategory] = useState<string>(exhibit?.category ?? '')
  const [scale, setScale] = useState(exhibit?.scale ?? 1)
  const [rotation, setRotation] = useState(exhibit?.rotation ?? 0)
  const [file, setFile] = useState<File | null>(null)

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file)
    return exhibit?.imageDataUrl ?? null
  }, [file, exhibit?.imageDataUrl])

  useEffect(() => {
    return () => {
      if (file && previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [file, previewUrl])

  const isNew = !exhibit

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet">
        <div className="modal-handle" />

        <header className="modal-header">
          <div>
            <p className="eyebrow">PIEZA</p>
            <h3>{isNew ? 'Añadir imagen' : 'Editar imagen'}</h3>
          </div>

          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <label className="photo-upload">
          {previewUrl ? (
            <img src={previewUrl} alt="" />
          ) : (
            <div className="photo-upload-empty">
              <ImagePlus size={26} />
              <span>Elegir imagen</span>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={e =>
              setFile(e.target.files?.[0] ?? null)
            }
          />
        </label>

        <label className="field">
          <span>Nombre</span>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Petirrojo"
          />
        </label>

        <label className="field">
          <span>Nota opcional</span>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Por qué significa algo para mí"
          />
        </label>

        {room.filters.length > 0 && (
          <label className="field">
            <span>Categoría</span>

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">Sin categoría</option>

              {room.filters.map(filter => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </label>
        )}

        {!isNew && (
          <>
            <label className="field">
              <span>Tamaño</span>
              <input
                type="range"
                min="0.65"
                max="1.6"
                step="0.01"
                value={scale}
                onChange={e => setScale(Number(e.target.value))}
              />
            </label>

            <label className="field">
              <span>Inclinación</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={rotation}
                onChange={e => setRotation(Number(e.target.value))}
              />
            </label>
          </>
        )}

        <div className="modal-actions">
          {!isNew && onDelete && (
            <button className="danger-button" onClick={onDelete}>
              <Trash2 size={16} />
              Eliminar
            </button>
          )}

          <button
            className="primary-button"
            disabled={isNew && !file}
            onClick={() =>
              onSave({
                title: title || 'Sin título',
                note,
                category: category || null,
                scale,
                rotation,
                file
              })
            }
          >
            <Check size={16} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
