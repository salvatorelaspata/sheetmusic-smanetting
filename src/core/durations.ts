import type { Duration, DurationBase } from './model'

/** Ticks per quarto (Pulses Per Quarter). */
export const PPQ = 480

const BASE_TICKS: Record<DurationBase, number> = {
  whole: PPQ * 4,
  half: PPQ * 2,
  quarter: PPQ,
  eighth: PPQ / 2,
  '16th': PPQ / 4,
  '32nd': PPQ / 8,
}

/** Durata in ticks, tenendo conto dei punti di valore. */
export function durationTicks(d: Duration): number {
  const base = BASE_TICKS[d.base]
  let total = base
  let add = base
  for (let i = 0; i < d.dots; i++) {
    add = add / 2
    total += add
  }
  return total
}

/** Durata in secondi a un dato tempo (BPM). */
export function durationSeconds(d: Duration, bpm: number): number {
  return (durationTicks(d) / PPQ) * (60 / bpm)
}

const VEX_CODE: Record<DurationBase, string> = {
  whole: 'w',
  half: 'h',
  quarter: 'q',
  eighth: '8',
  '16th': '16',
  '32nd': '32',
}

/** Codice durata per VexFlow (es. 'q'); aggiungere 'r' per le pause. */
export function vexDurationCode(base: DurationBase): string {
  return VEX_CODE[base]
}

/** Durate proposte nella palette dell'editor (dalla più lunga). */
export const PALETTE_DURATIONS: { base: DurationBase; it: string; en: string }[] = [
  { base: 'whole', it: 'Semibreve', en: 'Whole' },
  { base: 'half', it: 'Minima', en: 'Half' },
  { base: 'quarter', it: 'Semiminima', en: 'Quarter' },
  { base: 'eighth', it: 'Croma', en: 'Eighth' },
  { base: '16th', it: 'Semicroma', en: 'Sixteenth' },
  { base: '32nd', it: 'Biscroma', en: 'Thirty-second' },
]

/** Nome italiano della durata (per Teoria/Pratica). */
export function durationNameIt(base: DurationBase): string {
  return PALETTE_DURATIONS.find((d) => d.base === base)?.it ?? base
}
