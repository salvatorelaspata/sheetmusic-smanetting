import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NavBar } from './components/layout/NavBar'
import { ToastViewport } from './components/ui/Toast'
import { useSettings } from './state/settingsStore'

function PageLoader() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )
}

/**
 * Layout radice: barra di navigazione + contenuto della rotta (lazy) + toast.
 * Sincronizza lingua, tema e volume con i18n, il DOM e l'audio. L'audio è
 * importato in modo dinamico per non includere Tone.js nel chunk iniziale.
 */
export default function App() {
  const { i18n } = useTranslation()
  const language = useSettings((s) => s.language)
  const theme = useSettings((s) => s.theme)
  const volume = useSettings((s) => s.volume)

  useEffect(() => {
    if (i18n.language !== language) void i18n.changeLanguage(language)
    document.documentElement.lang = language
  }, [language, i18n])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    let active = true
    void import('./audio/audio').then((m) => {
      if (active) m.setMasterVolume(volume)
    })
    return () => {
      active = false
    }
  }, [volume])

  return (
    <div className="flex min-h-dvh flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl flex-1 overflow-x-clip px-4 py-8 sm:py-10">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <ToastViewport />
    </div>
  )
}
