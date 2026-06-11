import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { buttonClasses } from '../../components/ui/styles'
import { StaffExampleView } from '../../components/music/StaffExampleView'
import { QuizRunner, type QuizResult } from '../../components/quiz/QuizRunner'
import { getLesson, type ContentBlock } from '../../data/lezioni'
import { ALL_LESSONS, isLessonUnlocked, lessonById, lessonOrder, MODULES } from '../../data/moduli'
import { useProgress } from '../../state/progressStore'
import { toast } from '../../components/ui/toastStore'

function Block({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case 'heading':
      return <h2 className="text-xl font-semibold tracking-tight">{block.text}</h2>
    case 'text':
      return <p className="leading-relaxed text-ink/90">{block.text}</p>
    case 'callout':
      return (
        <div className="rounded-lg border-l-4 border-brand bg-brand/5 px-4 py-3 text-sm">
          {block.text}
        </div>
      )
    case 'list':
      return (
        <ul className="list-disc space-y-1 pl-5 text-ink/90">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )
    case 'staff':
      return <StaffExampleView example={block.example} />
    default:
      return null
  }
}

export default function Lezione() {
  const { t } = useTranslation()
  const { lessonId = '' } = useParams()
  const lessons = useProgress((s) => s.lessons)
  const recordQuiz = useProgress((s) => s.recordQuiz)

  const [phase, setPhase] = useState<'reading' | 'quiz' | 'result'>('reading')
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ correct: number; total: number; passed: boolean } | null>(
    null,
  )

  // Reset quando si cambia lezione (la rotta riusa lo stesso componente).
  useEffect(() => {
    setPhase('reading')
    setResult(null)
    setAttempt(0)
  }, [lessonId])

  const meta = lessonById(lessonId)
  const content = getLesson(lessonId)

  if (!meta || !content) {
    return (
      <div className="space-y-4">
        <p className="text-muted">{t('teoria.lessonNotFound')}</p>
        <Link to="/teoria" className={buttonClasses('primary')}>
          {t('teoria.backToTheory')}
        </Link>
      </div>
    )
  }

  const completedIds = new Set(
    Object.entries(lessons)
      .filter(([, v]) => v.completed)
      .map(([k]) => k),
  )

  if (!isLessonUnlocked(lessonId, completedIds)) {
    return (
      <div className="space-y-4">
        <p className="text-muted">{t('teoria.lockedLesson')}</p>
        <Link to="/teoria" className={buttonClasses('primary')}>
          {t('teoria.backToTheory')}
        </Link>
      </div>
    )
  }

  const module = MODULES.find((m) => m.lessons.some((l) => l.id === lessonId))
  const nextLesson = ALL_LESSONS[lessonOrder(lessonId) + 1]

  const handleComplete = (res: QuizResult) => {
    const passed = recordQuiz(lessonId, res.scorePct)
    setResult({ correct: res.correct, total: res.total, passed })
    setPhase('result')
    if (passed) toast.success(t('teoria.passed'))
  }

  return (
    <article className="space-y-8">
      <header>
        <Link to="/teoria" className="text-sm text-muted transition-colors hover:text-ink">
          ← {t('teoria.backToTheory')}
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
          {t('teoria.module')} {module?.index}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{meta.title}</h1>
      </header>

      {phase === 'reading' && (
        <>
          <div className="space-y-5">
            {content.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
          <Card>
            <p className="text-sm">{t('teoria.readingDone')}</p>
            <Button
              className="mt-3"
              onClick={() => {
                setAttempt((a) => a + 1)
                setPhase('quiz')
              }}
            >
              {t('teoria.startQuiz')}
            </Button>
          </Card>
        </>
      )}

      {phase === 'quiz' && (
        <Card title={t('teoria.quizTitle')}>
          <QuizRunner key={attempt} questions={content.quiz} onComplete={handleComplete} />
        </Card>
      )}

      {phase === 'result' && result && (
        <Card>
          <div className="space-y-4 text-center">
            <p className="text-4xl font-bold tabular-nums">
              {Math.round((result.correct / result.total) * 100)}%
            </p>
            <p className="text-muted">
              {t('teoria.score', { correct: result.correct, total: result.total })}
            </p>
            {result.passed ? (
              <>
                <p className="font-medium text-success">{t('teoria.passed')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {nextLesson && (
                    <Link
                      to={`/teoria/${nextLesson.id}`}
                      className={buttonClasses('primary')}
                    >
                      {t('teoria.nextLesson')}
                    </Link>
                  )}
                  <Link to="/teoria" className={buttonClasses('secondary')}>
                    {t('teoria.backToTheory')}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="font-medium text-danger">{t('teoria.failed')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    onClick={() => {
                      setResult(null)
                      setAttempt((a) => a + 1)
                      setPhase('quiz')
                    }}
                  >
                    {t('teoria.retry')}
                  </Button>
                  <Link to="/teoria" className={buttonClasses('secondary')}>
                    {t('teoria.backToTheory')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </article>
  )
}
