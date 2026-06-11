import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function DashboardCard({
  title,
  emptyText,
  cta,
  to,
}: {
  title: string
  emptyText: string
  cta: string
  to: string
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <p className="mt-3 flex-1 text-sm text-muted">{emptyText}</p>
      <Link
        to={to}
        className="mt-4 inline-flex w-fit items-center rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg transition-opacity hover:opacity-90"
      >
        {cta}
      </Link>
    </div>
  )
}

export default function Home() {
  const { t } = useTranslation()
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('home.title')}</h1>
        <p className="text-lg text-muted">{t('home.subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title={t('home.progressTitle')}
          emptyText={t('home.progressEmpty')}
          cta={t('home.ctaTheory')}
          to="/teoria"
        />
        <DashboardCard
          title={t('home.statsTitle')}
          emptyText={t('home.statsEmpty')}
          cta={t('home.ctaPractice')}
          to="/pratica"
        />
        <DashboardCard
          title={t('home.compositionsTitle')}
          emptyText={t('home.compositionsEmpty')}
          cta={t('home.ctaCompose')}
          to="/componi"
        />
      </div>
    </div>
  )
}
