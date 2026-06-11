import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Soglia di superamento del quiz (80%). */
export const PASS_THRESHOLD = 0.8

export interface LessonProgress {
  completed: boolean
  /** Miglior punteggio quiz, 0..1. */
  bestScorePct: number
  completedAt?: number
}

interface ProgressState {
  lessons: Record<string, LessonProgress>
  /** Registra l'esito di un quiz (scorePct 0..1). Ritorna true se superato. */
  recordQuiz: (lessonId: string, scorePct: number, passThreshold?: number) => boolean
  isCompleted: (lessonId: string) => boolean
  bestScore: (lessonId: string) => number
  completedCount: () => number
  reset: () => void
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      lessons: {},

      recordQuiz: (lessonId, scorePct, passThreshold = PASS_THRESHOLD) => {
        const passed = scorePct >= passThreshold
        set((s) => {
          const prev = s.lessons[lessonId]
          const completed = (prev?.completed ?? false) || passed
          return {
            lessons: {
              ...s.lessons,
              [lessonId]: {
                completed,
                bestScorePct: Math.max(prev?.bestScorePct ?? 0, scorePct),
                completedAt: completed ? (prev?.completedAt ?? Date.now()) : undefined,
              },
            },
          }
        })
        return passed
      },

      isCompleted: (lessonId) => get().lessons[lessonId]?.completed ?? false,
      bestScore: (lessonId) => get().lessons[lessonId]?.bestScorePct ?? 0,
      completedCount: () => Object.values(get().lessons).filter((l) => l.completed).length,
      reset: () => set({ lessons: {} }),
    }),
    { name: 'smanetting:progress', version: 1 },
  ),
)
