import type { Accidental, Pitch, Step } from './model'

export const STEPS: Step[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

/** Nomi italiani delle note. */
export const STEP_NAMES_IT: Record<Step, string> = {
  C: 'Do',
  D: 'Re',
  E: 'Mi',
  F: 'Fa',
  G: 'Sol',
  A: 'La',
  B: 'Si',
}

/** Ordine dei nomi italiani (per UI a pulsanti). */
export const ITALIAN_NOTE_NAMES: string[] = STEPS.map((s) => STEP_NAMES_IT[s])

const SEMITONE: Record<Step, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

const ACC_OFFSET: Record<Accidental, number> = {
  natural: 0,
  sharp: 1,
  flat: -1,
  'double-sharp': 2,
  'double-flat': -2,
}

const ACC_SYMBOL_ASCII: Record<Accidental, string> = {
  natural: 'n',
  sharp: '#',
  flat: 'b',
  'double-sharp': '##',
  'double-flat': 'bb',
}

const ACC_SYMBOL_UNICODE: Record<Accidental, string> = {
  natural: '♮',
  sharp: '♯',
  flat: '♭',
  'double-sharp': '𝄪',
  'double-flat': '𝄫',
}

export function stepIndex(step: Step): number {
  return STEPS.indexOf(step)
}

/** Numero MIDI (Do centrale C4 = 60). */
export function midiOf(p: Pitch): number {
  const acc = p.accidental ? ACC_OFFSET[p.accidental] : 0
  return (p.octave + 1) * 12 + SEMITONE[p.step] + acc
}

/** Frequenza in Hz (La4 = 440). Usata dall'audio per evitare ambiguità di parsing. */
export function frequencyOf(p: Pitch): number {
  return 440 * Math.pow(2, (midiOf(p) - 69) / 12)
}

/** Classe d'altezza (0..11), indipendente dall'ottava. Do=0, Do♯/Re♭=1, … */
export function pitchClass(p: Pitch): number {
  return ((midiOf(p) % 12) + 12) % 12
}

/** Classe d'altezza della nota naturale corrispondente al nome (Do=0, Re=2, …). */
export function stepPitchClass(step: Step): number {
  return SEMITONE[step]
}

/**
 * Valore diatonico monotòno con l'altezza ignorando le alterazioni:
 * usato per la posizione verticale sul pentagramma.
 */
export function diatonicValue(p: Pitch): number {
  return p.octave * 7 + stepIndex(p.step)
}

/** Inverso di diatonicValue: ricostruisce l'altezza (con eventuale alterazione). */
export function pitchFromDiatonic(dv: number, accidental?: Accidental): Pitch {
  const clamped = Math.max(0, Math.min(74, Math.round(dv)))
  const pitch: Pitch = { step: STEPS[clamped % 7], octave: Math.floor(clamped / 7) }
  return accidental ? { ...pitch, accidental } : pitch
}

/** Nome visualizzato della nota (italiano, con eventuale equivalente inglese). */
export function noteName(
  p: Pitch,
  opts?: { showEnglish?: boolean; withOctave?: boolean },
): string {
  const accU = p.accidental ? ACC_SYMBOL_UNICODE[p.accidental] : ''
  let label = STEP_NAMES_IT[p.step] + accU
  if (opts?.showEnglish) {
    const accA = p.accidental && p.accidental !== 'natural' ? ACC_SYMBOL_ASCII[p.accidental] : ''
    label += ` (${p.step}${accA})`
  }
  if (opts?.withOctave) label += ` ${p.octave}`
  return label
}

/** Step a partire dal nome italiano (es. "Sol" → "G"). */
export function stepFromItalian(name: string): Step | undefined {
  const entry = STEPS.find((s) => STEP_NAMES_IT[s].toLowerCase() === name.trim().toLowerCase())
  return entry
}

/**
 * Chiave per VexFlow, es. "c/4". La lettera determina la riga; l'alterazione è
 * gestita separatamente come modifier (vexAccidentalCode), così l'armatura può
 * sopprimere i diesis/bemolli ridondanti senza spostare la nota.
 */
export function vexKey(p: Pitch): string {
  return `${p.step.toLowerCase()}/${p.octave}`
}

/** Codice dell'alterazione da disegnare come modifier VexFlow, o undefined se nessuna. */
export function vexAccidentalCode(p: Pitch): string | undefined {
  if (!p.accidental) return undefined
  return ACC_SYMBOL_ASCII[p.accidental]
}
