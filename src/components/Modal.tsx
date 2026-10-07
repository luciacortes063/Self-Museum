import { useEffect, useState } from 'react'
import { Camera, Check, Trash2, X } from 'lucide-react'
import type { Exhibit, Room, RoomTheme } from '../types'

const themes: { value: RoomTheme; label: string }[] = [
  { value: 'enchanted-forest', label: 'Bosque encantado' },
  { value: 'celestial-library', label: 'Biblioteca celeste' },
  { value: 'moon-gallery', label: 'Galería lunar' },
  { value: 'crystal-cabinet', label: 'Gabinete de cristal' },
  { value: 'ancient-castle', label: 'Castillo antiguo' },
  { value: 'ocean-dream', label: 'Sueño oceánico' }
]

export function RoomModal({
  room,
  onClose,
  onSave,
  onDelete
}: {
  room?: Room | null
  onClose: () => void
  onSave: (value: { title: string; subtitle: string; theme: RoomTheme; filters: string[] }) => void
  onDelete?: () => void
}) {
  const [title, setTitle] = useState(room?.title ?? '')
  const [subtitle, setSubtitle] = useState(room?.subtitle ?? '')
  const [theme, setTheme] = useState<RoomTheme>(room?.theme ?? 'enchanted-forest')
  const [filters, setFilters] = useState(room?.filters.join(', ') ?? '')

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet glass">
        <div className="modal-handle" />
        <header><h3>{room ? 'Editar sala' : 'Nueva sala'}</h3><button className="icon-button" onClick={onClose}><X/></button></header>
        <label className="field"><span>Título</span><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bestiario" /></label>
        <label className="field"><span>Descripción</span><input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Criaturas que forman parte de mi mundo" /></label>
        <label className="field"><span>Ambientación</span>
          <select value={theme} onChange={e => setTheme(e.target.value as RoomTheme)}>
            {themes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="field"><span>Filtros opcionales</span><input value={filters} onChange={e => setFilters(e.target.value)} placeholder="Aves, Mamíferos, Acuáticos" /></label>
        <div className="modal-actions">
          {room && onDelete && <button className="danger-button" onClick={onDelete}><Trash2 size={16}/> Eliminar</button>}
          <button className="primary-button" onClick={() => onSave({
            title: title || 'Nueva sala',
            subtitle,
            theme,
            filters: filters.split(',').map(x => x.trim()).filter(Boolean)
          })}><Check size={17}/> Guardar</button>
        </div>
      </div>
    </div>
  )
}

export function ExhibitModal({
  room,
  item,
  onClose,
  onSaveNew,
  onSaveExisting,
  onDelete
}: {
  room: Room
  item?: Exhibit | null
  onClose: () => void
  onSaveNew: (value: { title: string; note: string; category: string | null; file: File | null }) => void
  onSaveExisting: (item: Exhibit) => void
  onDelete: (item: Exhibit) => void
}) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [note, setNote] = useState(item?.note ?? '')
  const [category, setCategory] = useState(item?.category ?? '')
  const [scale, setScale] = useState(item?.scale ?? 1)
  const [rotation, setRotation] = useState(item?.rotation ?? 0)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(item?.imageUrl ?? null)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function save() {
    if (item) {
      onSaveExisting({ ...item, title: title || 'Sin título', note, category: category || null, scale, rotation })
    } else {
      onSaveNew({ title, note, category: category || null, file })
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet glass">
        <div className="modal-handle" />
        <header><h3>{item ? 'Editar pieza' : 'Nueva pieza'}</h3><button className="icon-button" onClick={onClose}><X/></button></header>

        <label className="photo-picker">
          {preview ? <img src={preview} alt="" /> : <div><Camera/><span>Elegir foto</span></div>}
          {!item && <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />}
        </label>

        <label className="field"><span>Nombre</span><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Búho nival" /></label>
        <label className="field"><span>Nota opcional</span><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Por qué significa algo para mí…" /></label>

        {room.filters.length > 0 && (
          <label className="field"><span>Categoría</span>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Sin categoría</option>
              {room.filters.map(f => <option key={f}>{f}</option>)}
            </select>
          </label>
        )}

        {item && <>
          <label className="range-field"><span>Tamaño</span><input type="range" min=".7" max="1.35" step=".01" value={scale} onChange={e => setScale(+e.target.value)} /></label>
          <label className="range-field"><span>Inclinación</span><input type="range" min="-10" max="10" step=".5" value={rotation} onChange={e => setRotation(+e.target.value)} /></label>
        </>}

        <div className="modal-actions">
          {item && <button className="danger-button" onClick={() => onDelete(item)}><Trash2 size={16}/> Eliminar</button>}
          <button className="primary-button" onClick={save}><Check size={17}/> Guardar</button>
        </div>
      </div>
    </div>
  )
}
