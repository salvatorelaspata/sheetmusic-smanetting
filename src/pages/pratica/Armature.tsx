import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Staff } from '../../components/music/Staff'
import { Button } from '../../components/ui/Button'
import { ChoiceButtons } from '../../components/exercises/ChoiceButtons'
import { ExerciseHeader, ScoreBar, SessionSummary } from '../../components/exercises/ExerciseShell'
import { useExercise } from '../../components/exercises/useExercise'
import { majorKeyName, majorScale } from '../../core/theory'
import { randomItem, sample, shuffle } from '../../core/random'
import { playChord } from '../../audio/audio'

interface Question {
  fifths: number
  /** Quinte delle opzioni; i nomi sono resi al volo nella lingua dell'interfaccia. */
  optionFifths: number[]
  correctIndex: number
}

const FIFTHS_POOL = [-4, -3, -2, -1, 0, 1, 2, 3, 4]

function makeQuestion(): Question {
  const fifths = randomItem(FIFTHS_POOL)
  const distractors = sample(
    FIFTHS_POOL.filter((f) => f !== fifths),
    3,
  )
  const optionFifths = shuffle([fifths, ...distractors])
  return { fifths, optionFifths, correctIndex: optionFifths.indexOf(fifths) }
}

export default function Armature() {
  const { t, i18n } = useTranslation()
  const session = useExercise<Question>({ exerciseId: 'armature', total: 10, generate: makeQuestion })
  const [selected, setSelected] = useState<number | null>(null)

  const q = session.question
  const lang = i18n.language === 'en' ? 'en' : 'it'
  // I nomi delle tonalità seguono la lingua dell'interfaccia (Do maggiore / C major).
  const options = q.optionFifths.map((f) => majorKeyName(f, lang))

  const choose = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    // Piccola ricompensa sonora: la tonica della tonalità.
    void playChord([majorScale(q.fifths, 4)[0]], 0.7)
  }

  const advance = () => {
    if (selected === null) return
    const isCorrect = selected === q.correctIndex
    const error = isCorrect
      ? undefined
      : {
          context: t('exercises.armature.title'),
          given: majorKeyName(q.optionFifths[selected], lang),
          expected: majorKeyName(q.fifths, lang),
        }
    setSelected(null)
    session.commit(isCorrect, error)
  }

  if (session.phase === 'done') {
    return (
      <div className="space-y-6">
        <ExerciseHeader title={t('exercises.armature.title')} />
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
      <ExerciseHeader title={t('exercises.armature.title')} subtitle={t('exercises.armature.desc')} />
      <ScoreBar answered={session.answered} total={session.total} correct={session.correct} streak={session.streak} />

      <p className="font-medium">{t('exercises.armature.ask')}</p>
      <Staff clef="treble" keySignature={{ fifths: q.fifths }} elements={[]} height={150} />

      <ChoiceButtons options={options} selected={selected} correctIndex={q.correctIndex} onSelect={choose} />

      {selected !== null && (
        <div className="flex justify-end">
          <Button onClick={advance}>{t('exercises.continue')}</Button>
        </div>
      )}
    </div>
  )
}
