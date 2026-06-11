import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { buttonClasses } from '../../components/ui/styles'
import { EXERCISES } from '../../data/esercizi'
import { useStats } from '../../state/statsStore'

export default function PraticaHome() {
  const { t } = useTranslation()
  const exercises = useStats((s) => s.exercises)

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('pratica.title')}</h1>
        <p className="text-muted">{t('pratica.subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {EXERCISES.map((ex) => {
          const s = exercises[ex.id]
          const accuracy = s && s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : null
          return (
            <Card key={ex.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{ex.title}</h2>
                {accuracy !== null && <Badge tone="brand">{accuracy}%</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted">{ex.description}</p>
              <div className="mt-4 flex items-center gap-3">
                <Link to={ex.path} className={buttonClasses('primary', 'sm')}>
                  {t('pratica.startExercise')}
                </Link>
                {s && s.sessions > 0 && (
                  <span className="text-xs text-muted">
                    {t('pratica.bestStreakShort', { n: s.bestStreak })}
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
