import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { ChoiceButtons } from '../../components/exercises/ChoiceButtons'
import { ExerciseHeader, ScoreBar, SessionSummary } from '../../components/exercises/ExerciseShell'
import { useExercise } from '../../components/exercises/useExercise'
import { pitchFromMidi } from '../../core/pitch'
import { randomInt, shuffle } from '../../core/random'
import { playChord } from '../../audio/audio'
import type { Pitch } from '../../core/model'

type ChordType = 'maggiore' | 'minore' | 'diminuita' | 'aumentata'

const CHORD_OFFSETS: Record<ChordType, [number, number, number]> = {
  maggiore: [0, 4, 7],
  minore: [0, 3, 7],
  diminuita: [0, 3, 6],
  aumentata: [0, 4, 8],
}
const TYPES: ChordType[] = ['maggiore', 'minore', 'diminuita', 'aumentata']

interface Question {
  pitches: Pitch[]
  type: ChordType
  optionTypes: ChordType[]
}

function makeQuestion(): Question {
  const type = TYPES[randomInt(0, 3)]
  const root = randomInt(55, 67) // Sol3 … Sol4
  const pitches = CHORD_OFFSETS[type].map((off) => pitchFromMidi(root + off))
  return { pitches, type, optionTypes: shuffle(TYPES) }
}

export default function Accordi() {
  const { t } = useTranslation()
  const session = useExercise<Question>({ exerciseId: 'accordi', total: 10, generate: makeQuestion })
  const [selected, setSelected] = useState<number | null>(null)

  const q = session.question
  const options = q.optionTypes.map((ty) => t(`exercises.accordi.${ty}`))
  const correctIndex = q.optionTypes.indexOf(q.type)

  const listen = () => void playChord(q.pitches, 1.4)

  const choose = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    void playChord(q.pitches, 1.4)
  }
  const advance = () => {
    if (selected === null) return
    const isCorrect = selected === correctIndex
    const error = isCorrect
      ? undefined
      : { context: t('exercises.accordi.title'), given: options[selected], expected: options[correctIndex] }
    setSelected(null)
    session.commit(isCorrect, error)
  }

  if (session.phase === 'done') {
    return (
      <div className="space-y-6">
        <ExerciseHeader title={t('exercises.accordi.title')} />
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
      <ExerciseHeader title={t('exercises.accordi.title')} subtitle={t('exercises.accordi.desc')} />
      <ScoreBar answered={session.answered} total={session.total} correct={session.correct} streak={session.streak} />

      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-8">
        <span className="text-5xl" aria-hidden="true">
          🎹
        </span>
        <Button variant="secondary" onClick={listen}>
          🔊 {t('exercises.accordi.listen')}
        </Button>
        <p className="font-medium">{t('exercises.accordi.ask')}</p>
      </div>

      <ChoiceButtons options={options} selected={selected} correctIndex={correctIndex} onSelect={choose} />

      {selected !== null && (
        <div className="flex justify-end">
          <Button onClick={advance}>{t('exercises.continue')}</Button>
        </div>
      )}
    </div>
  )
}
