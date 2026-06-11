import type { Step } from '../../core/model'
import { ITALIAN_NOTE_NAMES, STEPS } from '../../core/pitch'

interface NoteNameButtonsProps {
  onPress: (step: Step) => void
  disabled?: boolean
  highlightStep?: Step
  wrongStep?: Step
}

/** I sette nomi di nota (Do–Si) come pulsanti di risposta. */
export function NoteNameButtons({
  onPress,
  disabled,
  highlightStep,
  wrongStep,
}: NoteNameButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {STEPS.map((step, i) => {
        const color =
          highlightStep === step
            ? 'border-success bg-success/15 text-success'
            : wrongStep === step
              ? 'border-danger bg-danger/15 text-danger'
              : 'border-border bg-surface hover:border-brand hover:bg-canvas'
        return (
          <button
            key={step}
            type="button"
            disabled={disabled}
            onClick={() => onPress(step)}
            className={`rounded-md border py-3 text-sm font-semibold transition-colors disabled:cursor-default ${color}`}
          >
            {ITALIAN_NOTE_NAMES[i]}
          </button>
        )
      })}
    </div>
  )
}
