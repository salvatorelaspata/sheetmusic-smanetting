import type { Accidental, ClefType, DurationBase, NoteElement, Score } from './model'
import { durationTicks } from './durations'
import { expectedTicks } from './validation'

/**
 * Serializzatore MusicXML (score-partwise) dal nostro modello. Scelta a basso
 * costo perché possediamo già lo Score; usa divisions = 480 (= PPQ), così la
 * durata MusicXML coincide con i nostri ticks.
 */

const DIVISIONS = 480

const TYPE_NAMES: Record<DurationBase, string> = {
  whole: 'whole',
  half: 'half',
  quarter: 'quarter',
  eighth: 'eighth',
  '16th': '16th',
  '32nd': '32nd',
}

const ALTER: Record<Accidental, number> = {
  natural: 0,
  sharp: 1,
  flat: -1,
  'double-sharp': 2,
  'double-flat': -2,
}

const ACCIDENTAL_NAME: Record<Accidental, string> = {
  natural: 'natural',
  sharp: 'sharp',
  flat: 'flat',
  'double-sharp': 'double-sharp',
  'double-flat': 'flat-flat',
}

function escapeXml(s: string): string {
  return s.replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string,
  )
}

function clefXml(clef: ClefType): string {
  return clef === 'bass'
    ? '<clef><sign>F</sign><line>4</line></clef>'
    : '<clef><sign>G</sign><line>2</line></clef>'
}

function noteXml(el: NoteElement): string {
  const duration = durationTicks(el.duration)
  const type = TYPE_NAMES[el.duration.base]
  const dots = '<dot/>'.repeat(el.duration.dots)

  if (el.kind === 'rest' || el.pitches.length === 0) {
    return `<note><rest/><duration>${duration}</duration><type>${type}</type>${dots}</note>`
  }

  return el.pitches
    .map((p, idx) => {
      const chord = idx > 0 ? '<chord/>' : ''
      const alter =
        p.accidental && ALTER[p.accidental] !== 0 ? `<alter>${ALTER[p.accidental]}</alter>` : ''
      const acc = p.accidental ? `<accidental>${ACCIDENTAL_NAME[p.accidental]}</accidental>` : ''
      return `<note>${chord}<pitch><step>${p.step}</step>${alter}<octave>${p.octave}</octave></pitch><duration>${duration}</duration><type>${type}</type>${dots}${acc}</note>`
    })
    .join('')
}

export function toMusicXML(score: Score): string {
  const measuresXml = score.measures
    .map((m, i) => {
      const attrs =
        i === 0
          ? `<attributes><divisions>${DIVISIONS}</divisions><key><fifths>${score.keySignature.fifths}</fifths><mode>major</mode></key><time><beats>${score.timeSignature.beats}</beats><beat-type>${score.timeSignature.beatType}</beat-type></time>${clefXml(score.clef)}</attributes>`
          : ''
      const elements = m.voices[0]?.elements ?? []
      const body =
        elements.length > 0
          ? elements.map(noteXml).join('')
          : `<note><rest measure="yes"/><duration>${expectedTicks(score.timeSignature)}</duration></note>`
      return `  <measure number="${i + 1}">${attrs}${body}</measure>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work><work-title>${escapeXml(score.title)}</work-title></work>
  <identification><encoding><software>SManetting</software></encoding></identification>
  <part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list>
  <part id="P1">
${measuresXml}
  </part>
</score-partwise>
`
}
