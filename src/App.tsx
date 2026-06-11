import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NavBar } from './components/layout/NavBar'
import { ToastViewport } from './components/ui/Toast'
import { useSettings } from './state/settingsStore'
import { setMasterVolume } from './audio/audio'

/**
 * Layout radice: barra di navigazione + contenuto della rotta + toast.
 * Qui sincronizziamo lingua, tema e volume (dallo store) con i18n, il DOM e l'audio.
 */
export default function App() {
  const { i18n } = useTranslation()
  const language = useSettings((s) => s.language)
  const theme = useSettings((s) => s.theme)
  const volume = useSettings((s) => s.volume)

  useEffect(() => {
    if (i18n.language !== language) void i18n.changeLanguage(language)
  }, [language, i18n])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    setMasterVolume(volume)
  }, [volume])

  return (
    <div className="flex min-h-dvh flex-col">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
        <Outlet />
      </main>
      <ToastViewport />
    </div>
  )
}
