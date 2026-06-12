import { Formatter, Renderer, Stave, Voice } from 'vexflow'
import type { ClefType, KeySignature, NoteElement, TimeSignature } from './model'
import { vexKeySignatureName } from './theory'
import { buildStaveNote, decorateSpans, keyAccidentalMap } from './vexNotes'

/**
 * Renderer a rigo singolo per esempi ed esercizi. È, con editorRenderer, uno dei
 * punti che importano VexFlow. Restituisce le bounding box delle note per gli
 * overlay cliccabili e il cursore (vedi REQUISITI.md §3.2).
 */

export interface StaffFragment {
  clef: ClefType
  timeSignature?: TimeSignature
  keySignature?: KeySignature
  elements: NoteElement[]
}

export interface NoteHit {
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

export function renderFragment(
  container: HTMLDivElement,
  fragment: StaffFragment,
  options: RenderOptions,
): RenderResult {
  const width = Math.max(120, Math.floor(options.width))
  const height = options.height ?? 160

  container.innerHTML = ''
  const renderer = new Renderer(container, Renderer.Backends.SVG)
  renderer.resize(width, height)
  const context = renderer.getContext()

  const stave = new Stave(8, 30, width - 16)
  stave.addClef(fragment.clef)
  if (fragment.keySignature) {
    stave.addKeySignature(vexKeySignatureName(fragment.keySignature.fifths))
  }
  if (fragment.timeSignature) {
    stave.addTimeSignature(`${fragment.timeSignature.beats}/${fragment.timeSignature.beatType}`)
  }
  stave.setContext(context).draw()

  const ts = fragment.timeSignature ?? { beats: 4, beatType: 4 }
  const keyAcc = keyAccidentalMap(fragment.keySignature?.fifths ?? 0)

  const notes = fragment.elements.map((el, i) => {
    const note = buildStaveNote(el, fragment.clef, keyAcc)
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
    decorateSpans(context, fragment.elements, notes)
  }

  const hits: NoteHit[] = []
  fragment.elements.forEach((el, i) => {
    if (el.kind === 'rest' || el.pitches.length === 0) return
    const bb = notes[i].getBoundingBox()
    hits.push({ index: i, x: bb.getX(), y: bb.getY(), w: bb.getW(), h: bb.getH() })
  })

  return { width, height, hits }
}
