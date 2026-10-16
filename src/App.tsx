import { useEffect, useMemo, useState } from 'react'
import { Home, ImagePlus, PencilLine, Sparkles } from 'lucide-react'

import type { Exhibit, Room, ShelfTemplate, WorldMotion } from './types'
import { builtinTemplates } from './builtinTemplates'
import { builtinWorlds } from './builtinWorlds'
import type { MuseumState } from './lib/storage'
import {
  loadMuseumState,
  requestPersistentStorage,
  saveMuseumState
} from './lib/storage'
import {
  compressImage,
  compressWorldImage,
  getImageAspectRatio
} from './lib/image'

import HomeUniverse from './components/HomeUniverse'
import RoomView from './components/RoomView'
import { ExhibitModal, RoomModal } from './components/Modal'
import type { ExhibitDraft, RoomDraft } from './components/Modal'

const MOTION_SLOTS: [number, number][] = [
  [18, 35], [78, 32], [17, 53], [83, 50],
  [21, 72], [78, 72], [42, 42], [62, 58],
  [36, 80], [67, 82], [32, 61], [69, 42]
]

function createWorldMotion(index: number): WorldMotion {
  const slot = MOTION_SLOTS[index % MOTION_SLOTS.length]
  const jitter = () => (Math.random() - 0.5) * 3.2

  return {
    anchorX: slot[0] + jitter(),
    anchorY: slot[1] + jitter(),
    radiusX: 3.2 + Math.random() * 5.6,
    radiusY: 2.4 + Math.random() * 4.6,
    duration: 25 + Math.random() * 22,
    phase: Math.random() * Math.PI * 2,
    kind: Math.random() < 0.38 ? 'semicircle' : 'circle'
  }
}

function normalizeRoom(room: Room, index: number): Room {
  return {
    ...room,
    worldImageUrl:
      room.worldImageUrl ??
      builtinWorlds[index % builtinWorlds.length].imageUrl,
    worldScale: room.worldScale ?? 1,
    worldMotion: room.worldMotion ?? createWorldMotion(index)
  }
}

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
      const normalizedRooms = (state.rooms ?? []).map(normalizeRoom)
      setRooms(normalizedRooms)
      setExhibits(state.exhibits ?? [])
      setCustomTemplates((state.templates ?? []).filter(template => !template.builtin))
      setCurrentRoomId(normalizedRooms[0]?.id ?? null)
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
    window.setTimeout(() => setToast(''), 2200)
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
      alert('Debes elegir o subir una estantería.')
      return
    }

    let worldImageUrl = draft.worldImageUrl

    if (draft.newWorldFile) {
      worldImageUrl = await compressWorldImage(draft.newWorldFile)
    }

    if (editingRoom) {
      const updated: Room = {
        ...editingRoom,
        title: draft.title,
        subtitle: draft.subtitle,
        filters: draft.filters,
        segments: draft.segments,
        templateId,
        worldImageUrl,
        worldScale: draft.worldScale,
        worldMotion:
          editingRoom.worldMotion ??
          createWorldMotion(
            Math.max(0, rooms.findIndex(room => room.id === editingRoom.id))
          )
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
        worldImageUrl,
        worldScale: draft.worldScale,
        worldMotion: createWorldMotion(rooms.length),
        createdAt: new Date().toISOString()
      }

      setRooms(previous => [...previous, newRoom])
      setCurrentRoomId(newRoom.id)
      setSelectedFilter(null)
      setView('home')
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
      const pageIndex = Math.min(
        currentRoom.segments - 1,
        countInRoom % currentRoom.segments
      )
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
    const updated: Exhibit = { ...item, x, y, pageIndex }
    setExhibits(previous =>
      previous.map(current => (current.id === item.id ? updated : current))
    )
  }

  if (!ready) {
    return (
      <div className="loading-screen">
        <Sparkles className="pulse" />
      </div>
    )
  }

  return (
    <main className={`app-shell ${view === 'home' ? 'app-home' : 'app-room'}`}>
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
          <header className="room-topbar">
            <button
              className="room-top-icon"
              onClick={() => setView('home')}
              aria-label="Volver a Mis Universos"
            >
              <Home size={17} />
            </button>

            <div className="room-top-title">
              <img src="/app-logo.png" alt="" />
              <span>{currentRoom.title}</span>
            </div>

            <div className="room-top-actions">
              <button
                className="room-top-icon"
                onClick={() => {
                  setEditingRoom(currentRoom)
                  setShowRoomModal(true)
                }}
                aria-label="Editar mundo"
              >
                <PencilLine size={16} />
              </button>

              <button
                className="room-top-icon room-top-add"
                onClick={() => {
                  setEditingExhibit(null)
                  setShowExhibitModal(true)
                }}
                aria-label="Añadir imagen"
              >
                <ImagePlus size={16} />
              </button>
            </div>
          </header>

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
