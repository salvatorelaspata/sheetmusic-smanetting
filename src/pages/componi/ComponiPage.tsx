import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { toast } from '../../components/ui/toastStore'
import { SongSettings } from './SongSettings'
import { NotePalette } from './NotePalette'
import { ScoreEditor } from './ScoreEditor'
import { useScoreHistory } from './useScoreHistory'
import { DEFAULT_TOOL, type Tool } from './tool'
import type { ClefType, KeySignature, NoteElement, Score, TimeSignature } from '../../core/model'
import { createScore } from '../../core/score'
import { PALETTE_DURATIONS } from '../../core/durations'
import {
  addMeasure,
  allElementIds,
  appendElements,
  cloneElements,
  deleteElement,
  deleteElements,
  insertElement,
  removeMeasure,
  setClef,
  setKeySignature,
  setTempo,
  setTimeSignature,
  setTitle,
  transposeElements,
} from '../../core/scoreEdit'
import { toMusicXML } from '../../core/musicxml'
import { pausePlayback, playSequence, resumePlayback, stopPlayback } from '../../audio/audio'
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

  const [initialScore] = useState<Score>(() => {
    const id = searchParams.get('id')
    if (id) {
      const found = useCompositions.getState().get(id)
      if (found) return found
    }
    return createScore({ title: t('componi.untitled') })
  })
  const history = useScoreHistory(initialScore)
  const score = history.score

  const [tool, setTool] = useState<Tool>(DEFAULT_TOOL)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [playState, setPlayState] = useState<PlayState>('stopped')
  const [playingIndex, setPlayingIndex] = useState<number | undefined>(undefined)
  const [openModal, setOpenModal] = useState(false)
  const clipboard = useRef<NoteElement[]>([])

  const stopIfPlaying = () => {
    if (playState !== 'stopped') {
      stopPlayback()
      setPlayState('stopped')
      setPlayingIndex(undefined)
    }
  }
  const edit = (next: Score) => {
    stopIfPlaying()
    history.set(next)
  }

  const selectedElements = (): NoteElement[] =>
    score.measures.flatMap((m) => (m.voices[0]?.elements ?? []).filter((e) => selected.has(e.id)))

  // La selezione resta valida dopo modifiche/undo/redo.
  useEffect(() => {
    setSelected((prev) => {
      if (prev.size === 0) return prev
      const valid = allElementIds(score)
      const next = new Set<string>()
      let changed = false
      prev.forEach((id) => (valid.has(id) ? next.add(id) : (changed = true)))
      return changed ? next : prev
    })
  }, [score])

  // Scorciatoie da tastiera.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()

      if (mod && key === 'z' && !e.shiftKey) return (e.preventDefault(), history.undo())
      if ((mod && key === 'y') || (mod && e.shiftKey && key === 'z'))
        return (e.preventDefault(), history.redo())
      if (mod && key === 'c') return void (clipboard.current = cloneElements(selectedElements()))
      if (mod && key === 'v') {
        if (clipboard.current.length)
          edit(appendElements(score, score.measures.length - 1, cloneElements(clipboard.current)))
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selected.size) {
          e.preventDefault()
          edit(deleteElements(score, selected))
          setSelected(new Set())
        }
        return
      }
      if (e.key === 'Escape') return setSelected(new Set())
      if (e.key === 'ArrowUp' && selected.size)
        return (e.preventDefault(), edit(transposeElements(score, selected, 1)))
      if (e.key === 'ArrowDown' && selected.size)
        return (e.preventDefault(), edit(transposeElements(score, selected, -1)))

      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 1 && n <= PALETTE_DURATIONS.length) {
        setTool((tl) => ({
          ...tl,
          duration: PALETTE_DURATIONS[n - 1].base,
          mode: tl.mode === 'select' || tl.mode === 'erase' ? 'note' : tl.mode,
        }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, selected])

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
    const blob = new Blob([toMusicXML(score)], {
      type: 'application/vnd.recordare.musicxml+xml',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sanitizeFilename(score.title)}.musicxml`
    a.click()
    URL.revokeObjectURL(url)
  }
  const handleNew = () => {
    stopIfPlaying()
    setSelected(new Set())
    history.reset(createScore({ title: t('componi.untitled') }))
  }
  const handleLoad = (s: Score) => {
    stopIfPlaying()
    setSelected(new Set())
    history.reset(s)
    setOpenModal(false)
  }

  const recent = [...items].sort((a, b) => b.updatedAt - a.updatedAt)
  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'it-IT', {
      day: '2-digit',
      month: 'short',
    })

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{t('componi.title')}</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={history.undo}
            disabled={!history.canUndo}
            title={t('componi.undo')}
            aria-label={t('componi.undo')}
          >
            ↶
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={history.redo}
            disabled={!history.canRedo}
            title={t('componi.redo')}
            aria-label={t('componi.redo')}
          >
            ↷
          </Button>
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

      <div className="flex flex-wrap items-center gap-2">
        {playState === 'playing' ? (
          <Button size="sm" onClick={() => (pausePlayback(), setPlayState('paused'))}>
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
        {selected.size > 0 && (
          <span className="text-sm text-brand">{t('componi.selectedCount', { n: selected.size })}</span>
        )}
        <span className="ml-auto text-sm text-muted">
          {t('componi.measures', { n: score.measures.length })}
        </span>
      </div>

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

      <p className="text-sm text-muted">
        {tool.mode === 'select' ? t('componi.hintSelect') : t('componi.hint')}
      </p>

      <div className="print-area">
        <h2 className="mb-2 hidden text-center text-lg font-semibold print:block">{score.title}</h2>
        <ScoreEditor
          score={score}
          tool={tool}
          selectedIds={selected}
          highlightGlobalIndex={playingIndex}
          onInsert={(mi, pos, el) => edit(insertElement(score, mi, pos, el))}
          onErase={(mi, id) => edit(deleteElement(score, mi, id))}
          onSelect={(id, additive) =>
            setSelected((prev) => {
              if (!additive) return new Set([id])
              const next = new Set(prev)
              next.has(id) ? next.delete(id) : next.add(id)
              return next
            })
          }
          onClearSelection={() => setSelected(new Set())}
          onTranspose={(delta) => edit(transposeElements(score, selected, delta))}
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
