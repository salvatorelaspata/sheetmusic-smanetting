import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ExerciseStats {
  attempts: number
  correct: number
  bestStreak: number
  sessions: number
  lastPlayedAt?: number
}

export interface SessionResult {
  correct: number
  total: number
  bestStreak: number
}

const EMPTY: ExerciseStats = { attempts: 0, correct: 0, bestStreak: 0, sessions: 0 }

interface StatsState {
  exercises: Record<string, ExerciseStats>
  /** Registra il risultato di una sessione di un esercizio. */
  recordSession: (exerciseId: string, result: SessionResult) => void
  statsFor: (exerciseId: string) => ExerciseStats
  /** Accuratezza 0..1 di un esercizio o complessiva. */
  accuracy: (exerciseId?: string) => number
  totalAttempts: () => number
  bestStreakOverall: () => number
  reset: () => void
}

export const useStats = create<StatsState>()(
  persist(
    (set, get) => ({
      exercises: {},

      recordSession: (exerciseId, result) => {
        set((s) => {
          const prev = s.exercises[exerciseId] ?? EMPTY
          return {
            exercises: {
              ...s.exercises,
              [exerciseId]: {
                attempts: prev.attempts + result.total,
                correct: prev.correct + result.correct,
                bestStreak: Math.max(prev.bestStreak, result.bestStreak),
                sessions: prev.sessions + 1,
                lastPlayedAt: Date.now(),
              },
            },
          }
        })
      },

      statsFor: (exerciseId) => get().exercises[exerciseId] ?? EMPTY,

      accuracy: (exerciseId) => {
        const all = Object.values(get().exercises)
        const list = exerciseId
          ? [get().exercises[exerciseId]].filter(Boolean) as ExerciseStats[]
          : all
        const attempts = list.reduce((sum, e) => sum + e.attempts, 0)
        const correct = list.reduce((sum, e) => sum + e.correct, 0)
        return attempts === 0 ? 0 : correct / attempts
      },

      totalAttempts: () =>
        Object.values(get().exercises).reduce((sum, e) => sum + e.attempts, 0),

      bestStreakOverall: () =>
        Object.values(get().exercises).reduce((max, e) => Math.max(max, e.bestStreak), 0),

      reset: () => set({ exercises: {} }),
    }),
    { name: 'smanetting:stats', version: 1 },
  ),
)
