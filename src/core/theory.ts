import type { Pitch, Step } from './model'
import { diatonicValue, midiOf, STEPS, stepIndex } from './pitch'

/** Ordine dei diesis e dei bemolle nell'armatura. */
const SHARP_ORDER: Step[] = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
const FLAT_ORDER: Step[] = ['B', 'E', 'A', 'D', 'G', 'C', 'F']

export interface KeyAccidental {
  step: Step
  type: 'sharp' | 'flat'
}

/** Alterazioni in armatura per un dato numero di quinte (-7..+7). */
export function keySignatureAccidentals(fifths: number): KeyAccidental[] {
  if (fifths > 0) return SHARP_ORDER.slice(0, fifths).map((step) => ({ step, type: 'sharp' }))
  if (fifths < 0) return FLAT_ORDER.slice(0, -fifths).map((step) => ({ step, type: 'flat' }))
  return []
}

/** Lettera della tonica maggiore per numero di quinte. */
const TONIC_STEP: Record<number, Step> = {
  '-7': 'C',
  '-6': 'G',
  '-5': 'D',
  '-4': 'A',
  '-3': 'E',
  '-2': 'B',
  '-1': 'F',
  '0': 'C',
  '1': 'G',
  '2': 'D',
  '3': 'A',
  '4': 'E',
  '5': 'B',
  '6': 'F',
  '7': 'C',
}

const MAJOR_NAME_IT: Record<number, string> = {
  '-7': 'Do♭',
  '-6': 'Sol♭',
  '-5': 'Re♭',
  '-4': 'La♭',
  '-3': 'Mi♭',
  '-2': 'Si♭',
  '-1': 'Fa',
  '0': 'Do',
  '1': 'Sol',
  '2': 'Re',
  '3': 'La',
  '4': 'Mi',
  '5': 'Si',
  '6': 'Fa♯',
  '7': 'Do♯',
}

const MAJOR_NAME_EN: Record<number, string> = {
  '-7': 'C♭',
  '-6': 'G♭',
  '-5': 'D♭',
  '-4': 'A♭',
  '-3': 'E♭',
  '-2': 'B♭',
  '-1': 'F',
  '0': 'C',
  '1': 'G',
  '2': 'D',
  '3': 'A',
  '4': 'E',
  '5': 'B',
  '6': 'F♯',
  '7': 'C♯',
}

/** Nome VexFlow dell'armatura (per Stave.addKeySignature). */
const VEX_KEY_NAME: Record<number, string> = {
  '-7': 'Cb',
  '-6': 'Gb',
  '-5': 'Db',
  '-4': 'Ab',
  '-3': 'Eb',
  '-2': 'Bb',
  '-1': 'F',
  '0': 'C',
  '1': 'G',
  '2': 'D',
  '3': 'A',
  '4': 'E',
  '5': 'B',
  '6': 'F#',
  '7': 'C#',
}

/** Nome della tonalità maggiore, es. "Sol maggiore" / "G major". */
export function majorKeyName(fifths: number, lang: 'it' | 'en' = 'it'): string {
  if (lang === 'en') return `${MAJOR_NAME_EN[fifths]} major`
  return `${MAJOR_NAME_IT[fifths]} maggiore`
}

export function vexKeySignatureName(fifths: number): string {
  return VEX_KEY_NAME[fifths]
}

/** Le quinte valide (da 7 bemolli a 7 diesis). */
export const ALL_FIFTHS: number[] = Array.from({ length: 15 }, (_, i) => i - 7)

/**
 * Scala maggiore (8 note, tonica → tonica) a partire dal numero di quinte.
 * Le alterazioni derivano dall'armatura della tonalità.
 */
export function majorScale(fifths: number, startOctave = 4): Pitch[] {
  const tonic = TONIC_STEP[fifths]
  const accMap = new Map(keySignatureAccidentals(fifths).map((a) => [a.step, a.type]))
  const start = stepIndex(tonic)
  const result: Pitch[] = []
  for (let i = 0; i <= 7; i++) {
    const abs = start + i
    const step = STEPS[abs % 7]
    const octave = startOctave + Math.floor(abs / 7)
    const acc = accMap.get(step)
    result.push({
      step,
      octave,
      accidental: acc === 'sharp' ? 'sharp' : acc === 'flat' ? 'flat' : undefined,
    })
  }
  return result
}

const INTERVAL_IT: Record<string, string> = {
  '1:0': 'Unisono',
  '2:1': 'Seconda minore',
  '2:2': 'Seconda maggiore',
  '3:3': 'Terza minore',
  '3:4': 'Terza maggiore',
  '4:5': 'Quarta giusta',
  '4:6': 'Quarta aumentata (tritono)',
  '5:6': 'Quinta diminuita',
  '5:7': 'Quinta giusta',
  '6:8': 'Sesta minore',
  '6:9': 'Sesta maggiore',
  '7:10': 'Settima minore',
  '7:11': 'Settima maggiore',
  '8:12': 'Ottava giusta',
}

const INTERVAL_EN: Record<string, string> = {
  '1:0': 'Unison',
  '2:1': 'Minor second',
  '2:2': 'Major second',
  '3:3': 'Minor third',
  '3:4': 'Major third',
  '4:5': 'Perfect fourth',
  '4:6': 'Augmented fourth (tritone)',
  '5:6': 'Diminished fifth',
  '5:7': 'Perfect fifth',
  '6:8': 'Minor sixth',
  '6:9': 'Major sixth',
  '7:10': 'Minor seventh',
  '7:11': 'Major seventh',
  '8:12': 'Octave',
}

/** Intervalli con nome IT/EN (per le opzioni bilingui degli esercizi). */
export const SIMPLE_INTERVALS: { it: string; en: string }[] = Object.keys(INTERVAL_IT).map((k) => ({
  it: INTERVAL_IT[k],
  en: INTERVAL_EN[k],
}))

export interface IntervalInfo {
  /** Numero dell'intervallo (1 = unisono, 8 = ottava). */
  number: number
  /** Distanza in semitoni. */
  semitones: number
  nameIt: string
  nameEn: string
}

/** Riconosce l'intervallo (semplice, entro l'ottava) tra due note. */
export function interval(a: Pitch, b: Pitch): IntervalInfo {
  const diatonic = Math.abs(diatonicValue(b) - diatonicValue(a))
  const semitones = Math.abs(midiOf(b) - midiOf(a))
  const number = diatonic === 7 ? 8 : (diatonic % 7) + 1
  const simpleSemitones = semitones === 12 ? 12 : semitones % 12
  const key = `${number}:${simpleSemitones}`
  return {
    number,
    semitones,
    nameIt: INTERVAL_IT[key] ?? `Intervallo di ${number}`,
    nameEn: INTERVAL_EN[key] ?? `Interval of ${number}`,
  }
}
