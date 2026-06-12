import { useState } from 'react'
import type { Score } from '../../core/model'

interface HistoryState {
  past: Score[]
  present: Score
  future: Score[]
}

const LIMIT = 100

/** Cronologia dello Score con undo/redo (stack di snapshot). */
export function useScoreHistory(initial: Score) {
  const [h, setH] = useState<HistoryState>({ past: [], present: initial, future: [] })

  return {
    score: h.present,
    canUndo: h.past.length > 0,
    canRedo: h.future.length > 0,
    /** Registra una modifica (azzera il redo). */
    set: (next: Score) =>
      setH((s) => ({ past: [...s.past, s.present].slice(-LIMIT), present: next, future: [] })),
    /** Sostituisce lo stato senza cronologia (nuovo / apri). */
    reset: (next: Score) => setH({ past: [], present: next, future: [] }),
    undo: () =>
      setH((s) =>
        s.past.length === 0
          ? s
          : {
              past: s.past.slice(0, -1),
              present: s.past[s.past.length - 1],
              future: [s.present, ...s.future],
            },
      ),
    redo: () =>
      setH((s) =>
        s.future.length === 0
          ? s
          : { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) },
      ),
  }
}
