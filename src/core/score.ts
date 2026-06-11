import { makeId } from './ids'
import type {
  ClefType,
  Duration,
  KeySignature,
  Measure,
  NoteElement,
  Pitch,
  Score,
  TimeSignature,
  Voice,
} from './model'
import { SCORE_SCHEMA_VERSION } from './model'

export function createNote(
  pitches: Pitch[],
  duration: Duration,
  extra?: Partial<Omit<NoteElement, 'id' | 'kind' | 'pitches' | 'duration'>>,
): NoteElement {
  return { id: makeId('n'), kind: 'note', pitches, duration, ...extra }
}

export function createRest(duration: Duration): NoteElement {
  return { id: makeId('r'), kind: 'rest', pitches: [], duration }
}

export function createVoice(elements: NoteElement[] = []): Voice {
  return { id: makeId('v'), elements }
}

export function createMeasure(elements: NoteElement[] = []): Measure {
  return { id: makeId('m'), voices: [createVoice(elements)] }
}

export interface CreateScoreOptions {
  title?: string
  clef?: ClefType
  timeSignature?: TimeSignature
  keySignature?: KeySignature
  tempoBpm?: number
  measures?: Measure[]
}

export function createScore(options: CreateScoreOptions = {}): Score {
  const now = Date.now()
  return {
    id: makeId('score'),
    title: options.title ?? 'Senza titolo',
    clef: options.clef ?? 'treble',
    timeSignature: options.timeSignature ?? { beats: 4, beatType: 4 },
    keySignature: options.keySignature ?? { fifths: 0 },
    tempoBpm: options.tempoBpm ?? 90,
    measures: options.measures ?? [createMeasure()],
    createdAt: now,
    updatedAt: now,
    schemaVersion: SCORE_SCHEMA_VERSION,
  }
}

/** Scorciatoia per una durata semplice senza punti. */
export function dur(base: Duration['base'], dots: Duration['dots'] = 0): Duration {
  return { base, dots }
}
