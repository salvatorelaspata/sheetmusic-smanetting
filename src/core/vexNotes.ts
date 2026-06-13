import {
  Accidental,
  Annotation,
  Articulation as VexArticulation,
  Curve,
  Dot,
  type RenderContext,
  StaveNote,
  StaveTie,
} from 'vexflow'
import type { Articulation, DisplayClef, NoteElement, Step } from './model'
import { vexDurationCode } from './durations'
import { vexAccidentalCode, vexKey } from './pitch'
import { keySignatureAccidentals } from './theory'

/**
 * Costruzione condivisa di un StaveNote VexFlow dal nostro modello, usata sia
 * dal renderer degli esempi (vexflowAdapter) sia dall'editor (editorRenderer).
 * Include alterazioni, punti, articolazioni e dinamiche (per-nota); le legature
 * di valore e di portamento — che collegano più note — sono disegnate a parte
 * con decorateSpans().
 */

// Altezza (riga centrale) su cui appoggiare la pausa, per ciascuna chiave.
const REST_KEY: Record<DisplayClef, string> = {
  treble: 'b/4',
  bass: 'd/3',
  alto: 'c/4',
  tenor: 'a/3',
}

const ARTICULATION_CODE: Record<Articulation, string> = {
  staccato: 'a.',
  accent: 'a>',
  tenuto: 'a-',
}

/** Mappa Step → tipo di alterazione presente nell'armatura. */
export function keyAccidentalMap(fifths: number): Map<Step, 'sharp' | 'flat'> {
  const m = new Map<Step, 'sharp' | 'flat'>()
  for (const a of keySignatureAccidentals(fifths)) m.set(a.step, a.type)
  return m
}

export function buildStaveNote(
  el: NoteElement,
  clef: DisplayClef,
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

  if (el.articulations) {
    for (const a of el.articulations) note.addModifier(new VexArticulation(ARTICULATION_CODE[a]), 0)
  }
  if (el.dynamic) {
    note.addModifier(
      new Annotation(el.dynamic).setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
      0,
    )
  }
  return note
}

/**
 * Disegna legature di valore (tie) e di portamento (slur) collegando le note
 * dell'elenco. Va chiamata DOPO voice.draw() (le note devono avere una posizione).
 */
export function decorateSpans(
  context: RenderContext,
  elements: NoteElement[],
  notes: StaveNote[],
): void {
  // Legature di valore: una nota con tie 'start'/'continue' è legata alla successiva.
  elements.forEach((el, i) => {
    if ((el.tie === 'start' || el.tie === 'continue') && notes[i + 1]) {
      new StaveTie({
        firstNote: notes[i],
        lastNote: notes[i + 1],
        firstIndexes: [0],
        lastIndexes: [0],
      })
        .setContext(context)
        .draw()
    }
  })

  // Legature di portamento: dalla nota 'start' alla successiva 'stop'.
  let slurStart = -1
  elements.forEach((el, i) => {
    if (el.slur === 'start') {
      slurStart = i
    } else if (el.slur === 'stop' && slurStart >= 0 && notes[slurStart] && notes[i]) {
      new Curve(notes[slurStart], notes[i], {}).setContext(context).draw()
      slurStart = -1
    }
  })
}
