import { useEffect } from 'react'
import type { Step } from '../../core/model'
import { STEP_NAMES_IT } from '../../core/pitch'

interface PianoKeyboardProps {
  /** Riceve la classe d'altezza del tasto premuto (0..11). */
  onPress: (pitchClass: number) => void
  disabled?: boolean
  /** Evidenzia un tasto in verde (risposta corretta). */
  highlightPc?: number
  /** Evidenzia un tasto in rosso (scelta sbagliata). */
  wrongPc?: number
  showLabels?: boolean
}

const WHITE: { step: Step; pc: number; key: string }[] = [
  { step: 'C', pc: 0, key: 'a' },
  { step: 'D', pc: 2, key: 's' },
  { step: 'E', pc: 4, key: 'd' },
  { step: 'F', pc: 5, key: 'f' },
  { step: 'G', pc: 7, key: 'g' },
  { step: 'A', pc: 9, key: 'h' },
  { step: 'B', pc: 11, key: 'j' },
]

const BLACK: { pc: number; after: number; key: string }[] = [
  { pc: 1, after: 0, key: 'w' },
  { pc: 3, after: 1, key: 'e' },
  { pc: 6, after: 3, key: 't' },
  { pc: 8, after: 4, key: 'y' },
  { pc: 10, after: 5, key: 'u' },
]

/**
 * Tastiera di pianoforte virtuale (un'ottava). Risponde al mouse/tocco e alla
 * tastiera fisica (file A–J per i tasti bianchi, W E T Y U per i neri).
 */
export function PianoKeyboard({
  onPress,
  disabled,
  highlightPc,
  wrongPc,
  showLabels = true,
}: PianoKeyboardProps) {
  useEffect(() => {
    if (disabled) return
    const map: Record<string, number> = {}
    WHITE.forEach((w) => (map[w.key] = w.pc))
    BLACK.forEach((b) => (map[b.key] = b.pc))
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      const pc = map[e.key.toLowerCase()]
      if (pc !== undefined) {
        e.preventDefault()
        onPress(pc)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [disabled, onPress])

  const whiteColor = (pc: number) =>
    highlightPc === pc
      ? 'border-success bg-success/30'
      : wrongPc === pc
        ? 'border-danger bg-danger/30'
        : 'border-slate-300 bg-white hover:bg-slate-100'

  const blackColor = (pc: number) =>
    highlightPc === pc
      ? 'bg-success'
      : wrongPc === pc
        ? 'bg-danger'
        : 'bg-slate-900 hover:bg-slate-700'

  return (
    <div className="relative mx-auto h-40 w-full max-w-md select-none">
      <div className="flex h-full w-full">
        {WHITE.map((w) => (
          <button
            key={w.pc}
            type="button"
            disabled={disabled}
            onClick={() => onPress(w.pc)}
            aria-label={STEP_NAMES_IT[w.step]}
            className={`flex flex-1 items-end justify-center rounded-b-md border pb-2 text-xs font-medium text-slate-600 transition-colors disabled:cursor-default ${whiteColor(w.pc)}`}
          >
            {showLabels && <span>{STEP_NAMES_IT[w.step]}</span>}
          </button>
        ))}
      </div>
      {BLACK.map((b) => (
        <button
          key={b.pc}
          type="button"
          disabled={disabled}
          onClick={() => onPress(b.pc)}
          aria-label="Tasto nero"
          className={`absolute top-0 z-10 h-24 rounded-b-md shadow transition-colors disabled:cursor-default ${blackColor(b.pc)}`}
          style={{ width: '8.5%', left: `calc((${b.after} + 1) * (100% / 7) - 4.25%)` }}
        />
      ))}
    </div>
  )
}
