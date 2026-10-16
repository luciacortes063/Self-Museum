import type { Exhibit, Room, ShelfTemplate } from '../types'

export interface MuseumState {
  rooms: Room[]
  exhibits: Exhibit[]
  templates: ShelfTemplate[]
}

export const emptyMuseumState: MuseumState = {
  rooms: [],
  exhibits: [],
  templates: []
}

const DB_NAME = 'museoyo-local-db'
const STORE_NAME = 'kv'
const STATE_KEY = 'museum-state'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadMuseumState(): Promise<MuseumState> {
  try {
    const db = await openDb()

    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(STATE_KEY)

      request.onsuccess = () => {
        const data = request.result as MuseumState | undefined
        resolve(data ?? emptyMuseumState)
      }

      request.onerror = () => reject(request.error)
    })
  } catch {
    return emptyMuseumState
  }
}

export async function saveMuseumState(state: MuseumState): Promise<void> {
  const db = await openDb()

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    store.put(state, STATE_KEY)

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist) {
      await navigator.storage.persist()
    }
  } catch {
    // Not supported everywhere; IndexedDB still works without this.
  }
}
