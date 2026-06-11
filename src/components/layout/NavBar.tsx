import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../state/settingsStore'
import { GearIcon, Logo, MoonIcon, SunIcon } from '../ui/icons'

const LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/teoria', key: 'nav.teoria', end: false },
  { to: '/pratica', key: 'nav.pratica', end: false },
  { to: '/componi', key: 'nav.componi', end: false },
] as const

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-brand text-brand-fg' : 'text-muted hover:bg-canvas hover:text-ink',
  ].join(' ')

const iconButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink'

export function NavBar() {
  const { t } = useTranslation()
  const theme = useSettings((s) => s.theme)
  const toggleTheme = useSettings((s) => s.toggleTheme)

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        <NavLink to="/" className="mr-1 flex items-center gap-2 font-semibold text-ink" end>
          <Logo className="h-7 w-7" />
          <span className="hidden sm:inline">{t('app.name')}</span>
        </NavLink>

        <div className="flex items-center gap-0.5">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {t(l.key)}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className={iconButtonClass}
            aria-label={t('nav.toggleTheme')}
            title={t('nav.toggleTheme')}
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          <NavLink
            to="/impostazioni"
            className={iconButtonClass}
            aria-label={t('nav.impostazioni')}
            title={t('nav.impostazioni')}
          >
            <GearIcon className="h-5 w-5" />
          </NavLink>
        </div>
      </nav>
    </header>
  )
}
