import type { ClefType, KeySignature, NoteElement, Score, TimeSignature } from './model'
import { createMeasure } from './score'
import { makeId } from './ids'
import { diatonicValue, pitchFromDiatonic } from './pitch'

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

/** Inserisce un elemento in una posizione specifica della battuta. */
export function insertElement(
  score: Score,
  measureIndex: number,
  position: number,
  element: NoteElement,
): Score {
  const measures = score.measures.map((m, i) => {
    if (i !== measureIndex) return m
    const voice = m.voices[0] ?? { id: `${m.id}-v`, elements: [] }
    const els = [...voice.elements]
    els.splice(Math.max(0, Math.min(position, els.length)), 0, element)
    return { ...m, voices: [{ ...voice, elements: els }] }
  })
  return touch({ ...score, measures })
}

export function appendElements(
  score: Score,
  measureIndex: number,
  elements: NoteElement[],
): Score {
  const measures = score.measures.map((m, i) => {
    if (i !== measureIndex) return m
    const voice = m.voices[0] ?? { id: `${m.id}-v`, elements: [] }
    return { ...m, voices: [{ ...voice, elements: [...voice.elements, ...elements] }] }
  })
  return touch({ ...score, measures })
}

/** Sposta l'altezza degli elementi selezionati di `deltaDiatonic` gradi diatonici. */
export function transposeElements(score: Score, ids: Set<string>, deltaDiatonic: number): Score {
  if (deltaDiatonic === 0 || ids.size === 0) return score
  const measures = score.measures.map((m) => {
    const voice = m.voices[0]
    if (!voice) return m
    let changed = false
    const els = voice.elements.map((el) => {
      if (!ids.has(el.id) || el.kind === 'rest' || el.pitches.length === 0) return el
      changed = true
      return {
        ...el,
        pitches: el.pitches.map((p) => pitchFromDiatonic(diatonicValue(p) + deltaDiatonic, p.accidental)),
      }
    })
    return changed ? { ...m, voices: [{ ...voice, elements: els }] } : m
  })
  return touch({ ...score, measures })
}

/** Duplica elementi assegnando nuovi id (per copia/incolla). */
export function cloneElements(elements: NoteElement[]): NoteElement[] {
  return elements.map((el) => ({
    ...el,
    id: makeId(el.kind === 'rest' ? 'r' : 'n'),
    pitches: el.pitches.map((p) => ({ ...p })),
  }))
}

/** Elimina tutti gli elementi i cui id sono nell'insieme (cancellazione multipla). */
export function deleteElements(score: Score, ids: Set<string>): Score {
  if (ids.size === 0) return score
  const measures = score.measures.map((m) => {
    const voice = m.voices[0]
    if (!voice) return m
    return { ...m, voices: [{ ...voice, elements: voice.elements.filter((e) => !ids.has(e.id)) }] }
  })
  return touch({ ...score, measures })
}

/** Tutti gli id elemento presenti nello Score (per validare la selezione). */
export function allElementIds(score: Score): Set<string> {
  const ids = new Set<string>()
  for (const m of score.measures) for (const e of m.voices[0]?.elements ?? []) ids.add(e.id)
  return ids
}
