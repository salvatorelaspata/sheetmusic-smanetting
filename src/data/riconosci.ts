import type { ClefType, Pitch, Step } from '../core/model'

/** Livelli dell'esercizio "Riconosci la nota". */
export interface RiconosciLevel {
  id: string
  label: string
  clef: ClefType
  pool: Pitch[]
}

const at = (step: Step, octave: number): Pitch => ({ step, octave })

export const RICONOSCI_LEVELS: RiconosciLevel[] = [
  {
    id: 'violino',
    label: 'Chiave di violino',
    clef: 'treble',
    pool: [at('E', 4), at('F', 4), at('G', 4), at('A', 4), at('B', 4), at('C', 5), at('D', 5), at('E', 5), at('F', 5)],
  },
  {
    id: 'basso',
    label: 'Chiave di basso',
    clef: 'bass',
    pool: [at('G', 2), at('A', 2), at('B', 2), at('C', 3), at('D', 3), at('E', 3), at('F', 3), at('G', 3), at('A', 3)],
  },
  {
    id: 'tagli',
    label: 'Tagli addizionali',
    clef: 'treble',
    pool: [at('C', 4), at('D', 4), at('G', 5), at('A', 5), at('B', 5), at('C', 6)],
  },
  {
    id: 'alterazioni',
    label: 'Con alterazioni',
    clef: 'treble',
    pool: [
      { step: 'F', octave: 4, accidental: 'sharp' },
      { step: 'G', octave: 4, accidental: 'sharp' },
      { step: 'A', octave: 4, accidental: 'flat' },
      { step: 'B', octave: 4, accidental: 'flat' },
      { step: 'C', octave: 5, accidental: 'sharp' },
      { step: 'E', octave: 5, accidental: 'flat' },
      { step: 'F', octave: 5, accidental: 'sharp' },
    ],
  },
]

/** Nomi italiani delle 12 classi d'altezza (per le etichette di feedback). */
export const PITCH_CLASS_NAMES_IT: string[] = [
  'Do',
  'Do♯',
  'Re',
  'Re♯',
  'Mi',
  'Fa',
  'Fa♯',
  'Sol',
  'Sol♯',
  'La',
  'La♯',
  'Si',
]
