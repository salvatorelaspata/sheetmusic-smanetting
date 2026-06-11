import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../components/ui/toastStore'
import { SongSettings } from './SongSettings'
import { NotePalette } from './NotePalette'
import { ScoreEditor } from './ScoreEditor'
import { DEFAULT_TOOL, type Tool } from './tool'
import type { ClefType, KeySignature, NoteElement, Score, TimeSignature } from '../../core/model'
import { createScore } from '../../core/score'
import {
  addMeasure,
  appendElement,
  deleteElement,
  removeMeasure,
  setClef,
  setKeySignature,
  setTempo,
  setTimeSignature,
  setTitle,
} from '../../core/scoreEdit'
import { toMusicXML } from '../../core/musicxml'
import {
  pausePlayback,
  playSequence,
  resumePlayback,
  stopPlayback,
} from '../../audio/audio'
import { useCompositions } from '../../state/compositionsStore'

type PlayState = 'stopped' | 'playing' | 'paused'

function sanitizeFilename(name: string): string {
  return name.replace(/[^\p{L}\p{N}\-_ ]/gu, '').trim() || 'spartito'
}

export default function ComponiPage() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()

  const items = useCompositions((s) => s.items)
  const saveComp = useCompositions((s) => s.save)
  const removeComp = useCompositions((s) => s.remove)

  const [score, setScore] = useState<Score>(() => {
    const id = searchParams.get('id')
    if (id) {
      const found = useCompositions.getState().get(id)
      if (found) return found
    }
    return createScore({ title: t('componi.untitled') })
  })

  const [tool, setTool] = useState<Tool>(DEFAULT_TOOL)
  const [playState, setPlayState] = useState<PlayState>('stopped')
  const [playingIndex, setPlayingIndex] = useState<number | undefined>(undefined)
  const [openModal, setOpenModal] = useState(false)

  const stopIfPlaying = () => {
    if (playState !== 'stopped') {
      stopPlayback()
      setPlayState('stopped')
      setPlayingIndex(undefined)
    }
  }

  const edit = (next: Score) => {
    stopIfPlaying()
    setScore(next)
  }

  // --- Playback ---
  const handlePlay = async () => {
    if (playState === 'paused') {
      resumePlayback()
      setPlayState('playing')
      return
    }
    const flat = score.measures.flatMap((m) => m.voices[0]?.elements ?? [])
    if (flat.length === 0) return
    setPlayState('playing')
    await playSequence(flat, {
      bpm: score.tempoBpm,
      onNote: (i) => setPlayingIndex(i),
      onEnd: () => {
        setPlayState('stopped')
        setPlayingIndex(undefined)
      },
    })
  }
  const handlePause = () => {
    pausePlayback()
    setPlayState('paused')
  }
  const handleStop = () => {
    stopPlayback()
    setPlayState('stopped')
    setPlayingIndex(undefined)
  }

  // --- File ---
  const handleSave = () => {
    saveComp(score)
    toast.success(t('componi.saved'))
  }
  const handleExport = () => {
    const xml = toMusicXML(score)
    const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sanitizeFilename(score.title)}.musicxml`
    a.click()
    URL.revokeObjectURL(url)
  }
  const handleNew = () => edit(createScore({ title: t('componi.untitled') }))
  const handleLoad = (s: Score) => {
    stopIfPlaying()
    setScore(s)
    setOpenModal(false)
  }

  const recent = [...items].sort((a, b) => b.updatedAt - a.updatedAt)
  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'it-IT', {
      day: '2-digit',
      month: 'short',
    })

  const onInsert = (measureIndex: number, element: NoteElement) =>
    edit(appendElement(score, measureIndex, element))
  const onErase = (measureIndex: number, elementId: string) =>
    edit(deleteElement(score, measureIndex, elementId))

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{t('componi.title')}</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleNew}>
            {t('componi.new')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setOpenModal(true)}>
            {t('componi.open')}
          </Button>
          <Button size="sm" onClick={handleSave}>
            {t('componi.save')}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            {t('componi.export')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            {t('componi.print')}
          </Button>
        </div>
      </header>

      <SongSettings
        score={score}
        onTitle={(v) => edit(setTitle(score, v))}
        onClef={(c: ClefType) => edit(setClef(score, c))}
        onTime={(ts: TimeSignature) => edit(setTimeSignature(score, ts))}
        onKey={(k: KeySignature) => edit(setKeySignature(score, k))}
        onTempo={(bpm) => edit(setTempo(score, bpm))}
      />

      <NotePalette tool={tool} onChange={setTool} />

      {/* Controlli playback + battute */}
      <div className="flex flex-wrap items-center gap-2">
        {playState === 'playing' ? (
          <Button size="sm" onClick={handlePause}>
            ⏸ {t('componi.pause')}
          </Button>
        ) : (
          <Button size="sm" onClick={handlePlay}>
            ▶ {t('componi.play')}
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={handleStop}>
          ⏹ {t('componi.stop')}
        </Button>
        <span className="mx-1 h-6 w-px bg-border" />
        <Button variant="secondary" size="sm" onClick={() => edit(addMeasure(score))}>
          + {t('componi.addMeasure')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => edit(removeMeasure(score, score.measures.length - 1))}
          disabled={score.measures.length <= 1}
        >
          − {t('componi.removeMeasure')}
        </Button>
        <span className="ml-auto text-sm text-muted">
          {t('componi.measures', { n: score.measures.length })}
        </span>
      </div>

      {/* Legenda validazione */}
      <div className="flex flex-wrap gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success" /> {t('componi.legendComplete')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> {t('componi.legendIncomplete')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-danger" /> {t('componi.legendOverfull')}
        </span>
      </div>

      <p className="text-sm text-muted">{t('componi.hint')}</p>

      <div className="print-area">
        <h2 className="mb-2 hidden text-center text-lg font-semibold print:block">{score.title}</h2>
        <ScoreEditor
          score={score}
          tool={tool}
          highlightGlobalIndex={playingIndex}
          onInsert={onInsert}
          onErase={onErase}
        />
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={t('componi.openTitle')}>
        {recent.length === 0 ? (
          <p className="text-sm text-muted">{t('componi.noSaved')}</p>
        ) : (
          <ul className="max-h-80 divide-y divide-border overflow-auto">
            {recent.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="text-xs text-muted">
                    {fmtDate(c.updatedAt)} · {t('componi.measures', { n: c.measures.length })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" onClick={() => handleLoad(c)}>
                    {t('componi.load')}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => removeComp(c.id)}>
                    {t('componi.delete')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}
