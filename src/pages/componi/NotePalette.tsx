import { useTranslation } from 'react-i18next'
import { PALETTE_DURATIONS } from '../../core/durations'
import type { Accidental, DurationBase } from '../../core/model'
import type { Tool } from './tool'

function DurationGlyph({ base }: { base: DurationBase }) {
  const filled = base !== 'whole' && base !== 'half'
  const hasStem = base !== 'whole'
  const flags = base === 'eighth' ? 1 : base === '16th' ? 2 : base === '32nd' ? 3 : 0
  return (
    <svg viewBox="0 0 28 38" className="h-7 w-6" aria-hidden="true">
      <ellipse
        cx="9"
        cy="28"
        rx="6.2"
        ry="4.6"
        transform="rotate(-18 9 28)"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
      />
      {hasStem && <line x1="14.6" y1="26.5" x2="14.6" y2="6" stroke="currentColor" strokeWidth="1.6" />}
      {Array.from({ length: flags }).map((_, i) => (
        <path
          key={i}
          d={`M14.6 ${6 + i * 5} q7 2 6 9`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      ))}
    </svg>
  )
}

function PBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`inline-flex h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors ${
        active
          ? 'border-brand bg-brand text-brand-fg'
          : 'border-border bg-surface text-ink hover:bg-canvas'
      }`}
    >
      {children}
    </button>
  )
}

const ACCIDENTALS: { acc: Accidental; symbol: string }[] = [
  { acc: 'sharp', symbol: '♯' },
  { acc: 'flat', symbol: '♭' },
  { acc: 'natural', symbol: '♮' },
]

export function NotePalette({ tool, onChange }: { tool: Tool; onChange: (t: Tool) => void }) {
  const { t } = useTranslation()
  const set = (patch: Partial<Tool>) => onChange({ ...tool, ...patch })

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
      <PBtn title={t('componi.select')} active={tool.mode === 'select'} onClick={() => set({ mode: 'select' })}>
        ↖
      </PBtn>

      <span className="mx-1 h-8 w-px bg-border" />

      <div className="flex items-center gap-1">
        {PALETTE_DURATIONS.map((d) => (
          <PBtn
            key={d.base}
            title={d.it}
            active={tool.duration === d.base && tool.mode !== 'erase' && tool.mode !== 'select'}
            onClick={() =>
              set({
                duration: d.base,
                mode: tool.mode === 'erase' || tool.mode === 'select' ? 'note' : tool.mode,
              })
            }
          >
            <DurationGlyph base={d.base} />
          </PBtn>
        ))}
      </div>

      <span className="mx-1 h-8 w-px bg-border" />

      <PBtn title={t('componi.dot')} active={tool.dotted} onClick={() => set({ dotted: !tool.dotted })}>
        ♩.
      </PBtn>

      <PBtn
        title={t('componi.rest')}
        active={tool.mode === 'rest'}
        onClick={() => set({ mode: tool.mode === 'rest' ? 'note' : 'rest' })}
      >
        𝄽
      </PBtn>

      <span className="mx-1 h-8 w-px bg-border" />

      {ACCIDENTALS.map((a) => (
        <PBtn
          key={a.acc}
          title={a.acc}
          active={tool.accidental === a.acc && tool.mode === 'note'}
          onClick={() =>
            set({ accidental: tool.accidental === a.acc ? null : a.acc, mode: 'note' })
          }
        >
          {a.symbol}
        </PBtn>
      ))}

      <span className="mx-1 h-8 w-px bg-border" />

      <PBtn
        title={t('componi.erase')}
        active={tool.mode === 'erase'}
        onClick={() => set({ mode: tool.mode === 'erase' ? 'note' : 'erase' })}
      >
        🧽
      </PBtn>
    </div>
  )
}
