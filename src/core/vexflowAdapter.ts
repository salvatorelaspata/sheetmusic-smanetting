import { Accidental, Dot, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow'
import type { ClefType, KeySignature, NoteElement, TimeSignature } from './model'
import { vexDurationCode } from './durations'
import { vexAccidentalCode, vexKey } from './pitch'
import { vexKeySignatureName } from './theory'

/**
 * Adapter che traduce un frammento del nostro modello in oggetti VexFlow e li
 * disegna in un contenitore. È l'UNICO punto del codice che importa VexFlow:
 * usato solo da <Staff>. Restituisce le bounding box delle note per gli overlay
 * cliccabili e il cursore (vedi REQUISITI.md §3.2).
 */

export interface StaffFragment {
  clef: ClefType
  timeSignature?: TimeSignature
  keySignature?: KeySignature
  elements: NoteElement[]
}

export interface NoteHit {
  /** Indice dell'elemento nel frammento. */
  index: number
  x: number
  y: number
  w: number
  h: number
}

export interface RenderOptions {
  width: number
  height?: number
  highlightIndex?: number
  highlightColor?: string
}

export interface RenderResult {
  width: number
  height: number
  hits: NoteHit[]
}

const REST_KEY: Record<ClefType, string> = { treble: 'b/4', bass: 'd/3' }

export function renderFragment(
  container: HTMLDivElement,
  fragment: StaffFragment,
  options: RenderOptions,
): RenderResult {
  const width = Math.max(120, Math.floor(options.width))
  const height = options.height ?? 160
  const staveY = 30

  container.innerHTML = ''
  const renderer = new Renderer(container, Renderer.Backends.SVG)
  renderer.resize(width, height)
  const context = renderer.getContext()

  const stave = new Stave(8, staveY, width - 16)
  stave.addClef(fragment.clef)
  if (fragment.keySignature) {
    stave.addKeySignature(vexKeySignatureName(fragment.keySignature.fifths))
  }
  if (fragment.timeSignature) {
    stave.addTimeSignature(`${fragment.timeSignature.beats}/${fragment.timeSignature.beatType}`)
  }
  stave.setContext(context).draw()

  const ts = fragment.timeSignature ?? { beats: 4, beatType: 4 }

  const notes: StaveNote[] = fragment.elements.map((el, i) => {
    const isRest = el.kind === 'rest' || el.pitches.length === 0
    const code = vexDurationCode(el.duration.base) + (isRest ? 'r' : '')
    const keys = isRest ? [REST_KEY[fragment.clef]] : el.pitches.map(vexKey)
    const note = new StaveNote({ keys, duration: code, clef: fragment.clef, autoStem: true })

    if (!isRest) {
      el.pitches.forEach((p, pi) => {
        const acc = vexAccidentalCode(p)
        if (acc) note.addModifier(new Accidental(acc), pi)
      })
    }
    for (let d = 0; d < el.duration.dots; d++) {
      Dot.buildAndAttach([note], { all: true })
    }
    if (options.highlightIndex === i) {
      const color = options.highlightColor ?? '#4338ca'
      note.setStyle({ fillStyle: color, strokeStyle: color })
    }
    return note
  })

  if (notes.length > 0) {
    const voice = new Voice({ numBeats: ts.beats, beatValue: ts.beatType })
    voice.setMode(Voice.Mode.SOFT)
    voice.addTickables(notes)
    new Formatter().joinVoices([voice]).format([voice], Math.max(60, width - 90))
    voice.draw(context, stave)
  }

  const hits: NoteHit[] = []
  fragment.elements.forEach((el, i) => {
    if (el.kind === 'rest' || el.pitches.length === 0) return
    const bb = notes[i].getBoundingBox()
    hits.push({ index: i, x: bb.getX(), y: bb.getY(), w: bb.getW(), h: bb.getH() })
  })

  return { width, height, hits }
}
