import { useEffect, useMemo, useState } from 'react'
import { FolderPlus, Home, Sparkles } from 'lucide-react'

import type {
  Exhibit,
  Room,
  ShelfTemplate
} from './types'

import { builtinTemplates } from './builtinTemplates'

import type { MuseumState } from './lib/storage'
import {
  loadMuseumState,
  requestPersistentStorage,
  saveMuseumState
} from './lib/storage'

import {
  compressImage,
  getImageAspectRatio
} from './lib/image'

import RoomView from './components/RoomView'
import HomeUniverse from './components/HomeUniverse'

import {
  ExhibitModal,
  RoomModal
} from './components/Modal'

import type {
  ExhibitDraft,
  RoomDraft
} from './components/Modal'

export default function App() {
  const [ready, setReady] = useState(false)

  const [rooms, setRooms] = useState<Room[]>([])
  const [exhibits, setExhibits] = useState<Exhibit[]>([])
  const [customTemplates, setCustomTemplates] = useState<ShelfTemplate[]>([])

  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)

  const [showExhibitModal, setShowExhibitModal] = useState(false)
  const [editingExhibit, setEditingExhibit] = useState<Exhibit | null>(null)

  const [toast, setToast] = useState('')
  const [view, setView] = useState<'home' | 'room'>('home')

  const templates = useMemo(
    () => [...builtinTemplates, ...customTemplates],
    [customTemplates]
  )

  useEffect(() => {
    async function boot() {
      await requestPersistentStorage()
      const state = await loadMuseumState()

      setRooms(state.rooms ?? [])
      setExhibits(state.exhibits ?? [])
      setCustomTemplates((state.templates ?? []).filter(t => !t.builtin))
      setCurrentRoomId(state.rooms?.[0]?.id ?? null)
      setReady(true)
    }

    boot()
  }, [])

  useEffect(() => {
    if (!ready) return

    const timer = window.setTimeout(() => {
      const state: MuseumState = {
        rooms,
        exhibits,
        templates: customTemplates
      }

      saveMuseumState(state).catch(console.error)
    }, 180)

    return () => window.clearTimeout(timer)
  }, [ready, rooms, exhibits, customTemplates])

  useEffect(() => {
    if (!rooms.length) {
      setCurrentRoomId(null)
      setView('home')
      return
    }

    if (!currentRoomId || !rooms.some(room => room.id === currentRoomId)) {
      setCurrentRoomId(rooms[0].id)
    }
  }, [rooms, currentRoomId])

  const currentRoom = useMemo(
    () => rooms.find(room => room.id === currentRoomId) ?? null,
    [rooms, currentRoomId]
  )

  const currentTemplate = useMemo(
    () => templates.find(template => template.id === currentRoom?.templateId),
    [templates, currentRoom?.templateId]
  )

  const currentRoomExhibits = useMemo(
    () => exhibits.filter(item => item.roomId === currentRoomId),
    [exhibits, currentRoomId]
  )

  function showMessage(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  async function createTemplateFromFile(file: File, name: string): Promise<string> {
    const imageUrl = await compressImage(file, {
      maxWidth: 1050,
      maxHeight: 2400,
      quality: 0.76,
      mimeType: 'image/jpeg'
    })

    const aspectRatio = await getImageAspectRatio(imageUrl)

    const template: ShelfTemplate = {
      id: crypto.randomUUID(),
      name: name || 'Nueva plantilla',
      imageUrl,
      aspectRatio,
      builtin: false,
      createdAt: new Date().toISOString()
    }

    setCustomTemplates(previous => [template, ...previous])
    return template.id
  }

  async function handleSaveRoom(draft: RoomDraft) {
    let templateId = draft.templateId

    if (draft.newTemplateFile) {
      templateId = await createTemplateFromFile(
        draft.newTemplateFile,
        draft.newTemplateName || draft.title || 'Plantilla'
      )
    }

    if (!templateId) {
      alert('Debes elegir o subir una plantilla de estantería.')
      return
    }

    if (editingRoom) {
      const updated: Room = {
        ...editingRoom,
        title: draft.title,
        subtitle: draft.subtitle,
        filters: draft.filters,
        segments: draft.segments,
        templateId
      }

      setRooms(previous =>
        previous.map(room => (room.id === updated.id ? updated : room))
      )

      showMessage('Mundo actualizado')
    } else {
      const newRoom: Room = {
        id: crypto.randomUUID(),
        title: draft.title,
        subtitle: draft.subtitle,
        filters: draft.filters,
        segments: draft.segments,
        templateId,
        createdAt: new Date().toISOString()
      }

      setRooms(previous => [...previous, newRoom])
      setCurrentRoomId(newRoom.id)
      setSelectedFilter(null)
      setView('room')

      showMessage('Mundo creado ✨')
    }

    setShowRoomModal(false)
    setEditingRoom(null)
  }

  function handleDeleteRoom() {
    if (!editingRoom) return

    if (!confirm('¿Eliminar este mundo y todas sus imágenes?')) return

    setRooms(previous => previous.filter(room => room.id !== editingRoom.id))
    setExhibits(previous => previous.filter(item => item.roomId !== editingRoom.id))

    setShowRoomModal(false)
    setEditingRoom(null)
    setSelectedFilter(null)
    setView('home')

    showMessage('Mundo eliminado')
  }

  async function handleSaveExhibit(draft: ExhibitDraft) {
    if (!currentRoom) return

    let imageDataUrl = editingExhibit?.imageDataUrl ?? ''

    if (draft.file) {
      imageDataUrl = await compressImage(draft.file, {
        maxWidth: 640,
        maxHeight: 640,
        quality: 0.68,
        mimeType: 'image/jpeg'
      })
    }

    if (!imageDataUrl) {
      alert('Debes elegir una imagen.')
      return
    }

    if (editingExhibit) {
      const updated: Exhibit = {
        ...editingExhibit,
        title: draft.title,
        note: draft.note,
        category: draft.category,
        scale: draft.scale,
        rotation: draft.rotation,
        imageDataUrl
      }

      setExhibits(previous =>
        previous.map(item => (item.id === updated.id ? updated : item))
      )

      showMessage('Imagen actualizada')
    } else {
      const countInRoom = exhibits.filter(item => item.roomId === currentRoom.id).length
      const pageIndex = Math.min(currentRoom.segments - 1, countInRoom % currentRoom.segments)
      const row = countInRoom % 4

      const newItem: Exhibit = {
        id: crypto.randomUUID(),
        roomId: currentRoom.id,
        title: draft.title,
        note: draft.note,
        category: draft.category,
        imageDataUrl,
        x: countInRoom % 2 === 0 ? 0.38 : 0.62,
        y: 0.23 + row * 0.17,
        pageIndex,
        scale: 1,
        rotation: 0,
        createdAt: new Date().toISOString()
      }

      setExhibits(previous => [...previous, newItem])
      showMessage('Imagen añadida ✨')
    }

    setShowExhibitModal(false)
    setEditingExhibit(null)
  }

  function handleDeleteExhibit() {
    if (!editingExhibit) return
    if (!confirm('¿Eliminar esta imagen?')) return

    setExhibits(previous => previous.filter(item => item.id !== editingExhibit.id))
    setShowExhibitModal(false)
    setEditingExhibit(null)

    showMessage('Imagen eliminada')
  }

  function moveExhibit(item: Exhibit, x: number, y: number, pageIndex: number) {
    const updated: Exhibit = {
      ...item,
      x,
      y,
      pageIndex
    }

    setExhibits(previous =>
      previous.map(current => (current.id === item.id ? updated : current))
    )
  }

  if (!ready) {
    return (
      <div className="loading-screen">
        <div>
          <Sparkles className="pulse" />
          <p className="loading-copy">Abriendo Mis Universos...</p>
        </div>
      </div>
    )
  }

  return (
    <main className={`app-shell ${view === 'home' ? 'app-home' : 'app-room'}`}>
      <header className={`top-nav ${view === 'room' ? 'top-nav-warm' : ''}`}>
        <div className="brand brand-small">
          <img
            src="/logo-mis-universos.png"
            alt="Mis Universos"
            className="brand-logo"
          />
          <div>
            <strong>Mis Universos</strong>
          </div>
        </div>

        {view === 'home' ? (
          <button
            className="primary-button top-button"
            onClick={() => {
              setEditingRoom(null)
              setShowRoomModal(true)
            }}
          >
            <FolderPlus size={16} />
            Añadir Mundo
          </button>
        ) : (
          <button
            className="soft-button warm-soft top-button"
            onClick={() => setView('home')}
          >
            <Home size={16} />
            Mundos
          </button>
        )}
      </header>

      {view === 'home' ? (
        <HomeUniverse
          rooms={rooms}
          onOpenRoom={room => {
            setCurrentRoomId(room.id)
            setSelectedFilter(null)
            setView('room')
          }}
          onCreateRoom={() => {
            setEditingRoom(null)
            setShowRoomModal(true)
          }}
        />
      ) : currentRoom ? (
        <>
          <div className="room-strip room-strip-warm">
            <button
              className="room-chip active"
              onClick={() => {}}
            >
              {currentRoom.title}
            </button>
          </div>

          <RoomView
            room={currentRoom}
            template={currentTemplate}
            exhibits={currentRoomExhibits}
            selectedFilter={selectedFilter}
            onFilter={setSelectedFilter}
            onAddExhibit={() => {
              setEditingExhibit(null)
              setShowExhibitModal(true)
            }}
            onEditRoom={() => {
              setEditingRoom(currentRoom)
              setShowRoomModal(true)
            }}
            onEditExhibit={item => {
              setEditingExhibit(item)
              setShowExhibitModal(true)
            }}
            onMoveExhibit={moveExhibit}
          />
        </>
      ) : (
        <HomeUniverse
          rooms={rooms}
          onOpenRoom={room => {
            setCurrentRoomId(room.id)
            setSelectedFilter(null)
            setView('room')
          }}
          onCreateRoom={() => {
            setEditingRoom(null)
            setShowRoomModal(true)
          }}
        />
      )}

      {showRoomModal && (
        <RoomModal
          room={editingRoom}
          templates={templates}
          onClose={() => {
            setShowRoomModal(false)
            setEditingRoom(null)
          }}
          onSave={handleSaveRoom}
          onDelete={editingRoom ? handleDeleteRoom : undefined}
        />
      )}

      {showExhibitModal && currentRoom && (
        <ExhibitModal
          room={currentRoom}
          exhibit={editingExhibit}
          onClose={() => {
            setShowExhibitModal(false)
            setEditingExhibit(null)
          }}
          onSave={handleSaveExhibit}
          onDelete={editingExhibit ? handleDeleteExhibit : undefined}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}