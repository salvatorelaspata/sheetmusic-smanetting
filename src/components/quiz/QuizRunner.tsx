import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { StaffExampleView } from '../music/StaffExampleView'
import { loc, type QuizQuestion } from '../../data/lezioni'

export interface QuizResult {
  correct: number
  total: number
  scorePct: number
}

interface QuizRunnerProps {
  questions: QuizQuestion[]
  onComplete: (result: QuizResult) => void
}

type OptionState = 'idle' | 'correct' | 'wrong' | 'dim'

const OPTION_CLASSES: Record<OptionState, string> = {
  idle: 'border-border bg-surface hover:border-brand hover:bg-canvas',
  correct: 'border-success bg-success/15 text-success',
  wrong: 'border-danger bg-danger/15 text-danger',
  dim: 'border-border bg-surface opacity-50',
}

export function QuizRunner({ questions, onComplete }: QuizRunnerProps) {
  const { t, i18n } = useTranslation()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const question = questions[index]
  const answered = selected !== null
  const isLast = index === questions.length - 1

  const choose = (i: number) => {
    if (answered) return
    setSelected(i)
    if (i === question.correctIndex) setCorrectCount((c) => c + 1)
  }

  const advance = () => {
    if (isLast) {
      onComplete({
        correct: correctCount,
        total: questions.length,
        scorePct: correctCount / questions.length,
      })
      return
    }
    setIndex((x) => x + 1)
    setSelected(null)
  }

  // Scorciatoie da tastiera: 1..N per rispondere, Invio per avanzare.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!answered) {
        const num = Number(e.key)
        if (Number.isInteger(num) && num >= 1 && num <= question.options.length) {
          choose(num - 1)
        }
      } else if (e.key === 'Enter') {
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, index, question])

  const stateFor = (i: number): OptionState => {
    if (!answered) return 'idle'
    if (i === question.correctIndex) return 'correct'
    if (i === selected) return 'wrong'
    return 'dim'
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        {t('teoria.question', { n: index + 1, total: questions.length })}
      </p>
      <h3 className="text-lg font-semibold">{loc(question.prompt, i18n.language)}</h3>

      {question.staff && <StaffExampleView example={question.staff} height={140} />}

      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            onClick={() => choose(i)}
            className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors disabled:cursor-default ${OPTION_CLASSES[stateFor(i)]}`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-canvas text-xs text-muted">
              {i + 1}
            </span>
            {loc(opt, i18n.language)}
          </button>
        ))}
      </div>

      {answered && (
        <div className="space-y-3 rounded-lg border border-border bg-canvas p-4">
          <p
            className={`font-medium ${selected === question.correctIndex ? 'text-success' : 'text-danger'}`}
          >
            {selected === question.correctIndex ? t('teoria.correct') : t('teoria.wrong')}
          </p>
          {question.explanation && (
            <p className="text-sm text-muted">{loc(question.explanation, i18n.language)}</p>
          )}
          <Button onClick={advance}>{isLast ? t('teoria.seeResult') : t('teoria.next')}</Button>
        </div>
      )}
    </div>
  )
}
