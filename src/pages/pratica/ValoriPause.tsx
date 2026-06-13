import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Staff } from '../../components/music/Staff'
import { Button } from '../../components/ui/Button'
import { ChoiceButtons } from '../../components/exercises/ChoiceButtons'
import { ExerciseHeader, ScoreBar, SessionSummary } from '../../components/exercises/ExerciseShell'
import { useExercise } from '../../components/exercises/useExercise'
import { createNote, createRest, dur } from '../../core/score'
import { durationName, PALETTE_DURATIONS } from '../../core/durations'
import { randomItem, sample, shuffle } from '../../core/random'
import { playChord } from '../../audio/audio'
import type { DurationBase } from '../../core/model'

interface Question {
  base: DurationBase
  isRest: boolean
  /** Durate delle opzioni; i nomi sono resi al volo nella lingua dell'interfaccia. */
  optionBases: DurationBase[]
  correctIndex: number
}

const BASES = PALETTE_DURATIONS.map((d) => d.base)

function makeQuestion(): Question {
  const base = randomItem(BASES)
  const isRest = Math.random() < 0.4
  const distractors = sample(
    BASES.filter((b) => b !== base),
    3,
  )
  const optionBases = shuffle([base, ...distractors])
  return { base, isRest, optionBases, correctIndex: optionBases.indexOf(base) }
}

export default function ValoriPause() {
  const { t, i18n } = useTranslation()
  const session = useExercise<Question>({ exerciseId: 'valori-pause', total: 10, generate: makeQuestion })
  const [selected, setSelected] = useState<number | null>(null)

  const q = session.question
  const lang = i18n.language === 'en' ? 'en' : 'it'
  // I nomi delle durate seguono la lingua dell'interfaccia (Semibreve / Whole…).
  const options = q.optionBases.map((b) => durationName(b, lang))
  const elements = useMemo(
    () => [q.isRest ? createRest(dur(q.base)) : createNote([{ step: 'B', octave: 4 }], dur(q.base))],
    [q],
  )

  const choose = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (!q.isRest) void playChord([{ step: 'B', octave: 4 }], 0.6)
  }

  const advance = () => {
    if (selected === null) return
    const isCorrect = selected === q.correctIndex
    const error = isCorrect
      ? undefined
      : {
          context: q.isRest ? t('exercises.valori.rest') : t('exercises.valori.note'),
          given: durationName(q.optionBases[selected], lang),
          expected: durationName(q.base, lang),
        }
    setSelected(null)
    session.commit(isCorrect, error)
  }

  if (session.phase === 'done') {
    return (
      <div className="space-y-6">
        <ExerciseHeader title={t('exercises.valori.title')} />
        <SessionSummary
          correct={session.correct}
          total={session.answered}
          bestStreak={session.bestStreak}
          errors={session.errors}
          onRestart={() => {
            setSelected(null)
            session.restart()
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ExerciseHeader title={t('exercises.valori.title')} subtitle={t('exercises.valori.desc')} />
      <ScoreBar answered={session.answered} total={session.total} correct={session.correct} streak={session.streak} />

      <p className="font-medium">{q.isRest ? t('exercises.valori.askRest') : t('exercises.valori.askNote')}</p>
      <Staff clef="treble" elements={elements} height={150} />

      <ChoiceButtons options={options} selected={selected} correctIndex={q.correctIndex} onSelect={choose} />

      {selected !== null && (
        <div className="flex justify-end">
          <Button onClick={advance}>{t('exercises.continue')}</Button>
        </div>
      )}
    </div>
  )
}
