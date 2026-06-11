import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { buttonClasses } from '../ui/styles'
import type { ExerciseError } from './useExercise'

export function ExerciseHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t } = useTranslation()
  return (
    <header className="space-y-2">
      <Link to="/pratica" className="text-sm text-muted transition-colors hover:text-ink">
        ← {t('pratica.back')}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-muted">{subtitle}</p>}
    </header>
  )
}

interface ScoreBarProps {
  answered: number
  total: number
  correct: number
  streak: number
  /** Secondi rimanenti (modalità a tempo). */
  timeLeft?: number
}

export function ScoreBar({ answered, total, correct, streak, timeLeft }: ScoreBarProps) {
  const { t } = useTranslation()
  const pct = total > 0 ? Math.min(100, (answered / total) * 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span className="text-muted">
          {timeLeft === undefined
            ? t('pratica.progress', { done: answered, total })
            : t('pratica.answered', { n: answered })}
        </span>
        <span>
          <span className="font-semibold text-success tabular-nums">{correct}</span>{' '}
          <span className="text-muted">{t('pratica.correctCount')}</span>
        </span>
        <span>
          <span className="font-semibold tabular-nums">🔥 {streak}</span>{' '}
          <span className="text-muted">{t('pratica.streak')}</span>
        </span>
        {timeLeft !== undefined && (
          <span className="ml-auto font-semibold tabular-nums" aria-live="polite">
            ⏱ {timeLeft}s
          </span>
        )}
      </div>
      {timeLeft === undefined && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}

interface SessionSummaryProps {
  correct: number
  total: number
  bestStreak: number
  errors: ExerciseError[]
  onRestart: () => void
}

export function SessionSummary({ correct, total, bestStreak, errors, onRestart }: SessionSummaryProps) {
  const { t } = useTranslation()
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="text-5xl font-bold tabular-nums">{accuracy}%</p>
        <p className="mt-2 text-muted">{t('pratica.summaryScore', { correct, total })}</p>
        <p className="mt-1 text-sm text-muted">
          {t('pratica.summaryStreak', { streak: bestStreak })}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={onRestart}>{t('pratica.again')}</Button>
          <Link to="/pratica" className={buttonClasses('secondary')}>
            {t('pratica.back')}
          </Link>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t('pratica.review')}
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {errors.map((e, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-muted">{e.context}</span>
                <span>
                  <span className="text-danger line-through">{e.given}</span>
                  <span className="mx-2 text-muted">→</span>
                  <span className="font-medium text-success">{e.expected}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
