import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Staff } from '../../components/music/Staff'
import { Button } from '../../components/ui/Button'
import { ExerciseHeader, ScoreBar, SessionSummary } from '../../components/exercises/ExerciseShell'
import { useExercise } from '../../components/exercises/useExercise'
import { createNote, dur } from '../../core/score'
import { durationTicks, PPQ } from '../../core/durations'
import { randomItem } from '../../core/random'
import { ensureAudio, playClick, playSequence } from '../../audio/audio'
import type { Duration, NoteElement } from '../../core/model'

const BPM = 80
const BEAT_MS = 60000 / BPM
const HIT_WINDOW = 0.3 // in movimenti

const PATTERNS: Duration[][] = [
  [dur('quarter'), dur('quarter'), dur('quarter'), dur('quarter')],
  [dur('half'), dur('quarter'), dur('quarter')],
  [dur('quarter'), dur('quarter'), dur('half')],
  [dur('quarter'), dur('eighth'), dur('eighth'), dur('quarter'), dur('quarter')],
  [dur('eighth'), dur('eighth'), dur('eighth'), dur('eighth'), dur('half')],
  [dur('half'), dur('half')],
]

interface Question {
  elements: NoteElement[]
  onsets: number[]
}

function makeQuestion(): Question {
  const durs = randomItem(PATTERNS)
  const elements = durs.map((d) => createNote([{ step: 'B', octave: 4 }], d))
  let beat = 0
  const onsets: number[] = []
  for (const d of durs) {
    onsets.push(beat)
    beat += durationTicks(d) / PPQ
  }
  return { elements, onsets }
}

type Phase = 'idle' | 'countin' | 'recording' | 'feedback'

export default function Ritmo() {
  const { t } = useTranslation()
  const session = useExercise<Question>({ exerciseId: 'ritmo', total: 5, generate: makeQuestion })

  const [phase, setPhase] = useState<Phase>('idle')
  const [beat, setBeat] = useState(0)
  const [result, setResult] = useState<{ hits: number; total: number; isCorrect: boolean } | null>(null)

  const taps = useRef<number[]>([])
  const recordStart = useRef(0)
  const timers = useRef<number[]>([])

  const q = session.question

  const clearTimers = () => {
    timers.current.forEach((id) => clearTimeout(id))
    timers.current = []
  }
  useEffect(() => () => clearTimers(), [])

  const listen = () => {
    void playSequence(q.elements, { bpm: BPM })
  }

  const evaluate = (question: Question) => {
    const used = new Array(taps.current.length).fill(false)
    let hits = 0
    for (const onset of question.onsets) {
      let bestIdx = -1
      let bestDiff = Infinity
      taps.current.forEach((tp, i) => {
        if (used[i]) return
        const d = Math.abs(tp - onset)
        if (d < bestDiff) {
          bestDiff = d
          bestIdx = i
        }
      })
      if (bestIdx >= 0 && bestDiff <= HIT_WINDOW) {
        hits++
        used[bestIdx] = true
      }
    }
    const isCorrect = question.onsets.length > 0 && hits / question.onsets.length >= 0.75
    setResult({ hits, total: question.onsets.length, isCorrect })
    setPhase('feedback')
  }

  const start = async () => {
    clearTimers()
    taps.current = []
    setResult(null)
    setBeat(0)
    setPhase('countin')
    await ensureAudio()
    const question = q
    const t0 = performance.now() + 250
    recordStart.current = t0 + 4 * BEAT_MS
    for (let b = 0; b < 8; b++) {
      const id = window.setTimeout(
        () => {
          void playClick(b % 4 === 0)
          setBeat((b % 4) + 1)
          if (b === 4) setPhase('recording')
        },
        Math.max(0, t0 + b * BEAT_MS - performance.now()),
      )
      timers.current.push(id)
    }
    const endId = window.setTimeout(
      () => evaluate(question),
      Math.max(0, t0 + 8 * BEAT_MS - performance.now()),
    )
    timers.current.push(endId)
  }

  const tap = () => {
    if (phase !== 'recording') return
    taps.current.push((performance.now() - recordStart.current) / BEAT_MS)
  }

  // Barra spaziatrice per battere il tempo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        tap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const advance = () => {
    const isCorrect = result?.isCorrect ?? false
    const error = isCorrect
      ? undefined
      : {
          context: t('exercises.ritmo.title'),
          given: `${result?.hits ?? 0}/${result?.total ?? 0}`,
          expected: `${result?.total ?? 0}/${result?.total ?? 0}`,
        }
    setResult(null)
    setPhase('idle')
    setBeat(0)
    session.commit(isCorrect, error)
  }

  if (session.phase === 'done') {
    return (
      <div className="space-y-6">
        <ExerciseHeader title={t('exercises.ritmo.title')} />
        <SessionSummary
          correct={session.correct}
          total={session.answered}
          bestStreak={session.bestStreak}
          errors={session.errors}
          onRestart={() => {
            setPhase('idle')
            setResult(null)
            session.restart()
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ExerciseHeader title={t('exercises.ritmo.title')} subtitle={t('exercises.ritmo.desc')} />
      <ScoreBar answered={session.answered} total={session.total} correct={session.correct} streak={session.streak} />

      <Staff clef="treble" timeSignature={{ beats: 4, beatType: 4 }} elements={q.elements} height={150} />

      <div className="rounded-xl border border-border bg-surface p-5 text-center">
        {phase === 'idle' && (
          <div className="space-y-4">
            <p className="text-sm text-muted">{t('exercises.ritmo.instructions')}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={listen}>
                🔊 {t('exercises.ritmo.listen')}
              </Button>
              <Button onClick={start}>{t('exercises.ritmo.play')}</Button>
            </div>
          </div>
        )}

        {phase === 'countin' && (
          <p className="text-2xl font-bold tabular-nums">
            {t('exercises.ritmo.getReady')} {beat || ''}
          </p>
        )}

        {(phase === 'recording' || phase === 'feedback') && (
          <div className="space-y-4">
            {phase === 'recording' && (
              <p className="text-lg font-semibold text-brand">{t('exercises.ritmo.now')}</p>
            )}
            <button
              type="button"
              onClick={tap}
              disabled={phase !== 'recording'}
              className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-brand text-lg font-bold text-brand-fg transition-transform active:scale-95 disabled:opacity-40"
            >
              TAP
            </button>
            <p className="text-xs text-muted">{t('exercises.ritmo.tapHint')}</p>
          </div>
        )}

        {phase === 'feedback' && result && (
          <div className="mt-4 space-y-3">
            <p className={`font-medium ${result.isCorrect ? 'text-success' : 'text-danger'}`}>
              {t('exercises.ritmo.hits', { hits: result.hits, total: result.total })}
            </p>
            <Button onClick={advance}>{t('exercises.continue')}</Button>
          </div>
        )}
      </div>
    </div>
  )
}
