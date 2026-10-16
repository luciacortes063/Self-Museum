import { useEffect, useMemo, useState } from 'react'
import {
  FolderPlus,
  Sparkles
} from 'lucide-react'

import type {
  Exhibit,
  Room,
  ShelfTemplate
} from './types'

import {
  builtinTemplates
} from './builtinTemplates'

import type {
  MuseumState
} from './lib/storage'

import {
  loadMuseumState,
  requestPersistentStorage,
  saveMuseumState
} from './lib/storage'

import {
  compressImage,
  getImageAspectRatio
} from './lib/image'

import RoomView
  from './components/RoomView'

import {
  ExhibitModal,
  RoomModal
} from './components/Modal'

import type {
  ExhibitDraft,
  RoomDraft
} from './components/Modal'

export default function App() {
  const [ready, setReady] =
    useState(false)

  const [rooms, setRooms] =
    useState<Room[]>([])

  const [
    exhibits,
    setExhibits
  ] =
    useState<Exhibit[]>([])

  const [
    customTemplates,
    setCustomTemplates
  ] =
    useState<ShelfTemplate[]>([])

  const [
    currentRoomId,
    setCurrentRoomId
  ] =
    useState<string | null>(null)

  const [
    selectedFilter,
    setSelectedFilter
  ] =
    useState<string | null>(null)

  const [
    showRoomModal,
    setShowRoomModal
  ] =
    useState(false)

  const [
    editingRoom,
    setEditingRoom
  ] =
    useState<Room | null>(null)

  const [
    showExhibitModal,
    setShowExhibitModal
  ] =
    useState(false)

  const [
    editingExhibit,
    setEditingExhibit
  ] =
    useState<Exhibit | null>(null)

  const [toast, setToast] =
    useState('')

  const templates =
    useMemo(
      () => [
        ...builtinTemplates,
        ...customTemplates
      ],
      [customTemplates]
    )

  useEffect(() => {
    async function boot() {
      await requestPersistentStorage()

      const state =
        await loadMuseumState()

      setRooms(
        state.rooms ?? []
      )

      setExhibits(
        state.exhibits ?? []
      )

      setCustomTemplates(
        (state.templates ?? [])
          .filter(
            template =>
              !template.builtin
          )
      )

      setCurrentRoomId(
        state.rooms?.[0]?.id ??
          null
      )

      setReady(true)
    }

    boot()
  }, [])

  useEffect(() => {
    if (!ready) return

    const timer =
      window.setTimeout(
        () => {
          const state:
            MuseumState = {
              rooms,
              exhibits,
              templates:
                customTemplates
            }

          saveMuseumState(
            state
          ).catch(
            console.error
          )
        },
        180
      )

    return () =>
      window.clearTimeout(
        timer
      )
  }, [
    ready,
    rooms,
    exhibits,
    customTemplates
  ])

  useEffect(() => {
    if (!rooms.length) {
      setCurrentRoomId(
        null
      )
      return
    }

    if (
      !currentRoomId ||
      !rooms.some(
        room =>
          room.id ===
          currentRoomId
      )
    ) {
      setCurrentRoomId(
        rooms[0].id
      )
    }
  }, [
    rooms,
    currentRoomId
  ])

  const currentRoom =
    useMemo(
      () =>
        rooms.find(
          room =>
            room.id ===
            currentRoomId
        ) ?? null,
      [
        rooms,
        currentRoomId
      ]
    )

  const currentTemplate =
    useMemo(
      () =>
        templates.find(
          template =>
            template.id ===
            currentRoom?.templateId
        ),
      [
        templates,
        currentRoom?.templateId
      ]
    )

  const currentRoomExhibits =
    useMemo(
      () =>
        exhibits.filter(
          item =>
            item.roomId ===
            currentRoomId
        ),
      [
        exhibits,
        currentRoomId
      ]
    )

  function showMessage(
    message: string
  ) {
    setToast(message)

    window.setTimeout(
      () => setToast(''),
      2400
    )
  }

  async function
    createTemplateFromFile(
      file: File,
      name: string
    ): Promise<string> {
    const imageUrl =
      await compressImage(
        file,
        {
          maxWidth: 1050,
          maxHeight: 2400,
          quality: 0.76,
          mimeType:
            'image/jpeg'
        }
      )

    const aspectRatio =
      await getImageAspectRatio(
        imageUrl
      )

    const template:
      ShelfTemplate = {
        id:
          crypto.randomUUID(),
        name:
          name ||
          'Nueva plantilla',
        imageUrl,
        aspectRatio,
        builtin: false,
        createdAt:
          new Date()
            .toISOString()
      }

    setCustomTemplates(
      previous => [
        template,
        ...previous
      ]
    )

    return template.id
  }

  async function
    handleSaveRoom(
      draft: RoomDraft
    ) {
    let templateId =
      draft.templateId

    if (
      draft.newTemplateFile
    ) {
      templateId =
        await createTemplateFromFile(
          draft.newTemplateFile,
          draft.newTemplateName ||
            draft.title ||
            'Plantilla'
        )
    }

    if (!templateId) {
      alert(
        'Debes elegir o subir una plantilla de estantería.'
      )
      return
    }

    if (editingRoom) {
      const updated:
        Room = {
          ...editingRoom,
          title:
            draft.title,
          subtitle:
            draft.subtitle,
          filters:
            draft.filters,
          segments:
            draft.segments,
          templateId
        }

      setRooms(
        previous =>
          previous.map(
            room =>
              room.id ===
              updated.id
                ? updated
                : room
          )
      )

      showMessage(
        'Sala actualizada'
      )
    } else {
      const newRoom:
        Room = {
          id:
            crypto.randomUUID(),
          title:
            draft.title,
          subtitle:
            draft.subtitle,
          filters:
            draft.filters,
          segments:
            draft.segments,
          templateId,
          createdAt:
            new Date()
              .toISOString()
        }

      setRooms(
        previous => [
          ...previous,
          newRoom
        ]
      )

      setCurrentRoomId(
        newRoom.id
      )

      setSelectedFilter(
        null
      )

      showMessage(
        'Sala creada ✨'
      )
    }

    setShowRoomModal(false)
    setEditingRoom(null)
  }

  function
    handleDeleteRoom() {
    if (!editingRoom) return

    if (
      !confirm(
        '¿Eliminar esta sala y todas sus imágenes?'
      )
    ) {
      return
    }

    setRooms(
      previous =>
        previous.filter(
          room =>
            room.id !==
            editingRoom.id
        )
    )

    setExhibits(
      previous =>
        previous.filter(
          item =>
            item.roomId !==
            editingRoom.id
        )
    )

    setShowRoomModal(
      false
    )

    setEditingRoom(null)

    setSelectedFilter(
      null
    )

    showMessage(
      'Sala eliminada'
    )
  }

  async function
    handleSaveExhibit(
      draft: ExhibitDraft
    ) {
    if (!currentRoom) return

    let imageDataUrl =
      editingExhibit
        ?.imageDataUrl ??
      ''

    if (draft.file) {
      imageDataUrl =
        await compressImage(
          draft.file,
          {
            maxWidth: 640,
            maxHeight: 640,
            quality: 0.68,
            mimeType:
              'image/jpeg'
          }
        )
    }

    if (!imageDataUrl) {
      alert(
        'Debes elegir una imagen.'
      )
      return
    }

    if (editingExhibit) {
      const updated:
        Exhibit = {
          ...editingExhibit,
          title:
            draft.title,
          note:
            draft.note,
          category:
            draft.category,
          scale:
            draft.scale,
          rotation:
            draft.rotation,
          imageDataUrl
        }

      setExhibits(
        previous =>
          previous.map(
            item =>
              item.id ===
              updated.id
                ? updated
                : item
          )
      )

      showMessage(
        'Imagen actualizada'
      )
    } else {
      const countInRoom =
        exhibits.filter(
          item =>
            item.roomId ===
            currentRoom.id
        ).length

      const pageIndex =
        Math.min(
          currentRoom.segments -
            1,
          countInRoom %
            currentRoom.segments
        )

      const row =
        countInRoom % 4

      const newItem:
        Exhibit = {
          id:
            crypto.randomUUID(),
          roomId:
            currentRoom.id,
          title:
            draft.title,
          note:
            draft.note,
          category:
            draft.category,
          imageDataUrl,
          x:
            countInRoom % 2 ===
            0
              ? 0.38
              : 0.62,
          y:
            0.23 +
            row * 0.17,
          pageIndex,
          scale: 1,
          rotation: 0,
          createdAt:
            new Date()
              .toISOString()
        }

      setExhibits(
        previous => [
          ...previous,
          newItem
        ]
      )

      showMessage(
        'Imagen añadida ✨'
      )
    }

    setShowExhibitModal(false)
    setEditingExhibit(null)
  }

  function
    handleDeleteExhibit() {
    if (!editingExhibit) return

    if (
      !confirm(
        '¿Eliminar esta imagen?'
      )
    ) {
      return
    }

    setExhibits(
      previous =>
        previous.filter(
          item =>
            item.id !==
            editingExhibit.id
        )
    )

    setShowExhibitModal(
      false
    )

    setEditingExhibit(null)

    showMessage(
      'Imagen eliminada'
    )
  }

  function moveExhibit(
    item: Exhibit,
    x: number,
    y: number,
    pageIndex: number
  ) {
    const updated:
      Exhibit = {
        ...item,
        x,
        y,
        pageIndex
      }

    setExhibits(
      previous =>
        previous.map(
          current =>
            current.id ===
            item.id
              ? updated
              : current
        )
    )
  }

  if (!ready) {
    return (
      <div className="loading-screen">
        <div>
          <Sparkles
            className="pulse"
          />

          <p className="loading-copy">
            Abriendo MuseoYo...
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="app-shell">
      <header className="top-nav">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles
              size={15}
            />
          </span>

          <div>
            <strong>
              MuseoYo
            </strong>

            <small>
              local · rápido · privado
            </small>
          </div>
        </div>

        <button
          className="primary-button top-button"
          onClick={() => {
            setEditingRoom(null)
            setShowRoomModal(true)
          }}
        >
          <FolderPlus
            size={16}
          />

          Nueva sala
        </button>
      </header>

      {rooms.length > 0 && (
        <div className="room-strip">
          {rooms.map(
            room => (
              <button
                key={room.id}
                className={
                  `room-chip ${
                    room.id ===
                    currentRoomId
                      ? 'active'
                      : ''
                  }`
                }
                onClick={() => {
                  setCurrentRoomId(
                    room.id
                  )

                  setSelectedFilter(
                    null
                  )
                }}
              >
                {room.title}
              </button>
            )
          )}
        </div>
      )}

      {!rooms.length ? (
        <section className="hero-empty">
          <div>
            <Sparkles
              size={42}
            />

            <h1>
              Crea tu primer expositor
            </h1>

            <p>
              Ya tienes ocho
              plantillas de fantasía
              preparadas. Elige una,
              crea una estantería
              larga y empieza a
              colocar tus recuerdos.
            </p>

            <button
              className="primary-button"
              onClick={() => {
                setEditingRoom(
                  null
                )

                setShowRoomModal(
                  true
                )
              }}
            >
              <FolderPlus
                size={18}
              />

              Crear sala
            </button>
          </div>
        </section>
      ) : currentRoom ? (
        <RoomView
          room={
            currentRoom
          }
          template={
            currentTemplate
          }
          exhibits={
            currentRoomExhibits
          }
          selectedFilter={
            selectedFilter
          }
          onFilter={
            setSelectedFilter
          }
          onAddExhibit={() => {
            setEditingExhibit(
              null
            )

            setShowExhibitModal(
              true
            )
          }}
          onEditRoom={() => {
            setEditingRoom(
              currentRoom
            )

            setShowRoomModal(
              true
            )
          }}
          onEditExhibit={
            item => {
              setEditingExhibit(
                item
              )

              setShowExhibitModal(
                true
              )
            }
          }
          onMoveExhibit={
            moveExhibit
          }
        />
      ) : null}

      {showRoomModal && (
        <RoomModal
          room={
            editingRoom
          }
          templates={
            templates
          }
          onClose={() => {
            setShowRoomModal(
              false
            )

            setEditingRoom(
              null
            )
          }}
          onSave={
            handleSaveRoom
          }
          onDelete={
            editingRoom
              ? handleDeleteRoom
              : undefined
          }
        />
      )}

      {showExhibitModal &&
        currentRoom && (
        <ExhibitModal
          room={
            currentRoom
          }
          exhibit={
            editingExhibit
          }
          onClose={() => {
            setShowExhibitModal(
              false
            )

            setEditingExhibit(
              null
            )
          }}
          onSave={
            handleSaveExhibit
          }
          onDelete={
            editingExhibit
              ? handleDeleteExhibit
              : undefined
          }
        />
      )}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </main>
  )
}
