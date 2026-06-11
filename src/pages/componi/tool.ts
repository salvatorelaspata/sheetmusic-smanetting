import type { Accidental, DurationBase } from '../../core/model'

/** Stato dello strumento attivo nella palette dell'editor. */
export interface Tool {
  mode: 'note' | 'rest' | 'erase'
  duration: DurationBase
  dotted: boolean
  accidental: Accidental | null
}

export const DEFAULT_TOOL: Tool = {
  mode: 'note',
  duration: 'quarter',
  dotted: false,
  accidental: null,
}
