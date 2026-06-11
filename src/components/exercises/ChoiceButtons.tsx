interface ChoiceButtonsProps {
  options: string[]
  /** Indice selezionato (null = non ancora risposto). */
  selected: number | null
  correctIndex: number
  onSelect: (i: number) => void
}

/** Griglia di risposte a scelta multipla con feedback (riusata da più esercizi). */
export function ChoiceButtons({ options, selected, correctIndex, onSelect }: ChoiceButtonsProps) {
  const answered = selected !== null
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt, i) => {
        const cls = !answered
          ? 'border-border bg-surface hover:border-brand hover:bg-canvas'
          : i === correctIndex
            ? 'border-success bg-success/15 text-success'
            : i === selected
              ? 'border-danger bg-danger/15 text-danger'
              : 'border-border bg-surface opacity-50'
        return (
          <button
            key={i}
            type="button"
            disabled={answered}
            onClick={() => onSelect(i)}
            className={`rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors disabled:cursor-default ${cls}`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
