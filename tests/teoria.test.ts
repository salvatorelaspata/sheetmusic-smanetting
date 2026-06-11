import { describe, expect, it } from 'vitest'
import { ALL_LESSONS, isLessonUnlocked } from '../src/data/moduli'
import { LESSONS } from '../src/data/lezioni'

describe('teoria — sblocco sequenziale', () => {
  it('la prima lezione è sempre sbloccata', () => {
    expect(isLessonUnlocked(ALL_LESSONS[0].id, new Set())).toBe(true)
  })

  it('la seconda è bloccata finché la prima non è completata', () => {
    const second = ALL_LESSONS[1].id
    expect(isLessonUnlocked(second, new Set())).toBe(false)
    expect(isLessonUnlocked(second, new Set([ALL_LESSONS[0].id]))).toBe(true)
  })
})

describe('teoria — consistenza contenuti', () => {
  it('ogni lezione del catalogo ha un contenuto', () => {
    for (const l of ALL_LESSONS) {
      expect(LESSONS[l.id], `manca il contenuto di ${l.id}`).toBeDefined()
    }
  })

  it('ogni quiz ha almeno 3 domande con correctIndex valido', () => {
    for (const l of ALL_LESSONS) {
      const lesson = LESSONS[l.id]
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(3)
      for (const q of lesson.quiz) {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex).toBeLessThan(q.options.length)
      }
    }
  })
})
