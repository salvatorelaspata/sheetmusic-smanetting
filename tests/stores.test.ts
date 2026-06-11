import { beforeEach, describe, expect, it } from 'vitest'
import { useProgress } from '../src/state/progressStore'
import { useStats } from '../src/state/statsStore'
import { useCompositions } from '../src/state/compositionsStore'
import { createScore } from '../src/core/score'

describe('progressStore', () => {
  beforeEach(() => useProgress.getState().reset())

  it('un quiz non superato non completa la lezione', () => {
    const passed = useProgress.getState().recordQuiz('l1', 0.6)
    expect(passed).toBe(false)
    expect(useProgress.getState().isCompleted('l1')).toBe(false)
    expect(useProgress.getState().bestScore('l1')).toBeCloseTo(0.6)
  })

  it('un quiz superato completa la lezione e aggiorna il conteggio', () => {
    expect(useProgress.getState().recordQuiz('l1', 0.9)).toBe(true)
    expect(useProgress.getState().isCompleted('l1')).toBe(true)
    expect(useProgress.getState().completedCount()).toBe(1)
  })

  it('mantiene il punteggio migliore', () => {
    useProgress.getState().recordQuiz('l1', 0.9)
    useProgress.getState().recordQuiz('l1', 0.4)
    expect(useProgress.getState().bestScore('l1')).toBeCloseTo(0.9)
    expect(useProgress.getState().isCompleted('l1')).toBe(true)
  })
})

describe('statsStore', () => {
  beforeEach(() => useStats.getState().reset())

  it('accumula i risultati di sessione', () => {
    useStats.getState().recordSession('riconosci-nota', { correct: 8, total: 10, bestStreak: 5 })
    useStats.getState().recordSession('riconosci-nota', { correct: 9, total: 10, bestStreak: 7 })
    const s = useStats.getState().statsFor('riconosci-nota')
    expect(s.attempts).toBe(20)
    expect(s.correct).toBe(17)
    expect(s.bestStreak).toBe(7)
    expect(s.sessions).toBe(2)
  })

  it('calcola accuratezza e serie migliore complessive', () => {
    useStats.getState().recordSession('riconosci-nota', { correct: 8, total: 10, bestStreak: 5 })
    useStats.getState().recordSession('armature', { correct: 2, total: 10, bestStreak: 2 })
    expect(useStats.getState().accuracy()).toBeCloseTo(0.5)
    expect(useStats.getState().accuracy('riconosci-nota')).toBeCloseTo(0.8)
    expect(useStats.getState().bestStreakOverall()).toBe(5)
    expect(useStats.getState().totalAttempts()).toBe(20)
  })
})

describe('compositionsStore', () => {
  beforeEach(() => useCompositions.setState({ items: [] }))

  it('salva, aggiorna per id e duplica', () => {
    const score = createScore({ title: 'Brano 1' })
    useCompositions.getState().save(score)
    expect(useCompositions.getState().items).toHaveLength(1)

    // Salvare con lo stesso id aggiorna, non duplica.
    useCompositions.getState().save({ ...score, title: 'Brano 1 bis' })
    expect(useCompositions.getState().items).toHaveLength(1)
    expect(useCompositions.getState().get(score.id)?.title).toBe('Brano 1 bis')

    const copy = useCompositions.getState().duplicate(score.id)
    expect(copy?.id).not.toBe(score.id)
    expect(copy?.title).toContain('(copia)')
    expect(useCompositions.getState().items).toHaveLength(2)
  })

  it('rimuove una composizione', () => {
    const score = createScore({ title: 'Da rimuovere' })
    useCompositions.getState().save(score)
    useCompositions.getState().remove(score.id)
    expect(useCompositions.getState().items).toHaveLength(0)
  })
})
