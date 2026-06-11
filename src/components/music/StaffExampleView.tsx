import { Staff } from './Staff'
import { playPitch } from '../../audio/audio'
import { noteName } from '../../core/pitch'
import { useSettings } from '../../state/settingsStore'
import type { StaffExample } from '../../data/lezioni'

/**
 * Renderizza un esempio musicale (StaffExample) con <Staff>, collegando il click
 * sulle note all'audio quando l'esempio è "playable". Riutilizzato da lezioni e quiz.
 */
export function StaffExampleView({ example, height }: { example: StaffExample; height?: number }) {
  const showEnglish = useSettings((s) => s.showEnglishNotation)
  return (
    <figure className="space-y-2">
      <Staff
        clef={example.clef}
        timeSignature={example.timeSignature}
        keySignature={example.keySignature}
        elements={example.elements}
        height={height}
        onNoteClick={
          example.playable
            ? (i) => {
                const pitch = example.elements[i]?.pitches[0]
                if (pitch) void playPitch(pitch)
              }
            : undefined
        }
        noteLabel={(i) => {
          const pitch = example.elements[i]?.pitches[0]
          return pitch ? `Ascolta ${noteName(pitch, { showEnglish })}` : 'Nota'
        }}
      />
      {example.caption && (
        <figcaption className="text-center text-sm text-muted">{example.caption}</figcaption>
      )}
    </figure>
  )
}
