import { useTranslation } from 'react-i18next'

interface PagePlaceholderProps {
  title: string
  subtitle?: string
  /** Fase della roadmap in cui la sezione verrà implementata, es. "Fase 3". */
  phase: string
}

/**
 * Segnaposto coerente per le sezioni non ancora implementate (Fase 0).
 * Verrà sostituito dai contenuti reali nelle fasi successive.
 */
export function PagePlaceholder({ title, subtitle, phase }: PagePlaceholderProps) {
  const { t } = useTranslation()
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted">{subtitle}</p>}
      </header>

      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="font-medium">{t('placeholder.underConstruction')}</p>
        <p className="mt-1 text-sm text-muted">{t('placeholder.plannedIn', { phase })}</p>
        <p className="mt-4 text-xs text-muted">{t('placeholder.seeRoadmap')}</p>
      </div>
    </section>
  )
}
