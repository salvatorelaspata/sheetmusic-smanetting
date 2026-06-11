import { useRef, useState } from 'react'
import { useStats } from '../../state/statsStore'

export interface ExerciseError {
  context?: string
  given: string
  expected: string
}

export interface ExerciseSession<Q> {
  question: Q
  /** Numero di risposte già date. */
  answered: number
  total: number
  correct: number
  streak: number
  bestStreak: number
  errors: ExerciseError[]
  phase: 'playing' | 'done'
  /** Registra una risposta e passa alla domanda successiva (o termina). */
  commit: (isCorrect: boolean, error?: ExerciseError) => void
  /** Termina subito la sessione (es. allo scadere del tempo). */
  finishNow: () => void
  restart: () => void
}

/**
 * Infrastruttura comune agli esercizi: punteggio, streak, raccolta errori e
 * salvataggio della sessione in statsStore al termine. `generate` produce la
 * prossima domanda (può dipendere dal livello: cambiandolo, chiamare restart()).
 */
export function useExercise<Q>(opts: {
  exerciseId: string
  total?: number
  generate: () => Q
}): ExerciseSession<Q> {
  const total = opts.total ?? 10
  const recordSession = useStats((s) => s.recordSession)

  const [question, setQuestion] = useState<Q>(() => opts.generate())
  const [answered, setAnswered] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [errors, setErrors] = useState<ExerciseError[]>([])
  const [phase, setPhase] = useState<'playing' | 'done'>('playing')
  const recorded = useRef(false)

  const finish = (answeredCount: number, correctCount: number, best: number) => {
    if (recorded.current) return
    recorded.current = true
    recordSession(opts.exerciseId, {
      correct: correctCount,
      total: answeredCount,
      bestStreak: best,
    })
    setPhase('done')
  }

  const commit = (isCorrect: boolean, error?: ExerciseError) => {
    const newAnswered = answered + 1
    const newCorrect = correct + (isCorrect ? 1 : 0)
    const newStreak = isCorrect ? streak + 1 : 0
    const newBest = Math.max(bestStreak, newStreak)

    setAnswered(newAnswered)
    setCorrect(newCorrect)
    setStreak(newStreak)
    setBestStreak(newBest)
    if (!isCorrect && error) setErrors((e) => [...e, error])

    if (newAnswered >= total) {
      finish(newAnswered, newCorrect, newBest)
    } else {
      setQuestion(opts.generate())
    }
  }

  const finishNow = () => finish(answered, correct, bestStreak)

  const restart = () => {
    recorded.current = false
    setQuestion(opts.generate())
    setAnswered(0)
    setCorrect(0)
    setStreak(0)
    setBestStreak(0)
    setErrors([])
    setPhase('playing')
  }

  return {
    question,
    answered,
    total,
    correct,
    streak,
    bestStreak,
    errors,
    phase,
    commit,
    finishNow,
    restart,
  }
}
