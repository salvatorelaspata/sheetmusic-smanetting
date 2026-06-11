import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings, type Language, type Theme } from '../state/settingsStore'

function Row({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="sm:max-w-md">
        <p className="font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

const selectClass =
  'rounded-md border border-border bg-surface px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-brand'

export default function Impostazioni() {
  const { t } = useTranslation()
  const {
    language,
    theme,
    showEnglishNotation,
    volume,
    setLanguage,
    setTheme,
    setShowEnglishNotation,
    setVolume,
  } = useSettings()

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted">{t('settings.subtitle')}</p>
      </header>

      <div className="rounded-xl border border-border bg-surface px-5">
        <Row label={t('settings.language')}>
          <select
            className={selectClass}
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            aria-label={t('settings.language')}
          >
            <option value="it">{t('settings.italian')}</option>
            <option value="en">{t('settings.english')}</option>
          </select>
        </Row>

        <Row label={t('settings.theme')}>
          <select
            className={selectClass}
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            aria-label={t('settings.theme')}
          >
            <option value="light">{t('settings.light')}</option>
            <option value="dark">{t('settings.dark')}</option>
          </select>
        </Row>

        <Row label={t('settings.englishNotation')} hint={t('settings.englishNotationHint')}>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-border text-brand focus-visible:ring-2 focus-visible:ring-brand"
              checked={showEnglishNotation}
              onChange={(e) => setShowEnglishNotation(e.target.checked)}
            />
          </label>
        </Row>

        <Row label={t('settings.volume')}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label={t('settings.volume')}
              className="w-40 accent-brand"
            />
            <span className="w-10 text-right text-sm tabular-nums text-muted">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </Row>
      </div>
    </section>
  )
}
