import { useEffect, useMemo, useState } from 'react'
import { Check, ImagePlus, Trash2, Upload, X } from 'lucide-react'
import { builtinWorlds } from '../builtinWorlds'
import type { Exhibit, Room, ShelfTemplate } from '../types'

export interface RoomDraft {
  title: string
  subtitle: string
  filters: string[]
  segments: number
  templateId: string | null
  newTemplateFile: File | null
  newTemplateName: string
  worldImageUrl: string
  worldScale: number
  newWorldFile: File | null
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
  const [templateId, setTemplateId] = useState<string | null>(room?.templateId ?? templates[0]?.id ?? null)
  const [newTemplateFile, setNewTemplateFile] = useState<File | null>(null)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [worldImageUrl, setWorldImageUrl] = useState(room?.worldImageUrl ?? builtinWorlds[0].imageUrl)
  const [worldScale, setWorldScale] = useState(room?.worldScale ?? 1)
  const [newWorldFile, setNewWorldFile] = useState<File | null>(null)

  const shelfPreviewUrl = useMemo(
    () => (newTemplateFile ? URL.createObjectURL(newTemplateFile) : null),
    [newTemplateFile]
  )

  const worldPreviewUrl = useMemo(
    () => (newWorldFile ? URL.createObjectURL(newWorldFile) : null),
    [newWorldFile]
  )

  useEffect(() => {
    return () => {
      if (shelfPreviewUrl) URL.revokeObjectURL(shelfPreviewUrl)
      if (worldPreviewUrl) URL.revokeObjectURL(worldPreviewUrl)
    }
  }, [shelfPreviewUrl, worldPreviewUrl])

  useEffect(() => {
    if (newTemplateFile && !newTemplateName) {
      setNewTemplateName(newTemplateFile.name.replace(/\.[^/.]+$/, ''))
    }
  }, [newTemplateFile, newTemplateName])

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet">
        <div className="modal-handle" />

        <header className="modal-header">
          <div>
            <p className="eyebrow">MUNDO</p>
            <h3>{room ? 'Editar mundo' : 'Añadir Mundo'}</h3>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <label className="field">
          <span>Nombre</span>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Libros" />
        </label>

        <label className="field">
          <span>Descripción opcional</span>
          <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Historias que forman parte de mí" />
        </label>

        <div className="field">
          <span>Miniatura del mundo</span>
          <div className="world-picker-grid">
            {builtinWorlds.map(world => (
              <button
                key={world.id}
                type="button"
                className={`world-choice ${!newWorldFile && worldImageUrl === world.imageUrl ? 'active' : ''}`}
                onClick={() => {
                  setNewWorldFile(null)
                  setWorldImageUrl(world.imageUrl)
                }}
              >
                <img src={world.imageUrl} alt={world.name} />
                <small>{world.name}</small>
              </button>
            ))}

            <label className={`world-choice world-upload-choice ${newWorldFile ? 'active' : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={e => setNewWorldFile(e.target.files?.[0] ?? null)}
              />
              {worldPreviewUrl ? (
                <img src={worldPreviewUrl} alt="Mi mundo" />
              ) : (
                <div className="world-upload-icon"><Upload size={24} /></div>
              )}
              <small>Mi imagen</small>
            </label>
          </div>
        </div>

        <label className="field">
          <span>Tamaño del mundo en la pantalla principal</span>
          <input
            type="range"
            min="0.62"
            max="1.75"
            step="0.01"
            value={worldScale}
            onChange={e => setWorldScale(Number(e.target.value))}
          />
          <small>{Math.round(worldScale * 100)}%</small>
        </label>

        <div className="modal-divider" />

        <label className="field">
          <span>Filtros opcionales</span>
          <input value={filters} onChange={e => setFilters(e.target.value)} placeholder="Aves, Mamíferos, Acuáticos" />
        </label>

        <label className="field">
          <span>Longitud del expositor</span>
          <input
            type="range"
            min="3"
            max="12"
            step="1"
            value={segments}
            onChange={e => setSegments(Number(e.target.value))}
          />
          <small>{segments} repeticiones de la estantería</small>
        </label>

        <div className="field">
          <span>Estantería</span>
          <div className="template-grid">
            {templates.map(template => (
              <button
                key={template.id}
                type="button"
                className={`template-card ${templateId === template.id && !newTemplateFile ? 'active' : ''}`}
                onClick={() => {
                  setTemplateId(template.id)
                  setNewTemplateFile(null)
                }}
              >
                <img src={template.imageUrl} alt={template.name} />
                <small>{template.name}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>O usar otra estantería</span>
          <label className="upload-box">
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0] ?? null
                setNewTemplateFile(file)
                if (file) setTemplateId(null)
              }}
            />
            <div>
              <Upload size={22} />
              <strong>Subir estantería</strong>
              <p>La imagen se comprimirá automáticamente.</p>
            </div>
          </label>

          {shelfPreviewUrl && (
            <div className="new-template-preview">
              <img src={shelfPreviewUrl} alt="Vista previa" />
            </div>
          )}

          {newTemplateFile && (
            <label className="field nested">
              <span>Nombre de la plantilla</span>
              <input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="Mi estantería" />
            </label>
          )}
        </div>

        <div className="modal-actions">
          {room && onDelete && (
            <button className="danger-button" onClick={onDelete}>
              <Trash2 size={16} /> Eliminar
            </button>
          )}

          <button
            className="primary-button"
            onClick={() => onSave({
              title: title || 'Nuevo mundo',
              subtitle,
              filters: filters.split(',').map(x => x.trim()).filter(Boolean),
              segments,
              templateId,
              newTemplateFile,
              newTemplateName,
              worldImageUrl,
              worldScale,
              newWorldFile
            })}
          >
            <Check size={16} /> Guardar
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
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
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
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </label>

        <label className="field">
          <span>Nombre</span>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Petirrojo" />
        </label>

        <label className="field">
          <span>Nota opcional</span>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Por qué significa algo para mí" />
        </label>

        {room.filters.length > 0 && (
          <label className="field">
            <span>Categoría</span>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Sin categoría</option>
              {room.filters.map(filter => <option key={filter} value={filter}>{filter}</option>)}
            </select>
          </label>
        )}

        {!isNew && (
          <>
            <label className="field">
              <span>Tamaño</span>
              <input type="range" min="0.65" max="1.6" step="0.01" value={scale} onChange={e => setScale(Number(e.target.value))} />
            </label>
            <label className="field">
              <span>Inclinación</span>
              <input type="range" min="-12" max="12" step="0.5" value={rotation} onChange={e => setRotation(Number(e.target.value))} />
            </label>
          </>
        )}

        <div className="modal-actions">
          {!isNew && onDelete && (
            <button className="danger-button" onClick={onDelete}><Trash2 size={16} /> Eliminar</button>
          )}
          <button
            className="primary-button"
            disabled={isNew && !file}
            onClick={() => onSave({
              title: title || 'Sin título',
              note,
              category: category || null,
              scale,
              rotation,
              file
            })}
          >
            <Check size={16} /> Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
