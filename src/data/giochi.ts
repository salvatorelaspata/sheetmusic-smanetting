import type { DisplayClef, DurationBase, Pitch, Step } from '../core/model'

/**
 * Catalogo della sezione "Gioco" e configurazione dei singoli giochi.
 * I titoli/descrizioni usano le chiavi i18n `gioco.<i18nKey>.*` (bilingui).
 */

export interface GameMeta {
  id: string
  /** Chiave i18n breve: gioco.<i18nKey>.title / .desc */
  i18nKey: string
  path: string
  /** Emoji mostrata nella hub (coerente con lo stile dell'app). */
  icon: string
}

export const GAMES: GameMeta[] = [
  { id: 'riconosci-nota', i18nKey: 'riconosciNota', path: '/gioco/riconosci-nota', icon: '🎵' },
]

export function gameById(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id)
}

// ---- Gioco "Riconosci la nota" --------------------------------------------

export type Difficulty = 'facile' | 'medio' | 'difficile'

export interface RiconosciGameLevel {
  id: Difficulty
  /** Chiavi tra cui scegliere a caso a ogni domanda. */
  clefs: DisplayClef[]
  /** Se true, oltre al nome va riconosciuta anche la durata della nota. */
  askDuration: boolean
}

/** Difficoltà crescente: più chiavi e, alla fine, anche la durata. */
export const RICONOSCI_GAME_LEVELS: RiconosciGameLevel[] = [
  { id: 'facile', clefs: ['treble'], askDuration: false },
  { id: 'medio', clefs: ['treble', 'bass'], askDuration: false },
  { id: 'difficile', clefs: ['treble', 'bass', 'alto', 'tenor'], askDuration: true },
]

const at = (step: Step, octave: number): Pitch => ({ step, octave })

/**
 * Note "comode" per ciascuna chiave: solo righe e spazi del rigo (niente tagli
 * addizionali), così il gioco resta sulla lettura della chiave e della durata.
 */
export const CLEF_POOLS: Record<DisplayClef, Pitch[]> = {
  // righe Mi-Sol-Si-Re-Fa, spazi Fa-La-Do-Mi
  treble: [at('E', 4), at('F', 4), at('G', 4), at('A', 4), at('B', 4), at('C', 5), at('D', 5), at('E', 5), at('F', 5)],
  // righe Sol-Si-Re-Fa-La, spazi La-Do-Mi-Sol
  bass: [at('G', 2), at('A', 2), at('B', 2), at('C', 3), at('D', 3), at('E', 3), at('F', 3), at('G', 3), at('A', 3)],
  // chiave di contralto: righe Fa-La-Do-Mi-Sol, spazi Sol-Si-Re-Fa
  alto: [at('F', 3), at('G', 3), at('A', 3), at('B', 3), at('C', 4), at('D', 4), at('E', 4), at('F', 4), at('G', 4)],
  // chiave di tenore: righe Re-Fa-La-Do-Mi, spazi Mi-Sol-Si-Re
  tenor: [at('D', 3), at('E', 3), at('F', 3), at('G', 3), at('A', 3), at('B', 3), at('C', 4), at('D', 4), at('E', 4)],
}

/** Durate proposte nel livello difficile (dalla più lunga alla più breve). */
export const GAME_DURATIONS: DurationBase[] = ['whole', 'half', 'quarter', 'eighth', '16th']

/** Numero di vite a inizio partita. */
export const GAME_LIVES = 3

/** Nome bilingue della chiave (per il feedback). */
export const CLEF_LABEL: Record<DisplayClef, { it: string; en: string }> = {
  treble: { it: 'violino', en: 'treble' },
  bass: { it: 'basso', en: 'bass' },
  alto: { it: 'contralto', en: 'alto' },
  tenor: { it: 'tenore', en: 'tenor' },
}
