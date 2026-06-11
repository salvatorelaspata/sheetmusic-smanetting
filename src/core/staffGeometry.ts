import type { ClefType, Pitch } from './model'
import { diatonicValue, STEPS } from './pitch'

/** Geometria del rigo: layout e mappatura Y↔altezza (pura, senza VexFlow). */

export const MARGIN_X = 10
export const MARGIN_TOP = 10
export const SYSTEM_HEIGHT = 130
export const STAVE_OFFSET = 35
export const MIN_MEASURE_W = 170
const TARGET_MEASURE_W = 240

/** Valore diatonico della riga superiore del rigo, per chiave. */
export const TOP_LINE_DIATONIC: Record<ClefType, number> = {
  treble: diatonicValue({ step: 'F', octave: 5 }),
  bass: diatonicValue({ step: 'A', octave: 3 }),
}

export function measuresPerRow(width: number): number {
  const usable = width - 2 * MARGIN_X
  return Math.max(1, Math.floor(usable / TARGET_MEASURE_W))
}

/** Altezza dalla coordinata Y (relativa all'SVG), data la battuta. */
export function pitchFromY(
  clef: ClefType,
  topLineY: number,
  lineSpacing: number,
  y: number,
): Pitch {
  const half = lineSpacing / 2
  const stepsFromTop = Math.round((y - topLineY) / half)
  const dv = TOP_LINE_DIATONIC[clef] - stepsFromTop
  const clamped = Math.max(0, Math.min(74, dv))
  return { step: STEPS[clamped % 7], octave: Math.floor(clamped / 7) }
}

/** Coordinata Y "agganciata" alla riga/spazio più vicino (per l'anteprima). */
export function snapY(topLineY: number, lineSpacing: number, y: number): number {
  const half = lineSpacing / 2
  return topLineY + Math.round((y - topLineY) / half) * half
}
