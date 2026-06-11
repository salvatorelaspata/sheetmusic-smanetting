import { Accidental, Dot, StaveNote } from 'vexflow'
import type { ClefType, NoteElement, Step } from './model'
import { vexDurationCode } from './durations'
import { vexAccidentalCode, vexKey } from './pitch'
import { keySignatureAccidentals } from './theory'

/**
 * Costruzione condivisa di un StaveNote VexFlow dal nostro modello, usata sia
 * dal renderer degli esempi (vexflowAdapter) sia dall'editor (editorRenderer).
 */

const REST_KEY: Record<ClefType, string> = { treble: 'b/4', bass: 'd/3' }

/** Mappa Step → tipo di alterazione presente nell'armatura. */
export function keyAccidentalMap(fifths: number): Map<Step, 'sharp' | 'flat'> {
  const m = new Map<Step, 'sharp' | 'flat'>()
  for (const a of keySignatureAccidentals(fifths)) m.set(a.step, a.type)
  return m
}

export function buildStaveNote(
  el: NoteElement,
  clef: ClefType,
  keyAcc: Map<Step, 'sharp' | 'flat'>,
): StaveNote {
  const isRest = el.kind === 'rest' || el.pitches.length === 0
  const code = vexDurationCode(el.duration.base) + (isRest ? 'r' : '')
  const keys = isRest ? [REST_KEY[clef]] : el.pitches.map(vexKey)
  const note = new StaveNote({ keys, duration: code, clef, autoStem: true })

  if (!isRest) {
    el.pitches.forEach((p, pi) => {
      const acc = vexAccidentalCode(p)
      if (!acc) return
      const inKey = keyAcc.get(p.step)
      const redundant =
        (p.accidental === 'sharp' && inKey === 'sharp') ||
        (p.accidental === 'flat' && inKey === 'flat')
      if (!redundant) note.addModifier(new Accidental(acc), pi)
    })
  }
  for (let d = 0; d < el.duration.dots; d++) Dot.buildAndAttach([note], { all: true })
  return note
}
