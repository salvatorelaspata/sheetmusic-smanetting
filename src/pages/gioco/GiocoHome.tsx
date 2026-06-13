import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { buttonClasses } from '../../components/ui/styles'
import { GAMES } from '../../data/giochi'
import { useGames } from '../../state/gamesStore'

export default function GiocoHome() {
  const { t } = useTranslation()
  const bestScoreForGame = useGames((s) => s.bestScoreForGame)

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('gioco.title')}</h1>
        <p className="text-muted">{t('gioco.subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((g) => {
          const record = bestScoreForGame(g.id)
          return (
            <Card key={g.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <span aria-hidden="true" className="text-2xl">
                    {g.icon}
                  </span>
                  {t(`gioco.${g.i18nKey}.title`)}
                </h2>
                {record > 0 && <Badge tone="brand">{t('gioco.recordShort', { n: record })}</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted">{t(`gioco.${g.i18nKey}.desc`)}</p>
              <div className="mt-4">
                <Link to={g.path} className={buttonClasses('primary', 'sm')}>
                  {t('gioco.play')}
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
