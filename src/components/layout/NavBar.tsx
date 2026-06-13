import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../state/settingsStore'
import { GearIcon, Logo, MenuIcon, MoonIcon, SunIcon } from '../ui/icons'

const LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/teoria', key: 'nav.teoria', end: false },
  { to: '/pratica', key: 'nav.pratica', end: false },
  { to: '/gioco', key: 'nav.gioco', end: false },
  { to: '/componi', key: 'nav.componi', end: false },
] as const

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-brand text-brand-fg' : 'text-muted hover:bg-canvas hover:text-ink',
  ].join(' ')

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand text-brand-fg' : 'text-ink hover:bg-canvas',
  ].join(' ')

const iconButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink'

export function NavBar() {
  const { t } = useTranslation()
  const theme = useSettings((s) => s.theme)
  const toggleTheme = useSettings((s) => s.toggleTheme)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        <button
          type="button"
          className={`${iconButtonClass} sm:hidden`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <NavLink
          to="/"
          end
          onClick={() => setMenuOpen(false)}
          className="mr-1 flex items-center gap-2 font-semibold text-ink"
        >
          <Logo className="h-7 w-7" />
          <span>{t('app.name')}</span>
        </NavLink>

        <div className="hidden items-center gap-0.5 sm:flex">
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
            onClick={() => setMenuOpen(false)}
            className={iconButtonClass}
            aria-label={t('nav.impostazioni')}
            title={t('nav.impostazioni')}
          >
            <GearIcon className="h-5 w-5" />
          </NavLink>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-surface sm:hidden">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-2">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setMenuOpen(false)}
                className={mobileLinkClass}
              >
                {t(l.key)}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
