import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { buttonClasses } from '../../components/ui/styles'
import {
  ALL_LESSONS,
  isLessonUnlocked,
  moduleSummary,
  moduleTitle,
  MODULES,
} from '../../data/moduli'
import { useProgress } from '../../state/progressStore'

export default function TeoriaHome() {
  const { t, i18n } = useTranslation()
  const lessons = useProgress((s) => s.lessons)

  const completedIds = new Set(
    Object.entries(lessons)
      .filter(([, v]) => v.completed)
      .map(([k]) => k),
  )
  const completedCount = completedIds.size
  const total = ALL_LESSONS.length

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{t('teoria.title')}</h1>
        <p className="text-muted">{t('teoria.subtitle')}</p>
        <div className="max-w-md">
          <ProgressBar value={total ? completedCount / total : 0} />
          <p className="mt-1.5 text-sm text-muted">
            {t('teoria.progress', { done: completedCount, total })}
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => {
          const lesson = m.lessons[0]
          const completed = completedIds.has(lesson.id)
          const unlocked = isLessonUnlocked(lesson.id, completedIds)
          const best = lessons[lesson.id]?.bestScorePct

          return (
            <Card key={m.id} className={unlocked ? '' : 'opacity-70'}>
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {t('teoria.module')} {m.index}
                </span>
                {completed ? (
                  <Badge tone="success">{t('teoria.completed')}</Badge>
                ) : !unlocked ? (
                  <Badge tone="muted">{t('teoria.locked')}</Badge>
                ) : null}
              </div>

              <h2 className="mt-1 text-lg font-semibold">{moduleTitle(m, i18n.language)}</h2>
              <p className="mt-1 text-sm text-muted">{moduleSummary(m, i18n.language)}</p>

              <div className="mt-4 flex items-center gap-3">
                {unlocked ? (
                  <Link
                    to={`/teoria/${lesson.id}`}
                    className={buttonClasses(completed ? 'secondary' : 'primary', 'sm')}
                  >
                    {completed ? t('teoria.review') : t('teoria.start')}
                  </Link>
                ) : (
                  <span className="text-sm text-muted">{t('teoria.lockedHint')}</span>
                )}
                {completed && best !== undefined && (
                  <span className="text-xs text-muted">
                    {t('teoria.bestScore', { pct: Math.round(best * 100) })}
                  </span>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
