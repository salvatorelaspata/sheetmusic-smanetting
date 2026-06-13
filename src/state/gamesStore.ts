import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Record dei giochi (sezione "Gioco"), per difficoltà. Persistito in
 * localStorage come gli altri store (`smanetting:*`). Distinto da statsStore
 * (Pratica): qui contano i punteggi-record, non l'accuratezza media.
 */

export interface GameStats {
  bestScore: number
  bestStreak: number
  plays: number
  lastPlayedAt?: number
}

export interface GameResult {
  score: number
  bestStreak: number
}

const EMPTY: GameStats = { bestScore: 0, bestStreak: 0, plays: 0 }

const keyOf = (gameId: string, difficulty: string) => `${gameId}:${difficulty}`

interface GamesState {
  /** Chiave = `${gameId}:${difficulty}`. */
  results: Record<string, GameStats>
  recordGame: (gameId: string, difficulty: string, result: GameResult) => void
  statsFor: (gameId: string, difficulty: string) => GameStats
  /** Miglior punteggio di un gioco su tutte le difficoltà. */
  bestScoreForGame: (gameId: string) => number
  reset: () => void
}

export const useGames = create<GamesState>()(
  persist(
    (set, get) => ({
      results: {},

      recordGame: (gameId, difficulty, result) => {
        set((s) => {
          const k = keyOf(gameId, difficulty)
          const prev = s.results[k] ?? EMPTY
          return {
            results: {
              ...s.results,
              [k]: {
                bestScore: Math.max(prev.bestScore, result.score),
                bestStreak: Math.max(prev.bestStreak, result.bestStreak),
                plays: prev.plays + 1,
                lastPlayedAt: Date.now(),
              },
            },
          }
        })
      },

      statsFor: (gameId, difficulty) => get().results[keyOf(gameId, difficulty)] ?? EMPTY,

      bestScoreForGame: (gameId) =>
        Object.entries(get().results)
          .filter(([k]) => k.startsWith(`${gameId}:`))
          .reduce((max, [, v]) => Math.max(max, v.bestScore), 0),

      reset: () => set({ results: {} }),
    }),
    { name: 'smanetting:games', version: 1 },
  ),
)
