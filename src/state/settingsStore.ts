import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'it' | 'en'
export type Theme = 'light' | 'dark'

export interface SettingsState {
  /** Lingua dell'interfaccia (it predefinita). */
  language: Language
  /** Tema chiaro/scuro. */
  theme: Theme
  /** Mostra anche la notazione anglosassone accanto a quella italiana. */
  showEnglishNotation: boolean
  /** Volume globale dell'audio, 0..1. */
  volume: number

  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setShowEnglishNotation: (value: boolean) => void
  setVolume: (value: number) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'it',
      theme: 'light',
      showEnglishNotation: false,
      volume: 0.8,

      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setShowEnglishNotation: (showEnglishNotation) => set({ showEnglishNotation }),
      setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
    }),
    {
      name: 'smanetting:settings',
      version: 1,
    },
  ),
)
