import type { ClefType, KeySignature, NoteElement, Score, TimeSignature } from './model'
import { createMeasure } from './score'

/** Operazioni immutabili sullo Score (ogni funzione restituisce un nuovo Score). */

function touch(score: Score): Score {
  return { ...score, updatedAt: Date.now() }
}

export function appendElement(score: Score, measureIndex: number, element: NoteElement): Score {
  const measures = score.measures.map((m, i) => {
    if (i !== measureIndex) return m
    const voice = m.voices[0] ?? { id: `${m.id}-v`, elements: [] }
    return { ...m, voices: [{ ...voice, elements: [...voice.elements, element] }] }
  })
  return touch({ ...score, measures })
}

export function deleteElement(score: Score, measureIndex: number, elementId: string): Score {
  const measures = score.measures.map((m, i) => {
    if (i !== measureIndex) return m
    const voice = m.voices[0]
    if (!voice) return m
    return {
      ...m,
      voices: [{ ...voice, elements: voice.elements.filter((e) => e.id !== elementId) }],
    }
  })
  return touch({ ...score, measures })
}

export function addMeasure(score: Score): Score {
  return touch({ ...score, measures: [...score.measures, createMeasure()] })
}

export function removeMeasure(score: Score, measureIndex: number): Score {
  if (score.measures.length <= 1) return score
  return touch({ ...score, measures: score.measures.filter((_, i) => i !== measureIndex) })
}

export function setClef(score: Score, clef: ClefType): Score {
  return touch({ ...score, clef })
}
export function setTimeSignature(score: Score, timeSignature: TimeSignature): Score {
  return touch({ ...score, timeSignature })
}
export function setKeySignature(score: Score, keySignature: KeySignature): Score {
  return touch({ ...score, keySignature })
}
export function setTempo(score: Score, tempoBpm: number): Score {
  return touch({ ...score, tempoBpm: Math.max(20, Math.min(280, Math.round(tempoBpm))) })
}
export function setTitle(score: Score, title: string): Score {
  return touch({ ...score, title })
}
