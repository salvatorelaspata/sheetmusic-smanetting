import { useEffect, useRef, useState } from 'react'
import type { NoteElement, Pitch, Score } from '../../core/model'
import { renderScore, type RenderedNote } from '../../core/editorRenderer'
import { pitchFromY, snapY } from '../../core/staffGeometry'
import { createNote, createRest, dur } from '../../core/score'
import { noteName } from '../../core/pitch'
import type { MeasureStatus } from '../../core/validation'
import { useSettings } from '../../state/settingsStore'
import type { Tool } from './tool'

interface HoverInsert {
  kind: 'insert'
  measureIndex: number
  x: number
  y: number
  pitch: Pitch | null
}
interface HoverErase {
  kind: 'erase'
  note: RenderedNote
}
type Hover = HoverInsert | HoverErase | null

interface ScoreEditorProps {
  score: Score
  tool: Tool
  highlightGlobalIndex?: number
  onInsert: (measureIndex: number, element: NoteElement) => void
  onErase: (measureIndex: number, elementId: string) => void
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
  highlightGlobalIndex,
  onInsert,
  onErase,
}: ScoreEditorProps) {
  const showEnglish = useSettings((s) => s.showEnglishNotation)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [result, setResult] = useState<ReturnType<typeof renderScore> | null>(null)
  const [hover, setHover] = useState<Hover>(null)

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
    setResult(renderScore(el, score, { width, highlightGlobalIndex }))
  }, [width, score, highlightGlobalIndex])

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
        const cx = n.x + n.w / 2
        const cy = n.y + n.h / 2
        const d = (x - cx) ** 2 + (y - cy) ** 2
        if (d < bestDist) {
          bestDist = d
          best = n
        }
      }
    }
    return best
  }

  const onMove = (e: React.PointerEvent) => {
    if (!result) return
    const { x, y } = relCoords(e)
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
    const sy = snapY(measure.topLineY, measure.lineSpacing, y)
    setHover({ kind: 'insert', measureIndex: measure.index, x, y: sy, pitch })
  }

  const buildElement = (pitch: Pitch | null): NoteElement => {
    const d = dur(tool.duration, tool.dotted ? 1 : 0)
    if (tool.mode === 'rest' || !pitch) return createRest(d)
    const p = tool.accidental ? { ...pitch, accidental: tool.accidental } : pitch
    return createNote([p], d)
  }

  const onClick = () => {
    if (!hover) return
    if (hover.kind === 'erase') {
      const el = score.measures[hover.note.measureIndex]?.voices[0]?.elements[hover.note.elementIndex]
      if (el) onErase(hover.note.measureIndex, el.id)
      setHover(null)
    } else {
      onInsert(hover.measureIndex, buildElement(hover.pitch))
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-lg border border-border bg-white"
    >
      <div ref={drawRef} className="[&_svg]:block" style={{ minHeight: result?.height ?? 160 }} />

      {/* Tinte di validazione + indicatori di stato per battuta */}
      {result?.measures.map((m) => (
        <div key={m.index} className="pointer-events-none absolute" style={{ left: m.x, top: m.y, width: m.w, height: m.h, background: STATUS_TINT[m.status] }}>
          <span className={`absolute left-1 top-1 h-2 w-2 rounded-full ${STATUS_DOT[m.status]}`} />
        </div>
      ))}

      {/* Anteprima nota / pausa o evidenziazione gomma */}
      {hover?.kind === 'insert' && (
        <div className="pointer-events-none absolute" style={{ left: hover.x, top: hover.y }}>
          <span className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: 11, height: 8, background: 'rgba(79,70,229,0.55)' }} />
          <span className="absolute left-3 -top-3 whitespace-nowrap rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-brand-fg">
            {hover.pitch ? noteName(hover.pitch, { showEnglish }) : 'Pausa'}
          </span>
        </div>
      )}
      {hover?.kind === 'erase' && (
        <div
          className="pointer-events-none absolute rounded border-2 border-danger bg-danger/10"
          style={{ left: hover.note.x - 4, top: hover.note.y - 4, width: hover.note.w + 8, height: hover.note.h + 8 }}
        />
      )}

      {/* Strato interattivo */}
      <div
        className="absolute inset-0"
        style={{ cursor: tool.mode === 'erase' ? 'not-allowed' : 'crosshair' }}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onClick={onClick}
      />
    </div>
  )
}
