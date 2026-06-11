import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Score } from '../core/model'
import { makeId } from '../core/ids'

interface CompositionsState {
  items: Score[]
  /** Inserisce o aggiorna una composizione (per id) e aggiorna updatedAt. */
  save: (score: Score) => void
  remove: (id: string) => void
  rename: (id: string, title: string) => void
  duplicate: (id: string) => Score | undefined
  get: (id: string) => Score | undefined
  /** Composizioni ordinate dalla più recente. */
  recent: () => Score[]
}

export const useCompositions = create<CompositionsState>()(
  persist(
    (set, get) => ({
      items: [],

      save: (score) => {
        const stamped: Score = { ...score, updatedAt: Date.now() }
        set((s) => {
          const exists = s.items.some((it) => it.id === score.id)
          return {
            items: exists
              ? s.items.map((it) => (it.id === score.id ? stamped : it))
              : [...s.items, stamped],
          }
        })
      },

      remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),

      rename: (id, title) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id ? { ...it, title, updatedAt: Date.now() } : it,
          ),
        })),

      duplicate: (id) => {
        const original = get().items.find((it) => it.id === id)
        if (!original) return undefined
        const now = Date.now()
        const copy: Score = {
          ...original,
          id: makeId('score'),
          title: `${original.title} (copia)`,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ items: [...s.items, copy] }))
        return copy
      },

      get: (id) => get().items.find((it) => it.id === id),

      recent: () => [...get().items].sort((a, b) => b.updatedAt - a.updatedAt),
    }),
    { name: 'smanetting:compositions', version: 1 },
  ),
)
