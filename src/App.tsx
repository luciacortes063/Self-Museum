import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Grid2X2, LogOut, Orbit, Plus, Sparkles } from 'lucide-react'
import { supabase } from './lib/supabase'
import {
  createExhibit, createRoom, deleteExhibit, deleteRoom,
  loadExhibits, loadRooms, updateExhibit, updateRoom
} from './lib/api'
import type { Exhibit, Room, RoomTheme } from './types'
import Auth from './components/Auth'
import Orion from './components/Orion'
import RoomView from './components/RoomView'
import { ExhibitModal, RoomModal } from './components/Modal'

type ViewMode = 'museum' | 'orion'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState<Room[]>([])
  const [exhibits, setExhibits] = useState<Exhibit[]>([])
  const [roomIndex, setRoomIndex] = useState(0)
  const [mode, setMode] = useState<ViewMode>('museum')
  const [filter, setFilter] = useState<string | null>(null)
  const [roomModal, setRoomModal] = useState<'new' | 'edit' | null>(null)
  const [itemModal, setItemModal] = useState<'new' | 'edit' | null>(null)
  const [editingItem, setEditingItem] = useState<Exhibit | null>(null)
  const [toast, setToast] = useState('')

  const currentRoom = rooms[roomIndex]
  const roomExhibits = useMemo(
    () => exhibits.filter(e => e.room_id === currentRoom?.id),
    [exhibits, currentRoom]
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    refresh()
  }, [session])

  async function refresh() {
    try {
      const nextRooms = await loadRooms()
      setRooms(nextRooms)
      setExhibits(await loadExhibits(nextRooms.map(r => r.id)))
      setRoomIndex(i => Math.min(i, Math.max(nextRooms.length - 1, 0)))
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'No se pudo cargar el museo')
    }
  }

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  async function saveNewRoom(value: { title: string; subtitle: string; theme: RoomTheme; filters: string[] }) {
    try {
      const room = await createRoom({
        ...value,
        icon: 'sparkles',
        sort_order: rooms.length
      })
      setRooms(prev => [...prev, room])
      setRoomIndex(rooms.length)
      setRoomModal(null)
      showToast('Nueva sala creada ✨')
    } catch (e) { showToast(String(e)) }
  }

  async function saveExistingRoom(value: { title: string; subtitle: string; theme: RoomTheme; filters: string[] }) {
    if (!currentRoom) return
    const updated = { ...currentRoom, ...value }
    setRooms(prev => prev.map(r => r.id === updated.id ? updated : r))
    setRoomModal(null)
    try { await updateRoom(updated) } catch (e) { showToast(String(e)) }
  }

  async function removeRoom() {
    if (!currentRoom) return
    if (!confirm('¿Eliminar esta sala y todas sus piezas?')) return
    try {
      await deleteRoom(currentRoom.id)
      const next = rooms.filter(r => r.id !== currentRoom.id)
      setRooms(next)
      setExhibits(prev => prev.filter(e => e.room_id !== currentRoom.id))
      setRoomIndex(0)
      setRoomModal(null)
    } catch (e) { showToast(String(e)) }
  }

  async function addItem(value: { title: string; note: string; category: string | null; file: File | null }) {
    if (!currentRoom) return
    try {
      const item = await createExhibit(currentRoom.id, {
        ...value,
        x: .5 + (Math.random() - .5) * .18,
        y: .35 + (roomExhibits.length % 4) * .16
      })
      setExhibits(prev => [...prev, item])
      setItemModal(null)
      showToast('Pieza añadida al museo ✨')
    } catch (e) { showToast(String(e)) }
  }

  async function saveItem(item: Exhibit) {
    setExhibits(prev => prev.map(e => e.id === item.id ? item : e))
    setItemModal(null)
    try { await updateExhibit(item) } catch (e) { showToast(String(e)) }
  }

  async function removeItem(item: Exhibit) {
    if (!confirm('¿Eliminar esta pieza?')) return
    setExhibits(prev => prev.filter(e => e.id !== item.id))
    setItemModal(null)
    try { await deleteExhibit(item) } catch (e) { showToast(String(e)) }
  }

  function moveItem(item: Exhibit, x: number, y: number) {
    const updated = { ...item, x, y }
    setExhibits(prev => prev.map(e => e.id === item.id ? updated : e))
  }

  async function finishMove(item: Exhibit) {
    try { await updateExhibit(item) } catch {}
  }

  function openRoom(id: string) {
    const index = rooms.findIndex(r => r.id === id)
    if (index >= 0) setRoomIndex(index)
    setMode('museum')
  }

  if (loading) return <div className="loading-screen"><Sparkles className="pulse" /></div>
  if (!session) return <Auth />

  return (
    <main className="app-shell">
      <nav className="top-nav">
        <button className="brand" onClick={() => setMode('museum')}>
          <span className="brand-mark"><Sparkles size={15}/></span>
          MuseoYo
        </button>
        <button className="icon-button glass" onClick={() => supabase.auth.signOut()} title="Salir"><LogOut size={16}/></button>
      </nav>

      <div className="view-area">
        {mode === 'orion' ? (
          <Orion rooms={rooms} exhibits={exhibits} onOpenRoom={openRoom} />
        ) : rooms.length === 0 ? (
          <section className="first-room">
            <Sparkles size={42}/>
            <h1>Tu museo todavía está vacío</h1>
            <p>Empieza creando una sala para una parte de tu mundo.</p>
            <button className="primary-button" onClick={() => setRoomModal('new')}><Plus/> Crear mi primera sala</button>
          </section>
        ) : (
          <div
            className="rooms-track"
            onTouchStart={e => (e.currentTarget.dataset.startx = String(e.touches[0].clientX))}
            onTouchEnd={e => {
              const start = Number(e.currentTarget.dataset.startx || 0)
              const diff = e.changedTouches[0].clientX - start
              if (Math.abs(diff) < 70) return
              setFilter(null)
              setRoomIndex(i => diff < 0 ? Math.min(rooms.length - 1, i + 1) : Math.max(0, i - 1))
            }}
          >
            <RoomView
              room={currentRoom}
              exhibits={roomExhibits}
              selectedFilter={filter}
              onFilter={setFilter}
              onAdd={() => { setEditingItem(null); setItemModal('new') }}
              onEdit={item => { setEditingItem(item); setItemModal('edit') }}
              onEditRoom={() => setRoomModal('edit')}
              onMove={(item, x, y) => {
                moveItem(item, x, y)
                // debounce-like save after pointer activity
                window.clearTimeout((window as any).__museumMoveTimer)
                ;(window as any).__museumMoveTimer = window.setTimeout(() => {
                  const latest = { ...item, x, y }
                  finishMove(latest)
                }, 350)
              }}
            />
          </div>
        )}
      </div>

      {mode === 'museum' && rooms.length > 0 && (
        <div className="room-dots" aria-label="Salas">
          {rooms.map((r, i) => <button key={r.id} className={i === roomIndex ? 'active' : ''} onClick={() => { setRoomIndex(i); setFilter(null) }} />)}
        </div>
      )}

      <nav className="bottom-nav glass">
        <button className={mode === 'museum' ? 'active' : ''} onClick={() => setMode('museum')}><Grid2X2/><span>Museo</span></button>
        <button className={mode === 'orion' ? 'active' : ''} onClick={() => setMode('orion')}><Orbit/><span>Orión</span></button>
        <button onClick={() => setRoomModal('new')}><Plus/><span>Sala</span></button>
      </nav>

      {roomModal && (
        <RoomModal
          room={roomModal === 'edit' ? currentRoom : null}
          onClose={() => setRoomModal(null)}
          onSave={roomModal === 'edit' ? saveExistingRoom : saveNewRoom}
          onDelete={roomModal === 'edit' ? removeRoom : undefined}
        />
      )}

      {itemModal && currentRoom && (
        <ExhibitModal
          room={currentRoom}
          item={itemModal === 'edit' ? editingItem : null}
          onClose={() => setItemModal(null)}
          onSaveNew={addItem}
          onSaveExisting={saveItem}
          onDelete={removeItem}
        />
      )}

      {toast && <div className="toast glass">{toast}</div>}
    </main>
  )
}
