import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Staff } from '../../components/music/Staff'
import { NoteNameButtons } from '../../components/music/NoteNameButtons'
import { Button } from '../../components/ui/Button'
import { ExerciseHeader, ScoreBar, SessionSummary } from '../../components/exercises/ExerciseShell'
import { useExercise } from '../../components/exercises/useExercise'
import { createNote, dur } from '../../core/score'
import { STEP_NAMES_IT } from '../../core/pitch'
import { randomItem, randomInt } from '../../core/random'
import { playSequence } from '../../audio/audio'
import type { Pitch, Step } from '../../core/model'

const POOL: Step[] = ['C', 'D', 'E', 'F', 'G', 'A']

function makeQuestion(): { target: Pitch[] } {
  const length = randomInt(3, 4)
  const target: Pitch[] = []
  for (let i = 0; i < length; i++) target.push({ step: randomItem(POOL), octave: 4 })
  return { target }
}

export default function Dettato() {
  const { t } = useTranslation()
  const session = useExercise<{ target: Pitch[] }>({ exerciseId: 'dettato', total: 5, generate: makeQuestion })

  const [userSteps, setUserSteps] = useState<Step[]>([])
  const [checked, setChecked] = useState<boolean | null>(null)

  const target = session.question.target

  const userElements = useMemo(
    () => userSteps.map((s) => createNote([{ step: s, octave: 4 }], dur('quarter'))),
    [userSteps],
  )

  const listen = () => {
    void playSequence(
      target.map((p) => createNote([p], dur('quarter'))),
      { bpm: 100 },
    )
  }

  const press = (step: Step) => {
    if (checked !== null) return
    if (userSteps.length >= target.length) return
    setUserSteps((s) => [...s, step])
  }

  const undo = () => {
    if (checked !== null) return
    setUserSteps((s) => s.slice(0, -1))
  }

  const confirm = () => {
    const isCorrect = userSteps.every((s, i) => s === target[i].step) && userSteps.length === target.length
    setChecked(isCorrect)
  }

  const advance = () => {
    const isCorrect = checked === true
    const error = isCorrect
      ? undefined
      : {
          context: t('exercises.dettato.title'),
          given: userSteps.map((s) => STEP_NAMES_IT[s]).join(' ') || '—',
          expected: target.map((p) => STEP_NAMES_IT[p.step]).join(' '),
        }
    setUserSteps([])
    setChecked(null)
    session.commit(isCorrect, error)
  }

  if (session.phase === 'done') {
    return (
      <div className="space-y-6">
        <ExerciseHeader title={t('exercises.dettato.title')} />
        <SessionSummary
          correct={session.correct}
          total={session.answered}
          bestStreak={session.bestStreak}
          errors={session.errors}
          onRestart={() => {
            setUserSteps([])
            setChecked(null)
            session.restart()
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ExerciseHeader title={t('exercises.dettato.title')} subtitle={t('exercises.dettato.desc')} />
      <ScoreBar answered={session.answered} total={session.total} correct={session.correct} streak={session.streak} />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={listen}>
          🔊 {t('exercises.dettato.listen')}
        </Button>
        <span className="text-sm text-muted">
          {t('exercises.dettato.count', { n: userSteps.length, total: target.length })}
        </span>
      </div>

      <Staff
        clef="treble"
        elements={
          checked === false ? target.map((p) => createNote([p], dur('quarter'))) : userElements
        }
        height={150}
      />

      {checked !== null ? (
        <div className="space-y-3">
          <p className={`text-center font-medium ${checked ? 'text-success' : 'text-danger'}`}>
            {checked
              ? t('exercises.correct')
              : t('exercises.dettato.wrong', {
                  seq: target.map((p) => STEP_NAMES_IT[p.step]).join(' '),
                })}
          </p>
          <div className="flex justify-center">
            <Button onClick={advance}>{t('exercises.continue')}</Button>
          </div>
        </div>
      ) : (
        <>
          <NoteNameButtons onPress={press} disabled={userSteps.length >= target.length} />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={undo}
              disabled={userSteps.length === 0}
              className="text-sm text-muted underline-offset-2 hover:text-ink hover:underline disabled:opacity-40"
            >
              ← {t('exercises.dettato.undo')}
            </button>
            <Button onClick={confirm} disabled={userSteps.length !== target.length}>
              {t('exercises.dettato.confirm')}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
