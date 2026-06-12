import { Formatter, Renderer, Stave, Voice } from 'vexflow'
import type { Score } from './model'
import { vexKeySignatureName } from './theory'
import { buildStaveNote, keyAccidentalMap } from './vexNotes'
import { measureStatus, type MeasureStatus } from './validation'
import {
  MARGIN_TOP,
  MARGIN_X,
  measuresPerRow,
  MIN_MEASURE_W,
  STAVE_OFFSET,
  SYSTEM_HEIGHT,
} from './staffGeometry'

/**
 * Renderer multi-battuta per l'editor (Componi). Dispone le battute in righe
 * con a capo automatico e restituisce i metadati di interazione: rettangoli
 * delle battute (con geometria per la mappatura clic→altezza), posizioni delle
 * note e stato di validazione di ogni battuta.
 */

export interface RenderedNote {
  measureIndex: number
  elementIndex: number
  /** Indice globale (note + pause) nell'intero brano, per il cursore. */
  globalIndex: number
  isRest: boolean
  x: number
  y: number
  w: number
  h: number
}

export interface RenderedMeasure {
  index: number
  x: number
  y: number
  w: number
  h: number
  topLineY: number
  lineSpacing: number
  status: MeasureStatus
}

export interface EditorRenderResult {
  width: number
  height: number
  measures: RenderedMeasure[]
  notes: RenderedNote[]
}

export function renderScore(
  container: HTMLDivElement,
  score: Score,
  opts: {
    width: number
    highlightGlobalIndex?: number
    highlightColor?: string
    selectedIds?: Set<string>
    selectionColor?: string
  },
): EditorRenderResult {
  const width = Math.max(2 * MARGIN_X + MIN_MEASURE_W, Math.floor(opts.width))
  const perRow = Math.min(measuresPerRow(width), Math.max(1, score.measures.length))
  const measureW = (width - 2 * MARGIN_X) / perRow
  const rows = Math.ceil(score.measures.length / perRow)
  const height = MARGIN_TOP + rows * SYSTEM_HEIGHT + 10

  container.innerHTML = ''
  const renderer = new Renderer(container, Renderer.Backends.SVG)
  renderer.resize(width, height)
  const context = renderer.getContext()

  const keyAcc = keyAccidentalMap(score.keySignature.fifths)
  const measures: RenderedMeasure[] = []
  const notes: RenderedNote[] = []
  let globalIndex = 0

  score.measures.forEach((measure, i) => {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const x = MARGIN_X + col * measureW
    const rowTop = MARGIN_TOP + row * SYSTEM_HEIGHT
    const staveY = rowTop + STAVE_OFFSET

    const stave = new Stave(x, staveY, measureW)
    if (col === 0) {
      stave.addClef(score.clef)
      if (score.keySignature.fifths !== 0) {
        stave.addKeySignature(vexKeySignatureName(score.keySignature.fifths))
      }
    }
    if (i === 0) {
      stave.addTimeSignature(`${score.timeSignature.beats}/${score.timeSignature.beatType}`)
    }
    stave.setContext(context).draw()

    const elements = measure.voices[0]?.elements ?? []
    const staveNotes = elements.map((el, ei) => {
      const note = buildStaveNote(el, score.clef, keyAcc)
      if (opts.selectedIds?.has(el.id)) {
        const color = opts.selectionColor ?? '#2563eb'
        note.setStyle({ fillStyle: color, strokeStyle: color })
      } else if (opts.highlightGlobalIndex === globalIndex + ei) {
        const color = opts.highlightColor ?? '#4338ca'
        note.setStyle({ fillStyle: color, strokeStyle: color })
      }
      return note
    })

    if (staveNotes.length > 0) {
      const voice = new Voice({
        numBeats: score.timeSignature.beats,
        beatValue: score.timeSignature.beatType,
      })
      voice.setMode(Voice.Mode.SOFT)
      voice.addTickables(staveNotes)
      const pad = col === 0 ? 72 : 26
      new Formatter().joinVoices([voice]).format([voice], Math.max(50, measureW - pad))
      voice.draw(context, stave)
    }

    elements.forEach((el, ei) => {
      const bb = staveNotes[ei].getBoundingBox()
      notes.push({
        measureIndex: i,
        elementIndex: ei,
        globalIndex: globalIndex + ei,
        isRest: el.kind === 'rest' || el.pitches.length === 0,
        x: bb.getX(),
        y: bb.getY(),
        w: bb.getW(),
        h: bb.getH(),
      })
    })

    measures.push({
      index: i,
      x,
      y: rowTop,
      w: measureW,
      h: SYSTEM_HEIGHT,
      topLineY: stave.getYForLine(0),
      lineSpacing: stave.getSpacingBetweenLines(),
      status: measureStatus(measure, score.timeSignature),
    })

    globalIndex += elements.length
  })

  return { width, height, measures, notes }
}
