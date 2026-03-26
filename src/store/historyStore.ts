import { create } from 'zustand'
import { StreamingEntry } from '@/types/history'

interface HistoryStore {
  entries: StreamingEntry[]
  fileNames: string[]
  addEntries: (newEntries: StreamingEntry[], fileName: string) => void
  reset: () => void
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  entries: [],
  fileNames: [],

  addEntries: (newEntries, fileName) =>
    set((state) => ({
      entries: [...state.entries, ...newEntries],
      fileNames: [...state.fileNames, fileName],
    })),

  reset: () => set({ entries: [], fileNames: [] }),
}))