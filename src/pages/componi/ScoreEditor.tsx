import { useEffect, useRef, useState } from 'react'
import type { NoteElement, Pitch, Score } from '../../core/model'
import { renderScore, type RenderedMeasure, type RenderedNote } from '../../core/editorRenderer'
import { pitchFromY, snapY } from '../../core/staffGeometry'
import { createNote, createRest, dur } from '../../core/score'
import { diatonicValue, noteName } from '../../core/pitch'
import type { MeasureStatus } from '../../core/validation'
import { useSettings } from '../../state/settingsStore'
import type { Tool } from './tool'

interface HoverInsert {
  kind: 'insert'
  measureIndex: number
  position: number
  x: number
  y: number
  pitch: Pitch | null
}
interface HoverErase {
  kind: 'erase'
  note: RenderedNote
}
type Hover = HoverInsert | HoverErase | null

interface DragState {
  startDiatonic: number
  startY: number
  measure: RenderedMeasure
  moved: boolean
}

interface ScoreEditorProps {
  score: Score
  tool: Tool
  selectedIds: Set<string>
  highlightGlobalIndex?: number
  onInsert: (measureIndex: number, position: number, element: NoteElement) => void
  onErase: (measureIndex: number, elementId: string) => void
  onSelect: (elementId: string, additive: boolean) => void
  onClearSelection: () => void
  onTranspose: (deltaDiatonic: number) => void
}

const STATUS_TINT: Record<MeasureStatus, string> = {
  empty: 'transparent',
  incomplete: 'rgba(234, 179, 8, 0.10)',
  complete: 'transparent',
  overfull: 'rgba(220, 38, 38, 0.12)',
}
const STATUS_DOT: Record<MeasureStatus, string> = {
  empty: 'bg-border',
  incomplete: 'bg-amber-500',
  complete: 'bg-success',
  overfull: 'bg-danger',
}

export function ScoreEditor({
  score,
  tool,
  selectedIds,
  highlightGlobalIndex,
  onInsert,
  onErase,
  onSelect,
  onClearSelection,
  onTranspose,
}: ScoreEditorProps) {
  const showEnglish = useSettings((s) => s.showEnglishNotation)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [width, setWidth] = useState(0)
  const [result, setResult] = useState<ReturnType<typeof renderScore> | null>(null)
  const [hover, setHover] = useState<Hover>(null)
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; pitch: Pitch } | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => setWidth(Math.round(entries[0]?.contentRect.width ?? 0)))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = drawRef.current
    if (!el || width <= 0) return
    setResult(renderScore(el, score, { width, highlightGlobalIndex, selectedIds }))
  }, [width, score, highlightGlobalIndex, selectedIds])

  const relCoords = (e: React.PointerEvent) => {
    const rect = drawRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const findNote = (x: number, y: number): RenderedNote | null => {
    if (!result) return null
    const pad = 7
    let best: RenderedNote | null = null
    let bestDist = Infinity
    for (const n of result.notes) {
      if (x >= n.x - pad && x <= n.x + n.w + pad && y >= n.y - pad && y <= n.y + n.h + pad) {
        const d = (x - (n.x + n.w / 2)) ** 2 + (y - (n.y + n.h / 2)) ** 2
        if (d < bestDist) {
          bestDist = d
          best = n
        }
      }
    }
    return best
  }

  const elementAt = (n: RenderedNote): NoteElement | undefined =>
    score.measures[n.measureIndex]?.voices[0]?.elements[n.elementIndex]

  const insertionPosition = (measureIndex: number, x: number): number =>
    result
      ? result.notes.filter((n) => n.measureIndex === measureIndex && n.x + n.w / 2 < x).length
      : 0

  const buildElement = (pitch: Pitch | null): NoteElement => {
    const d = dur(tool.duration, tool.dotted ? 1 : 0)
    if (tool.mode === 'rest' || !pitch) return createRest(d)
    return createNote([tool.accidental ? { ...pitch, accidental: tool.accidental } : pitch], d)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (tool.mode !== 'select' || !result) return
    const { x, y } = relCoords(e)
    const note = findNote(x, y)
    if (!note) {
      if (!e.shiftKey) onClearSelection()
      return
    }
    const el = elementAt(note)
    if (el) onSelect(el.id, e.shiftKey)
    if (el && el.kind === 'note' && el.pitches.length > 0) {
      dragRef.current = {
        startDiatonic: diatonicValue(el.pitches[0]),
        startY: y,
        measure: result.measures[note.measureIndex],
        moved: false,
      }
      ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!result) return
    const { x, y } = relCoords(e)

    if (tool.mode === 'select') {
      const drag = dragRef.current
      if (drag) {
        if (Math.abs(y - drag.startY) > 3) drag.moved = true
        const pitch = pitchFromY(score.clef, drag.measure.topLineY, drag.measure.lineSpacing, y)
        setDragPreview({ x, y: snapY(drag.measure.topLineY, drag.measure.lineSpacing, y), pitch })
      }
      return
    }

    if (tool.mode === 'erase') {
      const note = findNote(x, y)
      setHover(note ? { kind: 'erase', note } : null)
      return
    }

    const measure = result.measures.find(
      (m) => x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h,
    )
    if (!measure) {
      setHover(null)
      return
    }
    const pitch = tool.mode === 'note' ? pitchFromY(score.clef, measure.topLineY, measure.lineSpacing, y) : null
    setHover({
      kind: 'insert',
      measureIndex: measure.index,
      position: insertionPosition(measure.index, x),
      x,
      y: snapY(measure.topLineY, measure.lineSpacing, y),
      pitch,
    })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (drag && result) {
      const { y } = relCoords(e)
      const current = diatonicValue(
        pitchFromY(score.clef, drag.measure.topLineY, drag.measure.lineSpacing, y),
      )
      const delta = current - drag.startDiatonic
      if (drag.moved && delta !== 0) onTranspose(delta)
    }
    dragRef.current = null
    setDragPreview(null)
  }

  const onClick = () => {
    if (tool.mode === 'select') return
    if (!hover) return
    if (hover.kind === 'erase') {
      const el = score.measures[hover.note.measureIndex]?.voices[0]?.elements[hover.note.elementIndex]
      if (el) onErase(hover.note.measureIndex, el.id)
      setHover(null)
    } else {
      onInsert(hover.measureIndex, hover.position, buildElement(hover.pitch))
    }
  }

  const cursor =
    tool.mode === 'erase' ? 'not-allowed' : tool.mode === 'select' ? 'pointer' : 'crosshair'

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden rounded-lg border border-border bg-white">
      <div
        ref={drawRef}
        role="img"
        aria-label="Editor dello spartito"
        className="[&_svg]:block"
        style={{ minHeight: result?.height ?? 160 }}
      />

      {result?.measures.map((m) => (
        <div
          key={m.index}
          className="pointer-events-none absolute"
          style={{ left: m.x, top: m.y, width: m.w, height: m.h, background: STATUS_TINT[m.status] }}
        >
          <span className={`absolute left-1 top-1 h-2 w-2 rounded-full ${STATUS_DOT[m.status]}`} />
        </div>
      ))}

      {hover?.kind === 'insert' && (
        <div className="pointer-events-none absolute" style={{ left: hover.x, top: hover.y }}>
          <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 11, height: 8, background: 'rgba(79,70,229,0.55)' }} />
          <span className="absolute left-3 -top-3 whitespace-nowrap rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-brand-fg">
            {hover.pitch ? noteName(hover.pitch, { showEnglish }) : 'Pausa'}
          </span>
        </div>
      )}
      {hover?.kind === 'erase' && (
        <div className="pointer-events-none absolute rounded border-2 border-danger bg-danger/10" style={{ left: hover.note.x - 4, top: hover.note.y - 4, width: hover.note.w + 8, height: hover.note.h + 8 }} />
      )}
      {dragPreview && (
        <div className="pointer-events-none absolute" style={{ left: dragPreview.x, top: dragPreview.y }}>
          <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 11, height: 8, background: 'rgba(37,99,235,0.6)' }} />
          <span className="absolute left-3 -top-3 whitespace-nowrap rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {noteName(dragPreview.pitch, { showEnglish })}
          </span>
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{ cursor }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          if (!dragRef.current) setHover(null)
        }}
        onClick={onClick}
      />
    </div>
  )
}
