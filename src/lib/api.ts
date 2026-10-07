import { supabase } from './supabase'
import type { Exhibit, Room } from '../types'

const BUCKET = 'museum-images'

export async function loadRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function loadExhibits(roomIds: string[]): Promise<Exhibit[]> {
  if (!roomIds.length) return []
  const { data, error } = await supabase
    .from('exhibits')
    .select('*')
    .in('room_id', roomIds)
    .order('created_at', { ascending: true })
  if (error) throw error

  const rows = (data ?? []) as Exhibit[]
  return Promise.all(rows.map(async row => {
    if (!row.image_path) return row
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(row.image_path, 60 * 60)
    return { ...row, imageUrl: signed?.signedUrl }
  }))
}

export async function createRoom(input: Omit<Room, 'id' | 'user_id'>) {
  const { data: session } = await supabase.auth.getUser()
  if (!session.user) throw new Error('Not signed in')
  const { data, error } = await supabase
    .from('rooms')
    .insert({ ...input, user_id: session.user.id })
    .select()
    .single()
  if (error) throw error
  return data as Room
}

export async function updateRoom(room: Room) {
  const { id, user_id, created_at, ...changes } = room
  const { error } = await supabase.from('rooms').update(changes).eq('id', id)
  if (error) throw error
}

export async function deleteRoom(roomId: string) {
  const { error } = await supabase.from('rooms').delete().eq('id', roomId)
  if (error) throw error
}

export async function createExhibit(
  roomId: string,
  input: {
    title: string
    note: string
    category: string | null
    x: number
    y: number
    file?: File | null
  }
) {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Not signed in')
  const userId = auth.user.id

  let imagePath: string | null = null
  if (input.file) {
    const ext = input.file.name.split('.').pop() || 'jpg'
    imagePath = `${userId}/${roomId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(imagePath, input.file, {
        cacheControl: '3600',
        upsert: false,
        contentType: input.file.type
      })
    if (uploadError) throw uploadError
  }

  const { data, error } = await supabase
    .from('exhibits')
    .insert({
      user_id: userId,
      room_id: roomId,
      title: input.title || 'Sin título',
      note: input.note,
      category: input.category,
      image_path: imagePath,
      x: input.x,
      y: input.y,
      scale: 1,
      rotation: 0
    })
    .select()
    .single()

  if (error) throw error

  let imageUrl: string | undefined
  if (imagePath) {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(imagePath, 60 * 60)
    imageUrl = signed?.signedUrl
  }
  return { ...(data as Exhibit), imageUrl }
}

export async function updateExhibit(exhibit: Exhibit) {
  const { id, user_id, created_at, imageUrl, ...changes } = exhibit
  const { error } = await supabase
    .from('exhibits')
    .update(changes)
    .eq('id', id)
  if (error) throw error
}

export async function deleteExhibit(exhibit: Exhibit) {
  if (exhibit.image_path) {
    await supabase.storage.from(BUCKET).remove([exhibit.image_path])
  }
  const { error } = await supabase.from('exhibits').delete().eq('id', exhibit.id)
  if (error) throw error
}
