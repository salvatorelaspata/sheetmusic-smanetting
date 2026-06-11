import { useMemo, useState } from 'react'
import { Staff } from '../components/music/Staff'
import { playPitch, playSequence, stopPlayback } from '../audio/audio'
import { createNote, dur } from '../core/score'
import { noteName } from '../core/pitch'
import { majorScale } from '../core/theory'
import { useSettings } from '../state/settingsStore'

/**
 * Pagina di prova della Fase 1 (non in navigazione, rotta /sandbox).
 * Verifica l'integrazione <Staff> + audio.ts. Verrà rimossa in Fase 7.
 */
export default function Sandbox() {
  const showEnglish = useSettings((s) => s.showEnglishNotation)
  const scale = useMemo(() => majorScale(0, 4), [])
  const elements = useMemo(() => scale.map((p) => createNote([p], dur('quarter'))), [scale])
  const [active, setActive] = useState<number | undefined>(undefined)
  const [playing, setPlaying] = useState(false)

  const play = async () => {
    setPlaying(true)
    await playSequence(elements, {
      bpm: 96,
      onNote: (i) => setActive(i),
      onEnd: () => {
        setActive(undefined)
        setPlaying(false)
      },
    })
  }

  const stop = () => {
    stopPlayback()
    setPlaying(false)
    setActive(undefined)
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Sandbox — pentagramma + audio</h1>
        <p className="text-muted">
          Prova della Fase 1: clicca una nota per ascoltarla, oppure riproduci la scala di Do
          maggiore con il cursore.
        </p>
      </header>

      <Staff
        clef="treble"
        timeSignature={{ beats: 4, beatType: 4 }}
        elements={elements}
        highlightIndex={active}
        onNoteClick={(i) => {
          setActive(i)
          void playPitch(scale[i])
        }}
        noteLabel={(i) => `Ascolta ${noteName(scale[i], { showEnglish })}`}
        height={170}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={play}
          disabled={playing}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Riproduci scala
        </button>
        <button
          type="button"
          onClick={stop}
          disabled={!playing}
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-canvas disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      <p className="text-sm text-muted">
        Note:{' '}
        {scale.map((p) => noteName(p, { showEnglish })).join(' · ')}
      </p>
    </section>
  )
}
