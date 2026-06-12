import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Staff } from '../../components/music/Staff'
import { Button } from '../../components/ui/Button'
import { ChoiceButtons } from '../../components/exercises/ChoiceButtons'
import { ExerciseHeader, ScoreBar, SessionSummary } from '../../components/exercises/ExerciseShell'
import { useExercise } from '../../components/exercises/useExercise'
import { createNote, dur } from '../../core/score'
import { interval, majorScale, SIMPLE_INTERVALS } from '../../core/theory'
import { randomInt, sample, shuffle } from '../../core/random'
import { playSequence } from '../../audio/audio'
import type { Pitch } from '../../core/model'

interface IntervalName {
  it: string
  en: string
}
interface Question {
  a: Pitch
  b: Pitch
  options: IntervalName[]
  correctIndex: number
}

const POOL = majorScale(0, 4) // Do4 … Do5

function makeQuestion(): Question {
  const i = randomInt(0, 6)
  const j = i + randomInt(1, 7 - i)
  const a = POOL[i]
  const b = POOL[j]
  const info = interval(a, b)
  const correct: IntervalName = { it: info.nameIt, en: info.nameEn }
  const distractors = sample(
    SIMPLE_INTERVALS.filter((s) => s.it !== correct.it),
    3,
  )
  const options = shuffle([correct, ...distractors])
  return { a, b, options, correctIndex: options.findIndex((o) => o.it === correct.it) }
}

export default function Intervalli() {
  const { t, i18n } = useTranslation()
  const session = useExercise<Question>({ exerciseId: 'intervalli', total: 10, generate: makeQuestion })
  const [selected, setSelected] = useState<number | null>(null)

  const q = session.question
  const lang: 'it' | 'en' = i18n.language === 'en' ? 'en' : 'it'
  const elements = useMemo(
    () => [createNote([q.a], dur('half')), createNote([q.b], dur('half'))],
    [q],
  )
  const optionLabels = q.options.map((o) => o[lang])

  const listen = () => void playSequence(elements, { bpm: 96 })

  const choose = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    void playSequence(elements, { bpm: 96 })
  }
  const advance = () => {
    if (selected === null) return
    const isCorrect = selected === q.correctIndex
    const error = isCorrect
      ? undefined
      : { context: t('exercises.intervalli.title'), given: optionLabels[selected], expected: optionLabels[q.correctIndex] }
    setSelected(null)
    session.commit(isCorrect, error)
  }

  if (session.phase === 'done') {
    return (
      <div className="space-y-6">
        <ExerciseHeader title={t('exercises.intervalli.title')} />
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
      <ExerciseHeader title={t('exercises.intervalli.title')} subtitle={t('exercises.intervalli.desc')} />
      <ScoreBar answered={session.answered} total={session.total} correct={session.correct} streak={session.streak} />

      <Staff clef="treble" elements={elements} height={150} />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={listen}>
          🔊 {t('exercises.intervalli.listen')}
        </Button>
        <span className="font-medium">{t('exercises.intervalli.ask')}</span>
      </div>

      <ChoiceButtons options={optionLabels} selected={selected} correctIndex={q.correctIndex} onSelect={choose} />

      {selected !== null && (
        <div className="flex justify-end">
          <Button onClick={advance}>{t('exercises.continue')}</Button>
        </div>
      )}
    </div>
  )
}
