import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Staff } from '../../components/music/Staff'
import { PianoKeyboard } from '../../components/music/PianoKeyboard'
import { NoteNameButtons } from '../../components/music/NoteNameButtons'
import { Button } from '../../components/ui/Button'
import {
  ExerciseHeader,
  ScoreBar,
  SessionSummary,
} from '../../components/exercises/ExerciseShell'
import { useExercise } from '../../components/exercises/useExercise'
import { PITCH_CLASS_NAMES_IT, RICONOSCI_LEVELS } from '../../data/riconosci'
import { createNote, dur } from '../../core/score'
import { noteName, pitchClass, stepPitchClass } from '../../core/pitch'
import { randomItem } from '../../core/random'
import type { Pitch, Step } from '../../core/model'
import { playPitch } from '../../audio/audio'
import { useSettings } from '../../state/settingsStore'

const TIMED_SECONDS = 60

interface Answer {
  givenPc: number
  isCorrect: boolean
}

export default function RiconosciNota() {
  const { t } = useTranslation()
  const showEnglish = useSettings((s) => s.showEnglishNotation)

  const [levelIndex, setLevelIndex] = useState(0)
  const [inputMode, setInputMode] = useState<'nomi' | 'piano'>('nomi')
  const [timed, setTimed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMED_SECONDS)
  const [answer, setAnswer] = useState<Answer | null>(null)

  const level = RICONOSCI_LEVELS[levelIndex]
  const effectiveMode = level.id === 'alterazioni' ? 'piano' : inputMode

  const session = useExercise<{ pitch: Pitch }>({
    exerciseId: 'riconosci-nota',
    total: timed ? 9999 : 10,
    generate: () => ({ pitch: randomItem(level.pool) }),
  })

  const pitch = session.question.pitch
  const correctPc = pitchClass(pitch)
  const elements = useMemo(() => [createNote([pitch], dur('whole'))], [pitch])

  const restartAll = () => {
    setTimeLeft(TIMED_SECONDS)
    setAnswer(null)
    session.restart()
  }

  // Riparte cambiando livello o modalità a tempo.
  useEffect(() => {
    restartAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex, timed])

  // Countdown della modalità a tempo.
  useEffect(() => {
    if (!timed || session.phase !== 'playing') return
    if (timeLeft <= 0) {
      session.finishNow()
      return
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timed, timeLeft, session.phase])

  const advance = () => {
    if (!answer) return
    const error = answer.isCorrect
      ? undefined
      : {
          context: noteName(pitch, { alternate: showEnglish, withOctave: true }),
          given: PITCH_CLASS_NAMES_IT[answer.givenPc],
          expected: noteName(pitch, { alternate: showEnglish }),
        }
    setAnswer(null)
    session.commit(answer.isCorrect, error)
  }

  const handleAnswer = (givenPc: number) => {
    if (answer) return
    const isCorrect = givenPc === correctPc
    setAnswer({ givenPc, isCorrect })
    void playPitch(pitch)
    if (timed) window.setTimeout(() => advanceRef.current(), 500)
  }

  // advance deve usare l'ultima closure (pitch/answer correnti) anche dal setTimeout.
  const advanceRef = useRef(advance)
  advanceRef.current = advance

  // Invio per continuare (modalità normale).
  useEffect(() => {
    if (timed) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && answer) advance()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timed, answer])

  if (session.phase === 'done') {
    return (
      <div className="space-y-6">
        <ExerciseHeader title={t('exercises.riconosci.title')} />
        <SessionSummary
          correct={session.correct}
          total={session.answered}
          bestStreak={session.bestStreak}
          errors={session.errors}
          onRestart={restartAll}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ExerciseHeader title={t('exercises.riconosci.title')} subtitle={t('exercises.riconosci.desc')} />

      {/* Controlli */}
      <div className="flex flex-wrap items-center gap-2">
        {RICONOSCI_LEVELS.map((l, i) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLevelIndex(i)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              i === levelIndex ? 'bg-brand text-brand-fg' : 'bg-surface text-muted hover:bg-canvas border border-border'
            }`}
          >
            {l.label}
          </button>
        ))}
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="accent-brand" />
          {t('exercises.riconosci.timed')}
        </label>
      </div>

      <ScoreBar
        answered={session.answered}
        total={session.total}
        correct={session.correct}
        streak={session.streak}
        timeLeft={timed ? Math.max(0, timeLeft) : undefined}
      />

      <Staff clef={level.clef} elements={elements} height={180} />

      {/* Feedback */}
      <div className="min-h-6 text-center text-sm font-medium" aria-live="polite">
        {answer && (
          <span className={answer.isCorrect ? 'text-success' : 'text-danger'}>
            {answer.isCorrect
              ? t('exercises.correct')
              : t('exercises.wrongIs', { note: noteName(pitch, { alternate: showEnglish }) })}
          </span>
        )}
      </div>

      {/* Input */}
      {effectiveMode === 'nomi' ? (
        <NoteNameButtons
          onPress={(step: Step) => handleAnswer(stepPitchClass(step))}
          disabled={!!answer}
          highlightStep={answer && !answer.isCorrect ? pitch.step : undefined}
        />
      ) : (
        <PianoKeyboard
          onPress={handleAnswer}
          disabled={!!answer}
          highlightPc={answer ? correctPc : undefined}
          wrongPc={answer && !answer.isCorrect ? answer.givenPc : undefined}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        {level.id !== 'alterazioni' ? (
          <button
            type="button"
            onClick={() => setInputMode((m) => (m === 'nomi' ? 'piano' : 'nomi'))}
            className="text-sm text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            {effectiveMode === 'nomi' ? t('exercises.riconosci.usePiano') : t('exercises.riconosci.useNames')}
          </button>
        ) : (
          <span className="text-sm text-muted">{t('exercises.riconosci.pianoOnly')}</span>
        )}
        {answer && !timed && <Button onClick={advance}>{t('exercises.continue')}</Button>}
      </div>
    </div>
  )
}
