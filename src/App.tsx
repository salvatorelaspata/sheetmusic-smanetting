import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NavBar } from './components/layout/NavBar'
import { useSettings } from './state/settingsStore'

/**
 * Layout radice: barra di navigazione + contenuto della rotta.
 * Qui sincronizziamo lingua e tema (dallo store) con i18n e con il DOM.
 */
export default function App() {
  const { i18n } = useTranslation()
  const language = useSettings((s) => s.language)
  const theme = useSettings((s) => s.theme)

  useEffect(() => {
    if (i18n.language !== language) void i18n.changeLanguage(language)
  }, [language, i18n])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="flex min-h-dvh flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
