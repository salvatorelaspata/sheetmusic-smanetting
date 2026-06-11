import type { Measure, TimeSignature } from './model'
import { durationTicks, PPQ } from './durations'

/** Somma dei ticks degli elementi della prima voce della battuta. */
export function measureTicks(measure: Measure): number {
  const voice = measure.voices[0]
  if (!voice) return 0
  return voice.elements.reduce((sum, el) => sum + durationTicks(el.duration), 0)
}

/** Ticks attesi in una battuta per una data indicazione di tempo. */
export function expectedTicks(ts: TimeSignature): number {
  return ((PPQ * 4) / ts.beatType) * ts.beats
}

export type MeasureStatus = 'empty' | 'incomplete' | 'complete' | 'overfull'

export function measureStatus(measure: Measure, ts: TimeSignature): MeasureStatus {
  const used = measureTicks(measure)
  const expected = expectedTicks(ts)
  if (used === 0) return 'empty'
  if (used < expected) return 'incomplete'
  if (used > expected) return 'overfull'
  return 'complete'
}

/** Ticks ancora disponibili nella battuta (negativi se eccedente). */
export function remainingTicks(measure: Measure, ts: TimeSignature): number {
  return expectedTicks(ts) - measureTicks(measure)
}
