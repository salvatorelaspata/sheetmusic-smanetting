import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Staff } from '../../components/music/Staff'
import { NoteNameButtons } from '../../components/music/NoteNameButtons'
import { Button } from '../../components/ui/Button'
import { buttonClasses } from '../../components/ui/styles'
import { playPitch } from '../../audio/audio'
import { noteName, STEP_NAMES_IT } from '../../core/pitch'
import { PALETTE_DURATIONS } from '../../core/durations'
import { createNote, dur } from '../../core/score'
import { randomItem } from '../../core/random'
import type { DisplayClef, DurationBase, Pitch, Step } from '../../core/model'
import { useSettings } from '../../state/settingsStore'
import { useGames } from '../../state/gamesStore'
import {
  CLEF_LABEL,
  CLEF_POOLS,
  GAME_DURATIONS,
  GAME_LIVES,
  RICONOSCI_GAME_LEVELS,
  type Difficulty,
  type RiconosciGameLevel,
} from '../../data/giochi'

const GAME_ID = 'riconosci-nota'

interface Question {
  clef: DisplayClef
  pitch: Pitch
  durationBase: DurationBase
}

function makeQuestion(level: RiconosciGameLevel): Question {
  const clef = randomItem(level.clefs)
  const pitch = randomItem(CLEF_POOLS[clef])
  const durationBase: DurationBase = level.askDuration ? randomItem(GAME_DURATIONS) : 'whole'
  return { clef, pitch, durationBase }
}

function durationLabel(base: DurationBase, lang: string): string {
  const d = PALETTE_DURATIONS.find((x) => x.base === base)
  return d ? (lang === 'en' ? d.en : d.it) : base
}

interface Reveal {
  ok: boolean
  gotStep: Step
  gotBase?: DurationBase
}

export default function RiconosciNotaGame() {
  const { t, i18n } = useTranslation()
  const showEnglish = useSettings((s) => s.showEnglishNotation)
  const recordGame = useGames((s) => s.recordGame)
  const results = useGames((s) => s.results)

  const [difficulty, setDifficulty] = useState<Difficulty>('facile')
  const level = RICONOSCI_GAME_LEVELS.find((l) => l.id === difficulty)!

  const [question, setQuestion] = useState<Question>(() => makeQuestion(RICONOSCI_GAME_LEVELS[0]))
  const [selectedStep, setSelectedStep] = useState<Step | null>(null)
  const [reveal, setReveal] = useState<Reveal | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [lives, setLives] = useState(GAME_LIVES)
  const [phase, setPhase] = useState<'playing' | 'over'>('playing')
  const [isRecord, setIsRecord] = useState(false)

  const bestScore = results[`${GAME_ID}:${difficulty}`]?.bestScore ?? 0

  const elements = useMemo(
    () => [createNote([question.pitch], dur(question.durationBase))],
    [question],
  )

  const startNext = () => {
    setReveal(null)
    setSelectedStep(null)
    setQuestion(makeQuestion(level))
  }
  const startNextRef = useRef(startNext)
  startNextRef.current = startNext

  // Avanzamento automatico dopo una risposta corretta.
  useEffect(() => {
    if (phase !== 'playing' || !reveal || !reveal.ok) return
    const id = window.setTimeout(() => startNextRef.current(), 750)
    return () => window.clearTimeout(id)
  }, [reveal, phase])

  // Invio/Spazio per continuare dopo un errore.
  useEffect(() => {
    if (phase !== 'playing' || !reveal || reveal.ok) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        startNextRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reveal, phase])

  const evaluate = (step: Step, base?: DurationBase) => {
    const nameOk = step === question.pitch.step
    const durOk = !level.askDuration || base === question.durationBase
    const ok = nameOk && durOk
    setReveal({ ok, gotStep: step, gotBase: base })
    void playPitch(question.pitch)
    if (ok) {
      setScore((s) => s + 1)
      setStreak((s) => {
        const ns = s + 1
        setBestStreak((b) => Math.max(b, ns))
        return ns
      })
    } else {
      setStreak(0)
      const remaining = lives - 1
      setLives(remaining)
      if (remaining <= 0) {
        const prevBest = results[`${GAME_ID}:${difficulty}`]?.bestScore ?? 0
        recordGame(GAME_ID, difficulty, { score, bestStreak })
        setIsRecord(score > prevBest && score > 0)
        setPhase('over')
      }
    }
  }

  const handleStep = (step: Step) => {
    if (reveal) return
    if (level.askDuration) setSelectedStep(step)
    else evaluate(step)
  }

  const handleDuration = (base: DurationBase) => {
    if (reveal || !selectedStep) return
    evaluate(selectedStep, base)
  }

  const changeDifficulty = (d: Difficulty) => {
    const lv = RICONOSCI_GAME_LEVELS.find((l) => l.id === d)!
    setDifficulty(d)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    setLives(GAME_LIVES)
    setPhase('playing')
    setReveal(null)
    setSelectedStep(null)
    setIsRecord(false)
    setQuestion(makeQuestion(lv))
  }

  const Header = (
    <header className="space-y-2">
      <Link to="/gioco" className="text-sm text-muted transition-colors hover:text-ink">
        ← {t('gioco.back')}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{t('gioco.riconosciNota.title')}</h1>
    </header>
  )

  if (phase === 'over') {
    return (
      <div className="space-y-6">
        {Header}
        <div className="rounded-xl border border-border bg-surface p-6 text-center">
          <p className="text-sm uppercase tracking-wide text-muted">{t('gioco.gameOver')}</p>
          <p className="mt-2 text-5xl font-bold tabular-nums">{score}</p>
          <p className="mt-1 text-muted">{t('gioco.points')}</p>
          {isRecord && <p className="mt-3 font-semibold text-success">{t('gioco.newRecord')}</p>}
          <p className="mt-3 text-sm text-muted">{t('gioco.bestStreakLine', { n: bestStreak })}</p>
          <p className="text-sm text-muted">
            {t('gioco.recordLine', { n: Math.max(bestScore, score) })}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={() => changeDifficulty(difficulty)}>{t('gioco.playAgain')}</Button>
            <Link to="/gioco" className={buttonClasses('secondary')}>
              {t('gioco.backToGames')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const correctAnswer =
    `${noteName(question.pitch, { lang: i18n.language, alternate: showEnglish })}` +
    `${level.askDuration ? ` · ${durationLabel(question.durationBase, i18n.language)}` : ''}` +
    ` · ${i18n.language === 'en' ? CLEF_LABEL[question.clef].en : CLEF_LABEL[question.clef].it}`

  const prompt = !level.askDuration
    ? t('gioco.riconosciNota.askNote')
    : !selectedStep
      ? t('gioco.riconosciNota.askNoteFirst')
      : t('gioco.riconosciNota.askDurationNow', { note: STEP_NAMES_IT[selectedStep] })

  return (
    <div className="space-y-6">
      {Header}

      {/* Difficoltà */}
      <div className="flex flex-wrap items-center gap-2">
        {RICONOSCI_GAME_LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => changeDifficulty(l.id)}
            title={t(`gioco.difficulty.${l.id}Hint`)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              l.id === difficulty
                ? 'bg-brand text-brand-fg'
                : 'border border-border bg-surface text-muted hover:bg-canvas'
            }`}
          >
            {t(`gioco.difficulty.${l.id}`)}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted">{t(`gioco.difficulty.${difficulty}Hint`)}</span>
      </div>

      {/* HUD */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span>
          <span className="font-semibold tabular-nums">{score}</span>{' '}
          <span className="text-muted">{t('gioco.points')}</span>
        </span>
        <span className="font-semibold tabular-nums" aria-label={t('gioco.streak')}>
          🔥 {streak}
        </span>
        <span aria-label={t('gioco.livesLeft', { n: lives })}>
          <span className="text-danger">{'♥'.repeat(lives)}</span>
          <span className="text-muted">{'♥'.repeat(GAME_LIVES - lives)}</span>
        </span>
        <span className="ml-auto text-muted">
          {t('gioco.recordLine', { n: Math.max(bestScore, score) })}
        </span>
      </div>

      <Staff clef={question.clef} elements={elements} height={180} />

      <p className="text-center text-sm font-medium">{prompt}</p>

      {/* Feedback */}
      <div className="min-h-6 text-center text-sm font-medium" aria-live="polite">
        {reveal && (
          <span className={reveal.ok ? 'text-success' : 'text-danger'}>
            {reveal.ok ? t('gioco.correct') : t('gioco.wrongWas', { answer: correctAnswer })}
          </span>
        )}
      </div>

      {/* Nome della nota */}
      <NoteNameButtons
        onPress={handleStep}
        disabled={!!reveal}
        selectedStep={!reveal && level.askDuration ? (selectedStep ?? undefined) : undefined}
        highlightStep={reveal ? question.pitch.step : undefined}
        wrongStep={
          reveal && !reveal.ok && reveal.gotStep !== question.pitch.step ? reveal.gotStep : undefined
        }
      />

      {/* Durata (solo livello difficile) */}
      {level.askDuration && (selectedStep || reveal) && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {GAME_DURATIONS.map((base) => {
            const isCorrect = reveal && question.durationBase === base
            const isWrong =
              reveal && !reveal.ok && reveal.gotBase === base && reveal.gotBase !== question.durationBase
            const color = isCorrect
              ? 'border-success bg-success/15 text-success'
              : isWrong
                ? 'border-danger bg-danger/15 text-danger'
                : 'border-border bg-surface hover:border-brand hover:bg-canvas'
            return (
              <button
                key={base}
                type="button"
                disabled={!!reveal}
                onClick={() => handleDuration(base)}
                className={`rounded-md border py-3 text-sm font-semibold transition-colors disabled:cursor-default ${color}`}
              >
                {durationLabel(base, i18n.language)}
              </button>
            )
          })}
        </div>
      )}

      {/* Continua dopo un errore */}
      {reveal && !reveal.ok && (
        <div className="flex justify-center">
          <Button onClick={startNext}>{t('gioco.continue')}</Button>
        </div>
      )}
    </div>
  )
}
