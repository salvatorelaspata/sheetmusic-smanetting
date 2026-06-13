import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { buttonClasses } from '../components/ui/styles'
import { ALL_LESSONS, lessonTitle } from '../data/moduli'
import { useProgress } from '../state/progressStore'
import { useStats } from '../state/statsStore'
import { useGames } from '../state/gamesStore'
import { useCompositions } from '../state/compositionsStore'

export default function Home() {
  const { t, i18n } = useTranslation()

  const lessons = useProgress((s) => s.lessons)
  const completedCount = Object.values(lessons).filter((l) => l.completed).length
  const totalLessons = ALL_LESSONS.length
  const nextLesson = ALL_LESSONS.find((l) => !lessons[l.id]?.completed)

  const exercises = useStats((s) => s.exercises)
  const attempts = Object.values(exercises).reduce((sum, e) => sum + e.attempts, 0)
  const correct = Object.values(exercises).reduce((sum, e) => sum + e.correct, 0)
  const accuracy = attempts === 0 ? 0 : correct / attempts
  const bestStreak = Object.values(exercises).reduce((max, e) => Math.max(max, e.bestStreak), 0)

  const gameRecord = useGames((s) => s.bestScoreForGame('riconosci-nota'))

  const items = useCompositions((s) => s.items)
  const recent = [...items].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4)

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('home.title')}</h1>
        <p className="text-lg text-muted">{t('home.subtitle')}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title={t('home.progressTitle')}>
          <div className="space-y-4">
            <ProgressBar value={totalLessons ? completedCount / totalLessons : 0} />
            <p className="text-sm text-muted">
              {t('home.lessonsProgress', { done: completedCount, total: totalLessons })}
            </p>
            {nextLesson ? (
              <p className="truncate text-sm">
                {t('home.next', { title: lessonTitle(nextLesson, i18n.language) })}
              </p>
            ) : (
              <p className="text-sm font-medium text-success">{t('home.allDone')}</p>
            )}
            <Link to="/teoria" className={buttonClasses('primary')}>
              {completedCount > 0 ? t('home.continue') : t('home.start')}
            </Link>
          </div>
        </Card>

        <Card title={t('home.statsTitle')}>
          {attempts === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted">{t('home.statsEmpty')}</p>
              <Link to="/pratica" className={buttonClasses('primary')}>
                {t('home.ctaPractice')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold tabular-nums">
                  {Math.round(accuracy * 100)}%
                </span>
                <span className="pb-1 text-sm text-muted">{t('home.accuracy')}</span>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-lg font-semibold tabular-nums">{bestStreak}</div>
                  <div className="text-muted">{t('home.bestStreak')}</div>
                </div>
                <div>
                  <div className="text-lg font-semibold tabular-nums">{attempts}</div>
                  <div className="text-muted">{t('home.attempts')}</div>
                </div>
              </div>
              <Link to="/pratica" className={buttonClasses('primary')}>
                {t('home.ctaPractice')}
              </Link>
            </div>
          )}
        </Card>
      </div>

      <Card
        title={t('gioco.title')}
        action={
          <Link to="/gioco" className={buttonClasses('secondary', 'sm')}>
            {t('gioco.play')}
          </Link>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">{t('gioco.subtitle')}</p>
          {gameRecord > 0 && (
            <span className="text-sm font-medium tabular-nums">
              {t('gioco.recordLine', { n: gameRecord })}
            </span>
          )}
        </div>
      </Card>

      <Card
        title={t('home.compositionsTitle')}
        action={
          <Link to="/componi" className={buttonClasses('secondary', 'sm')}>
            {t('home.newComposition')}
          </Link>
        }
      >
        {recent.length === 0 ? (
          <p className="text-sm text-muted">{t('home.compositionsEmpty')}</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="text-xs text-muted">
                    {fmtDate(c.updatedAt)} · {c.measures.length}{' '}
                    {c.measures.length === 1 ? 'battuta' : 'battute'}
                  </p>
                </div>
                <Link to={`/componi?id=${c.id}`} className={buttonClasses('ghost', 'sm')}>
                  {t('home.openComposition')}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
