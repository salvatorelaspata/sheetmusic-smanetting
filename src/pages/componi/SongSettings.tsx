import { useTranslation } from 'react-i18next'
import type { ClefType, KeySignature, Score, TimeSignature } from '../../core/model'
import { ALL_FIFTHS, majorKeyName } from '../../core/theory'

interface SongSettingsProps {
  score: Score
  onTitle: (v: string) => void
  onClef: (c: ClefType) => void
  onTime: (ts: TimeSignature) => void
  onKey: (k: KeySignature) => void
  onTempo: (bpm: number) => void
}

const TIME_OPTIONS: { label: string; value: TimeSignature }[] = [
  { label: '4/4', value: { beats: 4, beatType: 4 } },
  { label: '3/4', value: { beats: 3, beatType: 4 } },
  { label: '2/4', value: { beats: 2, beatType: 4 } },
  { label: '6/8', value: { beats: 6, beatType: 8 } },
]

const fieldClass = 'rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-brand'
const labelClass = 'flex flex-col gap-1 text-xs font-medium text-muted'

export function SongSettings({ score, onTitle, onClef, onTime, onKey, onTempo }: SongSettingsProps) {
  const { t } = useTranslation()
  const timeValue = `${score.timeSignature.beats}/${score.timeSignature.beatType}`

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-3">
      <label className={`${labelClass} min-w-48 flex-1`}>
        {t('componi.songTitle')}
        <input
          type="text"
          value={score.title}
          onChange={(e) => onTitle(e.target.value)}
          className={fieldClass}
          placeholder={t('componi.untitled')}
        />
      </label>

      <label className={labelClass}>
        {t('componi.clef')}
        <select value={score.clef} onChange={(e) => onClef(e.target.value as ClefType)} className={fieldClass}>
          <option value="treble">{t('componi.treble')}</option>
          <option value="bass">{t('componi.bass')}</option>
        </select>
      </label>

      <label className={labelClass}>
        {t('componi.time')}
        <select
          value={timeValue}
          onChange={(e) => {
            const opt = TIME_OPTIONS.find((o) => o.label === e.target.value)
            if (opt) onTime(opt.value)
          }}
          className={fieldClass}
        >
          {TIME_OPTIONS.map((o) => (
            <option key={o.label} value={o.label}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        {t('componi.key')}
        <select
          value={score.keySignature.fifths}
          onChange={(e) => onKey({ fifths: Number(e.target.value) })}
          className={fieldClass}
        >
          {ALL_FIFTHS.map((f) => (
            <option key={f} value={f}>
              {majorKeyName(f)}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        {t('componi.tempo')}
        <input
          type="number"
          min={20}
          max={280}
          value={score.tempoBpm}
          onChange={(e) => onTempo(Number(e.target.value))}
          className={`${fieldClass} w-20`}
        />
      </label>
    </div>
  )
}
