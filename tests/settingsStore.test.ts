import { beforeEach, describe, expect, it } from 'vitest'
import { useSettings } from '../src/state/settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    useSettings.setState({
      language: 'it',
      theme: 'light',
      showEnglishNotation: false,
      volume: 0.8,
    })
  })

  it('cambia lingua', () => {
    useSettings.getState().setLanguage('en')
    expect(useSettings.getState().language).toBe('en')
  })

  it('alterna il tema', () => {
    useSettings.getState().toggleTheme()
    expect(useSettings.getState().theme).toBe('dark')
    useSettings.getState().toggleTheme()
    expect(useSettings.getState().theme).toBe('light')
  })

  it('limita il volume tra 0 e 1', () => {
    useSettings.getState().setVolume(2)
    expect(useSettings.getState().volume).toBe(1)
    useSettings.getState().setVolume(-1)
    expect(useSettings.getState().volume).toBe(0)
  })
})
