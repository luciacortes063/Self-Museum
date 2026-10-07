import {
  useEffect,
  useMemo,
  useState
} from 'react'

import type {
  Session
} from '@supabase/supabase-js'

import {
  Grid2X2,
  LogOut,
  Orbit,
  Plus,
  Sparkles
} from 'lucide-react'

import {
  supabase
} from './lib/supabase'

import {
  createDecoration,
  createExhibit,
  createRoom,
  deleteDecoration,
  deleteExhibit,
  deleteRoom,
  loadDecorations,
  loadExhibits,
  loadRooms,
  updateDecoration,
  updateExhibit,
  updateRoom
} from './lib/api'

import type {
  Decoration,
  DecorationKind,
  Exhibit,
  Room,
  RoomTheme
} from './types'

import Auth
  from './components/Auth'

import Orion
  from './components/Orion'

import RoomView
  from './components/RoomView'

import TravelPortal
  from './components/TravelPortal'

import {
  ExhibitModal,
  RoomModal
} from './components/Modal'

import {
  DecorationEditor,
  DecorationPicker
} from './components/DecorationModal'

type ViewMode =
  | 'museum'
  | 'orion'

export default function App() {
  const [
    session,
    setSession
  ] =
    useState<Session | null>(
      null
    )

  const [
    loading,
    setLoading
  ] =
    useState(true)

  const [
    rooms,
    setRooms
  ] =
    useState<Room[]>([])

  const [
    exhibits,
    setExhibits
  ] =
    useState<Exhibit[]>([])

  const [
    decorations,
    setDecorations
  ] =
    useState<Decoration[]>([])

  const [
    roomIndex,
    setRoomIndex
  ] =
    useState(0)

  const [
    mode,
    setMode
  ] =
    useState<ViewMode>(
      'museum'
    )

  const [
    filter,
    setFilter
  ] =
    useState<string | null>(
      null
    )

  const [
    roomModal,
    setRoomModal
  ] =
    useState<
      'new' |
      'edit' |
      null
    >(null)

  const [
    itemModal,
    setItemModal
  ] =
    useState<
      'new' |
      'edit' |
      null
    >(null)

  const [
    editingItem,
    setEditingItem
  ] =
    useState<Exhibit | null>(
      null
    )

  const [
    decorationPicker,
    setDecorationPicker
  ] =
    useState(false)

  const [
    editingDecoration,
    setEditingDecoration
  ] =
    useState<
      Decoration |
      null
    >(null)

  const [
    travellingRoom,
    setTravellingRoom
  ] =
    useState<Room | null>(
      null
    )

  const [
    toast,
    setToast
  ] =
    useState('')

  const currentRoom =
    rooms[roomIndex]

  const roomExhibits =
    useMemo(
      () =>
        exhibits.filter(
          item =>
            item.room_id ===
            currentRoom?.id
        ),
      [
        exhibits,
        currentRoom
      ]
    )

  const roomDecorations =
    useMemo(
      () =>
        decorations.filter(
          item =>
            item.room_id ===
            currentRoom?.id
        ),
      [
        decorations,
        currentRoom
      ]
    )

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(
        ({
          data
        }) => {
          setSession(
            data.session
          )

          setLoading(false)
        }
      )

    const { data } =
      supabase.auth
        .onAuthStateChange(
          (
            _event,
            next
          ) => {
            setSession(next)
          }
        )

    return () =>
      data.subscription
        .unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return

    refresh()
  }, [session])

  async function refresh() {
    try {
      const nextRooms =
        await loadRooms()

      const ids =
        nextRooms.map(
          room =>
            room.id
        )

      const [
        nextExhibits,
        nextDecorations
      ] =
        await Promise.all([
          loadExhibits(ids),
          loadDecorations(ids)
        ])

      setRooms(
        nextRooms
      )

      setExhibits(
        nextExhibits
      )

      setDecorations(
        nextDecorations
      )

      setRoomIndex(
        index =>
          Math.min(
            index,
            Math.max(
              nextRooms.length -
                1,
              0
            )
          )
      )
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el museo'
      )
    }
  }

  function showToast(
    message: string
  ) {
    setToast(message)

    window.setTimeout(
      () =>
        setToast(''),
      2800
    )
  }

  async function saveNewRoom(
    value: {
      title: string
      subtitle: string
      theme: RoomTheme
      filters: string[]
    }
  ) {
    try {
      const room =
        await createRoom({
          ...value,
          icon:
            'sparkles',
          sort_order:
            rooms.length
        })

      setRooms(
        previous => [
          ...previous,
          room
        ]
      )

      setRoomIndex(
        rooms.length
      )

      setRoomModal(null)

      showToast(
        'Nuevo mundo creado ✨'
      )
    } catch (error) {
      showToast(
        String(error)
      )
    }
  }

  async function saveExistingRoom(
    value: {
      title: string
      subtitle: string
      theme: RoomTheme
      filters: string[]
    }
  ) {
    if (!currentRoom) return

    const updated = {
      ...currentRoom,
      ...value
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

    setRoomModal(null)

    try {
      await updateRoom(
        updated
      )
    } catch (error) {
      showToast(
        String(error)
      )
    }
  }

  async function removeRoom() {
    if (!currentRoom) return

    if (
      !confirm(
        '¿Eliminar esta sala y todo lo que contiene?'
      )
    ) {
      return
    }

    try {
      await deleteRoom(
        currentRoom.id
      )

      const next =
        rooms.filter(
          room =>
            room.id !==
            currentRoom.id
        )

      setRooms(next)

      setExhibits(
        previous =>
          previous.filter(
            item =>
              item.room_id !==
              currentRoom.id
          )
      )

      setDecorations(
        previous =>
          previous.filter(
            item =>
              item.room_id !==
              currentRoom.id
          )
      )

      setRoomIndex(0)
      setRoomModal(null)
    } catch (error) {
      showToast(
        String(error)
      )
    }
  }

  async function addItem(
    value: {
      title: string
      note: string
      category:
        string |
        null
      file:
        File |
        null
    }
  ) {
    if (!currentRoom) return

    try {
      const item =
        await createExhibit(
          currentRoom.id,
          {
            ...value,

            x:
              .5 +
              (
                Math.random() -
                .5
              ) *
                .16,

            y:
              .32 +
              (
                roomExhibits
                  .length %
                4
              ) *
                .17
          }
        )

      setExhibits(
        previous => [
          ...previous,
          item
        ]
      )

      setItemModal(null)

      showToast(
        'Pieza añadida ✨'
      )
    } catch (error) {
      showToast(
        String(error)
      )
    }
  }

  async function saveItem(
    item: Exhibit
  ) {
    setExhibits(
      previous =>
        previous.map(
          current =>
            current.id ===
            item.id
              ? item
              : current
        )
    )

    setItemModal(null)

    try {
      await updateExhibit(
        item
      )
    } catch (error) {
      showToast(
        String(error)
      )
    }
  }

  async function removeItem(
    item: Exhibit
  ) {
    if (
      !confirm(
        '¿Eliminar esta pieza?'
      )
    ) {
      return
    }

    setExhibits(
      previous =>
        previous.filter(
          current =>
            current.id !==
            item.id
        )
    )

    setItemModal(null)

    try {
      await deleteExhibit(
        item
      )
    } catch (error) {
      showToast(
        String(error)
      )
    }
  }

  function moveItem(
    item: Exhibit,
    x: number,
    y: number
  ) {
    const updated = {
      ...item,
      x,
      y
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

    window.clearTimeout(
      (
        window as any
      ).__museumMoveTimer
    )

    ;(
      window as any
    ).__museumMoveTimer =
      window.setTimeout(
        () =>
          updateExhibit(
            updated
          ).catch(
            () => {}
          ),
        300
      )
  }

  async function addDecoration(
    kind: DecorationKind
  ) {
    if (!currentRoom) return

    try {
      const decoration =
        await createDecoration(
          currentRoom.id,
          kind
        )

      setDecorations(
        previous => [
          ...previous,
          decoration
        ]
      )

      setDecorationPicker(
        false
      )

      showToast(
        'Decoración añadida ✨'
      )
    } catch (error) {
      showToast(
        String(error)
      )
    }
  }

  function moveDecoration(
    decoration:
      Decoration,
    x: number,
    y: number
  ) {
    const updated = {
      ...decoration,
      x,
      y
    }

    setDecorations(
      previous =>
        previous.map(
          current =>
            current.id ===
            decoration.id
              ? updated
              : current
        )
    )

    window.clearTimeout(
      (
        window as any
      ).__decorMoveTimer
    )

    ;(
      window as any
    ).__decorMoveTimer =
      window.setTimeout(
        () =>
          updateDecoration(
            updated
          ).catch(
            () => {}
          ),
        300
      )
  }

  async function saveDecoration(
    decoration:
      Decoration
  ) {
    setDecorations(
      previous =>
        previous.map(
          current =>
            current.id ===
            decoration.id
              ? decoration
              : current
        )
    )

    setEditingDecoration(
      null
    )

    try {
      await updateDecoration(
        decoration
      )
    } catch (error) {
      showToast(
        String(error)
      )
    }
  }

  async function removeDecoration(
    decoration:
      Decoration
  ) {
    setDecorations(
      previous =>
        previous.filter(
          current =>
            current.id !==
            decoration.id
        )
    )

    setEditingDecoration(
      null
    )

    try {
      await deleteDecoration(
        decoration
      )
    } catch (error) {
      showToast(
        String(error)
      )
    }
  }

  function openRoom(
    id: string
  ) {
    const index =
      rooms.findIndex(
        room =>
          room.id === id
      )

    if (index < 0) return

    const room =
      rooms[index]

    setTravellingRoom(
      room
    )

    window.setTimeout(
      () => {
        setRoomIndex(index)
        setFilter(null)
        setMode(
          'museum'
        )
      },
      520
    )

    window.setTimeout(
      () =>
        setTravellingRoom(
          null
        ),
      1050
    )
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <Sparkles className="pulse" />
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <main className="app-shell">
      <nav className="top-nav">
        <button
          className="brand"
          onClick={() =>
            setMode(
              'museum'
            )
          }
        >
          <span className="brand-mark">
            <Sparkles
              size={15}
            />
          </span>

          MuseoYo
        </button>

        <button
          className="icon-button glass"
          onClick={() =>
            supabase.auth
              .signOut()
          }
          title="Salir"
        >
          <LogOut
            size={16}
          />
        </button>
      </nav>

      <div className="view-area">
        {mode ===
        'orion' ? (
          <Orion
            rooms={rooms}
            exhibits={exhibits}
            onOpenRoom={
              openRoom
            }
          />
        ) : rooms.length ===
          0 ? (
          <section className="first-room">
            <Sparkles
              size={42}
            />

            <h1>
              Tu museo
              todavía está vacío
            </h1>

            <p>
              Empieza creando
              un mundo para una
              parte de ti.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                setRoomModal(
                  'new'
                )
              }
            >
              <Plus />
              Crear mi primera sala
            </button>
          </section>
        ) : (
          <div className="rooms-track">
            <RoomView
              room={
                currentRoom
              }

              exhibits={
                roomExhibits
              }

              decorations={
                roomDecorations
              }

              selectedFilter={
                filter
              }

              onFilter={
                setFilter
              }

              onAdd={() => {
                setEditingItem(
                  null
                )

                setItemModal(
                  'new'
                )
              }}

              onEdit={
                item => {
                  setEditingItem(
                    item
                  )

                  setItemModal(
                    'edit'
                  )
                }
              }

              onEditRoom={() =>
                setRoomModal(
                  'edit'
                )
              }

              onMove={
                moveItem
              }

              onOpenDecorationPicker={() =>
                setDecorationPicker(
                  true
                )
              }

              onEditDecoration={
                decoration =>
                  setEditingDecoration(
                    decoration
                  )
              }

              onMoveDecoration={
                moveDecoration
              }
            />
          </div>
        )}
      </div>

      {mode ===
        'museum' &&
        rooms.length >
          0 && (
        <div className="room-dots">
          {rooms.map(
            (
              room,
              index
            ) => (
              <button
                key={
                  room.id
                }
                className={
                  index ===
                  roomIndex
                    ? 'active'
                    : ''
                }
                onClick={() => {
                  setRoomIndex(
                    index
                  )

                  setFilter(
                    null
                  )
                }}
              />
            )
          )}
        </div>
      )}

      <nav className="bottom-nav glass">
        <button
          className={
            mode ===
            'museum'
              ? 'active'
              : ''
          }
          onClick={() =>
            setMode(
              'museum'
            )
          }
        >
          <Grid2X2 />

          <span>
            Museo
          </span>
        </button>

        <button
          className={
            mode ===
            'orion'
              ? 'active'
              : ''
          }
          onClick={() =>
            setMode(
              'orion'
            )
          }
        >
          <Orbit />

          <span>
            Orión
          </span>
        </button>

        <button
          onClick={() =>
            setRoomModal(
              'new'
            )
          }
        >
          <Plus />

          <span>
            Sala
          </span>
        </button>
      </nav>

      {roomModal && (
        <RoomModal
          room={
            roomModal ===
            'edit'
              ? currentRoom
              : null
          }

          onClose={() =>
            setRoomModal(
              null
            )
          }

          onSave={
            roomModal ===
            'edit'
              ? saveExistingRoom
              : saveNewRoom
          }

          onDelete={
            roomModal ===
            'edit'
              ? removeRoom
              : undefined
          }
        />
      )}

      {itemModal &&
        currentRoom && (
        <ExhibitModal
          room={
            currentRoom
          }

          item={
            itemModal ===
            'edit'
              ? editingItem
              : null
          }

          onClose={() =>
            setItemModal(
              null
            )
          }

          onSaveNew={
            addItem
          }

          onSaveExisting={
            saveItem
          }

          onDelete={
            removeItem
          }
        />
      )}

      {decorationPicker && (
        <DecorationPicker
          onClose={() =>
            setDecorationPicker(
              false
            )
          }

          onSelect={
            addDecoration
          }
        />
      )}

      {editingDecoration && (
        <DecorationEditor
          decoration={
            editingDecoration
          }

          onClose={() =>
            setEditingDecoration(
              null
            )
          }

          onSave={
            saveDecoration
          }

          onDelete={
            removeDecoration
          }
        />
      )}

      {travellingRoom && (
        <TravelPortal
          room={
            travellingRoom
          }
        />
      )}

      {toast && (
        <div className="toast glass">
          {toast}
        </div>
      )}
    </main>
  )
}