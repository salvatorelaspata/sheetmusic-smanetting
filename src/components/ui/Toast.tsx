import { useToastStore, type ToastTone } from './toastStore'

const TONE_CLASSES: Record<ToastTone, string> = {
  info: 'border-l-brand',
  success: 'border-l-success',
  error: 'border-l-danger',
}

/** Contenitore dei toast, montato una volta in App. */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex items-start gap-3 rounded-lg border border-l-4 border-border bg-surface px-4 py-3 text-sm shadow-lg ${TONE_CLASSES[t.tone]}`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Chiudi notifica"
            className="-mr-1 text-muted transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
