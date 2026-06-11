import { useEffect, useRef, useState } from 'react'
import type { ClefType, KeySignature, NoteElement, TimeSignature } from '../../core/model'
import { renderFragment, type NoteHit } from '../../core/vexflowAdapter'

export interface StaffProps {
  clef: ClefType
  timeSignature?: TimeSignature
  keySignature?: KeySignature
  elements: NoteElement[]
  /** Indice dell'elemento da evidenziare (cursore di riproduzione / feedback). */
  highlightIndex?: number
  /** Se presente, le note diventano cliccabili (overlay accessibili). */
  onNoteClick?: (elementIndex: number) => void
  /** Etichetta accessibile per la nota cliccabile. */
  noteLabel?: (elementIndex: number) => string
  height?: number
  className?: string
}

/**
 * Componente riutilizzabile che incapsula VexFlow. È, con audio.ts, uno dei due
 * soli punti di contatto con le librerie esterne. Gestisce il ridimensionamento
 * responsive (ResizeObserver) e sovrappone pulsanti trasparenti sulle note per
 * renderle cliccabili da mouse e tastiera.
 */
export function Staff({
  clef,
  timeSignature,
  keySignature,
  elements,
  highlightIndex,
  onNoteClick,
  noteLabel,
  height = 160,
  className,
}: StaffProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hits, setHits] = useState<NoteHit[]>([])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      setWidth(Math.round(w))
    })
    observer.observe(el)
    setWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = drawRef.current
    if (!el || width <= 0) return
    const result = renderFragment(
      el,
      { clef, timeSignature, keySignature, elements },
      { width, height, highlightIndex },
    )
    setHits(result.hits)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    width,
    clef,
    timeSignature?.beats,
    timeSignature?.beatType,
    keySignature?.fifths,
    elements,
    highlightIndex,
    height,
  ])

  return (
    <div
      ref={wrapRef}
      className={`relative w-full overflow-hidden rounded-lg border border-border bg-white ${className ?? ''}`}
    >
      <div ref={drawRef} className="[&_svg]:block" style={{ minHeight: height }} />
      {onNoteClick &&
        hits.map((hit) => (
          <button
            key={hit.index}
            type="button"
            onClick={() => onNoteClick(hit.index)}
            aria-label={noteLabel?.(hit.index) ?? `Nota ${hit.index + 1}`}
            className="absolute rounded transition-colors hover:bg-brand/15 focus-visible:bg-brand/25"
            style={{ left: hit.x - 5, top: hit.y - 5, width: hit.w + 10, height: hit.h + 10 }}
          />
        ))}
    </div>
  )
}
