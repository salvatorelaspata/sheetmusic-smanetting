import type {
  Accidental,
  ClefType,
  DurationBase,
  Dots,
  KeySignature,
  NoteElement,
  Pitch,
  Step,
  TimeSignature,
} from '../core/model'
import { createNote, createRest, dur } from '../core/score'
import { STEP_NAMES_IT, STEPS } from '../core/pitch'
import { majorScale } from '../core/theory'

/**
 * CONTENUTO delle lezioni di Teoria, BILINGUE (italiano-first + inglese). Ogni
 * stringa è una coppia L={it,en}; il motore lezione/quiz risolve con loc() in
 * base alla lingua. I metadati/indice stanno in data/moduli.ts.
 */

export interface L {
  it: string
  en: string
}
const t2 = (it: string, en: string): L => ({ it, en })
const same = (x: string): L => ({ it: x, en: x })
export function loc(l: L, lang: string): string {
  return lang === 'en' ? l.en : l.it
}

export interface StaffExample {
  clef: ClefType
  timeSignature?: TimeSignature
  keySignature?: KeySignature
  elements: NoteElement[]
  playable?: boolean
  caption?: L
}

export interface QuizQuestion {
  prompt: L
  staff?: StaffExample
  options: L[]
  correctIndex: number
  explanation?: L
}

export type ContentBlock =
  | { kind: 'text'; text: L }
  | { kind: 'heading'; text: L }
  | { kind: 'callout'; text: L }
  | { kind: 'list'; items: L[] }
  | { kind: 'staff'; example: StaffExample }

export interface Lesson {
  id: string
  blocks: ContentBlock[]
  quiz: QuizQuestion[]
}

// ---- Helper compatti ------------------------------------------------------

const p = (step: Step, octave: number, accidental?: Accidental): Pitch => ({ step, octave, accidental })
const n = (
  pitch: Pitch,
  base: DurationBase = 'quarter',
  dots: Dots = 0,
  extra?: Partial<Omit<NoteElement, 'id' | 'kind' | 'pitches' | 'duration'>>,
): NoteElement => createNote([pitch], dur(base, dots), extra)
const chord = (pitches: Pitch[], base: DurationBase = 'half'): NoteElement => createNote(pitches, dur(base))
const r = (base: DurationBase, dots: Dots = 0): NoteElement => createRest(dur(base, dots))

/** Domanda "che nota è questa?" (opzioni bilingui: Do…Si / C…B). */
function identify(pitch: Pitch, clef: ClefType = 'treble'): QuizQuestion {
  return {
    prompt: t2('Che nota è questa?', 'Which note is this?'),
    staff: { clef, elements: [n(pitch, 'whole')], playable: true },
    options: STEPS.map((s) => t2(STEP_NAMES_IT[s], s)),
    correctIndex: STEPS.indexOf(pitch.step),
    explanation: t2(`È un ${STEP_NAMES_IT[pitch.step]}.`, `It's a ${pitch.step}.`),
  }
}

const VERO_FALSO: L[] = [t2('Vero', 'True'), t2('Falso', 'False')]

// ---------------------------------------------------------------------------

export const LESSONS: Record<string, Lesson> = {
  pentagramma: {
    id: 'pentagramma',
    blocks: [
      { kind: 'text', text: t2('Il pentagramma è formato da cinque righe e quattro spazi. Le note si scrivono sulle righe e negli spazi e si leggono dal basso verso l’alto: più una nota è in alto, più il suono è acuto.', 'The staff has five lines and four spaces. Notes sit on the lines and in the spaces and are read from bottom to top: the higher a note is, the higher its pitch.') },
      { kind: 'text', text: t2('All’inizio del pentagramma c’è la chiave, che dà il nome alle note. La chiave di violino (o di Sol) si usa per i suoni acuti; la chiave di basso (o di Fa) per i suoni gravi.', 'At the start of the staff is the clef, which gives the notes their names. The treble (or G) clef is used for higher sounds; the bass (or F) clef for lower sounds.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4), 'whole')], playable: true, caption: t2('Il Do centrale in chiave di violino', 'Middle C in the treble clef') } },
      { kind: 'staff', example: { clef: 'bass', elements: [n(p('C', 4), 'whole')], playable: true, caption: t2('Lo stesso Do centrale in chiave di basso', 'The same middle C in the bass clef') } },
      { kind: 'callout', text: t2('La stessa nota occupa posizioni diverse nelle due chiavi: per questo è importante guardare sempre la chiave all’inizio del rigo.', 'The same note sits in different positions in the two clefs: that’s why you should always check the clef at the start of the staff.') },
    ],
    quiz: [
      { prompt: t2('Quante righe ha il pentagramma?', 'How many lines does the staff have?'), options: [same('4'), same('5'), same('6'), same('7')], correctIndex: 1 },
      { prompt: t2('Come si legge il pentagramma?', 'How is the staff read?'), options: [t2('Dall’alto verso il basso', 'From top to bottom'), t2('Dal basso verso l’alto', 'From bottom to top')], correctIndex: 1, explanation: t2('Più in alto = più acuto.', 'Higher = higher pitch.') },
      { prompt: t2('La chiave di violino si chiama anche chiave di…', 'The treble clef is also called the … clef'), options: [t2('Sol', 'G'), t2('Fa', 'F'), t2('Do', 'C')], correctIndex: 0 },
      { prompt: t2('La chiave di basso si usa per i suoni gravi.', 'The bass clef is used for low sounds.'), options: VERO_FALSO, correctIndex: 0 },
    ],
  },

  'nomi-note': {
    id: 'nomi-note',
    blocks: [
      { kind: 'text', text: t2('Le note sono sette: Do, Re, Mi, Fa, Sol, La, Si. Dopo il Si si ricomincia da Do, una posizione più in alto: questa distanza si chiama ottava.', 'There are seven notes: in Italian Do, Re, Mi, Fa, Sol, La, Si — in English C, D, E, F, G, A, B. After B you start again from C, one position higher: this distance is called an octave.') },
      { kind: 'staff', example: { clef: 'treble', elements: majorScale(0, 4).map((pp) => n(pp)), playable: true, caption: t2('La scala di Do: Do Re Mi Fa Sol La Si Do (cliccala!)', 'The C scale: C D E F G A B C (click it!)') } },
      { kind: 'text', text: t2('Quando una nota è troppo acuta o troppo grave per stare sul pentagramma, si usano piccole righe aggiuntive chiamate tagli addizionali.', 'When a note is too high or too low for the staff, small extra lines called ledger lines are used.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4), 'whole')], playable: true, caption: t2('Il Do centrale: un taglio addizionale sotto il pentagramma di violino', 'Middle C: one ledger line below the treble staff') } },
    ],
    quiz: [
      { prompt: t2('Quante sono le note?', 'How many notes are there?'), options: [same('5'), same('7'), same('8')], correctIndex: 1 },
      identify(p('E', 4)),
      identify(p('G', 4)),
      { prompt: t2('Le righe aggiuntive per le note molto acute o gravi si chiamano…', 'The extra lines for very high or low notes are called…'), options: [t2('Stanghette', 'Barlines'), t2('Tagli addizionali', 'Ledger lines'), t2('Chiavi', 'Clefs')], correctIndex: 1 },
    ],
  },

  'valori-note': {
    id: 'valori-note',
    blocks: [
      { kind: 'text', text: t2('Ogni nota ha una durata. I valori principali, dal più lungo al più breve, sono: semibreve, minima, semiminima, croma e semicroma.', 'Every note has a duration. The main values, from longest to shortest, are: whole, half, quarter, eighth and sixteenth notes.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('B', 4), 'whole'), n(p('B', 4), 'half'), n(p('B', 4), 'quarter'), n(p('B', 4), 'eighth'), n(p('B', 4), '16th')], caption: t2('Semibreve, minima, semiminima, croma, semicroma', 'Whole, half, quarter, eighth, sixteenth') } },
      { kind: 'callout', text: t2('Ogni valore dura la metà di quello precedente: la minima vale due semiminime, la semiminima due crome, e così via.', 'Each value lasts half the previous one: a half note equals two quarters, a quarter equals two eighths, and so on.') },
    ],
    quiz: [
      { prompt: t2('In 4/4, quanti movimenti dura una semibreve?', 'In 4/4, how many beats does a whole note last?'), options: [same('1'), same('2'), same('4')], correctIndex: 2 },
      { prompt: t2('La minima vale quante semiminime?', 'A half note equals how many quarter notes?'), options: [same('1'), same('2'), same('4')], correctIndex: 1 },
      { prompt: t2('Quale valore dura di meno?', 'Which value is the shortest?'), options: [t2('Semiminima', 'Quarter'), t2('Croma', 'Eighth'), t2('Semicroma', 'Sixteenth')], correctIndex: 2 },
      { prompt: t2('Che valore è questo?', 'What value is this?'), staff: { clef: 'treble', elements: [n(p('B', 4), 'half')], playable: true }, options: [t2('Semibreve', 'Whole'), t2('Minima', 'Half'), t2('Semiminima', 'Quarter')], correctIndex: 1 },
    ],
  },

  pause: {
    id: 'pause',
    blocks: [
      { kind: 'text', text: t2('Anche il silenzio fa parte della musica. Le pause indicano per quanto tempo non si suona, e hanno gli stessi valori delle note.', 'Silence is part of music too. Rests show how long not to play, and they have the same values as notes.') },
      { kind: 'staff', example: { clef: 'treble', elements: [r('whole'), r('half'), r('quarter'), r('eighth')], caption: t2('Pausa di semibreve, di minima, di semiminima, di croma', 'Whole, half, quarter and eighth rests') } },
      { kind: 'callout', text: t2('La pausa di semibreve “pende” sotto la quarta riga; quella di minima “appoggia” sulla terza riga: un modo semplice per distinguerle.', 'The whole rest “hangs” under the fourth line; the half rest “sits” on the third line: an easy way to tell them apart.') },
    ],
    quiz: [
      { prompt: t2('La pausa indica…', 'A rest indicates…'), options: [t2('Un suono lungo', 'A long sound'), t2('Un silenzio', 'A silence'), t2('Una nota acuta', 'A high note')], correctIndex: 1 },
      { prompt: t2('La pausa di semiminima dura quanto…', 'A quarter rest lasts as long as…'), options: [t2('Una semiminima', 'A quarter note'), t2('Una minima', 'A half note'), t2('Una semibreve', 'A whole note')], correctIndex: 0 },
      { prompt: t2('Anche i silenzi hanno una durata precisa.', 'Silences have a precise duration too.'), options: VERO_FALSO, correctIndex: 0 },
    ],
  },

  'punto-legatura': {
    id: 'punto-legatura',
    blocks: [
      { kind: 'text', text: t2('Il punto di valore si mette a destra della nota e ne aumenta la durata della metà. Una minima (2 movimenti) col punto vale quindi 3 movimenti.', 'The augmentation dot is placed to the right of a note and increases its duration by half. A half note (2 beats) with a dot is therefore worth 3 beats.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('D', 5), 'half', 1)], playable: true, caption: t2('Minima col punto: vale 3 movimenti', 'Dotted half note: worth 3 beats') } },
      { kind: 'text', text: t2('La legatura di valore è una linea curva che unisce due note della stessa altezza: si suona una sola nota lunga, sommando le durate.', 'The tie is a curved line joining two notes of the same pitch: you play a single long note, adding the durations.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('E', 4), 'quarter', 0, { tie: 'start' }), n(p('E', 4), 'quarter', 0, { tie: 'stop' }), n(p('G', 4), 'half')], playable: true, caption: t2('Due Mi legati: una sola nota lunga (2 movimenti)', 'Two tied E’s: a single long note (2 beats)') } },
      { kind: 'callout', text: t2('Attenzione: la legatura di valore unisce note uguali e ne somma la durata. È diversa dalla legatura di portamento, che collega note di altezza diversa (legato).', 'Note: the tie joins identical notes and adds their durations. It differs from the slur, which connects notes of different pitch (legato).') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 5), 'quarter', 0, { slur: 'start' }), n(p('D', 5), 'quarter'), n(p('E', 5), 'quarter', 0, { slur: 'stop' }), r('quarter')], playable: true, caption: t2('Legatura di portamento (legato): note diverse collegate', 'Slur (legato): different notes connected') } },
    ],
    quiz: [
      { prompt: t2('Una minima col punto vale quanti movimenti?', 'How many beats is a dotted half note?'), options: [same('2'), same('3'), same('4')], correctIndex: 1 },
      { prompt: t2('Il punto di valore aggiunge alla nota…', 'The dot adds to the note…'), options: [t2('La metà del suo valore', 'Half its value'), t2('Il doppio', 'Double'), t2('Un quarto', 'A quarter')], correctIndex: 0 },
      { prompt: t2('La legatura di valore unisce due note…', 'The tie joins two notes…'), options: [t2('Di altezza diversa', 'Of different pitch'), t2('Della stessa altezza', 'Of the same pitch')], correctIndex: 1 },
    ],
  },

  'tempo-battuta': {
    id: 'tempo-battuta',
    blocks: [
      { kind: 'text', text: t2('Le stanghette verticali dividono il pentagramma in battute (o misure). L’indicazione di tempo, scritta come una frazione all’inizio, dice quanti movimenti ci sono in ogni battuta e quale valore vale un movimento.', 'Vertical barlines divide the staff into measures (bars). The time signature, written as a fraction at the start, tells how many beats are in each measure and which value gets one beat.') },
      { kind: 'staff', example: { clef: 'treble', timeSignature: { beats: 4, beatType: 4 }, elements: [n(p('C', 5)), n(p('C', 5)), n(p('C', 5)), n(p('C', 5))], caption: t2('4/4: quattro movimenti da una semiminima ciascuno', '4/4: four beats, each a quarter note') } },
      { kind: 'staff', example: { clef: 'treble', timeSignature: { beats: 3, beatType: 4 }, elements: [n(p('C', 5)), n(p('C', 5)), n(p('C', 5))], caption: t2('3/4: tre movimenti (il tempo di valzer)', '3/4: three beats (waltz time)') } },
      { kind: 'list', items: [t2('Il numero in alto: quanti movimenti per battuta', 'Top number: how many beats per measure'), t2('Il numero in basso: il valore di un movimento (4 = semiminima, 8 = croma)', 'Bottom number: the value of one beat (4 = quarter, 8 = eighth)')] },
    ],
    quiz: [
      { prompt: t2('In 3/4, quanti movimenti entrano in una battuta?', 'In 3/4, how many beats fit in a measure?'), options: [same('2'), same('3'), same('4')], correctIndex: 1 },
      { prompt: t2('Il numero in alto dell’indicazione di tempo indica…', 'The top number of the time signature indicates…'), options: [t2('Il valore di un movimento', 'The value of a beat'), t2('Quanti movimenti per battuta', 'How many beats per measure')], correctIndex: 1 },
      { prompt: t2('Che cosa separa due battute?', 'What separates two measures?'), options: [t2('La stanghetta', 'The barline'), t2('La chiave', 'The clef')], correctIndex: 0 },
      { prompt: t2('Quanti movimenti ha questa battuta?', 'How many beats does this measure have?'), staff: { clef: 'treble', timeSignature: { beats: 4, beatType: 4 }, elements: [n(p('G', 4)), n(p('G', 4)), n(p('G', 4)), n(p('G', 4))], playable: true }, options: [same('3'), same('4'), same('5')], correctIndex: 1 },
    ],
  },

  alterazioni: {
    id: 'alterazioni',
    blocks: [
      { kind: 'text', text: t2('Le alterazioni cambiano l’altezza di una nota di un semitono, la distanza più piccola tra due suoni.', 'Accidentals change a note’s pitch by a semitone, the smallest distance between two sounds.') },
      { kind: 'list', items: [t2('Diesis (♯): alza la nota di un semitono', 'Sharp (♯): raises the note by a semitone'), t2('Bemolle (♭): abbassa la nota di un semitono', 'Flat (♭): lowers the note by a semitone'), t2('Bequadro (♮): annulla un’alterazione precedente', 'Natural (♮): cancels a previous accidental')] },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 5)), n(p('C', 5, 'sharp')), n(p('C', 5, 'natural'))], playable: true, caption: t2('Do, Do diesis, Do bequadro', 'C, C sharp, C natural') } },
      { kind: 'callout', text: t2('Un’alterazione vale per tutta la battuta in cui compare, finché non interviene un bequadro o la stanghetta successiva.', 'An accidental applies for the whole measure where it appears, until a natural or the next barline.') },
    ],
    quiz: [
      { prompt: t2('Il diesis (♯)…', 'The sharp (♯)…'), options: [t2('Alza di un semitono', 'Raises by a semitone'), t2('Abbassa di un semitono', 'Lowers by a semitone'), t2('Annulla', 'Cancels')], correctIndex: 0 },
      { prompt: t2('Il bemolle (♭)…', 'The flat (♭)…'), options: [t2('Alza di un semitono', 'Raises by a semitone'), t2('Abbassa di un semitono', 'Lowers by a semitone')], correctIndex: 1 },
      { prompt: t2('Il bequadro (♮) serve a…', 'The natural (♮) is used to…'), options: [t2('Annullare un’alterazione', 'Cancel an accidental'), t2('Raddoppiare la durata', 'Double the duration')], correctIndex: 0 },
      { prompt: t2('Quale alterazione vedi su questa nota?', 'Which accidental do you see on this note?'), staff: { clef: 'treble', elements: [n(p('F', 5, 'sharp'))], playable: true }, options: [t2('Diesis', 'Sharp'), t2('Bemolle', 'Flat'), t2('Bequadro', 'Natural')], correctIndex: 0 },
    ],
  },

  'armature-scale': {
    id: 'armature-scale',
    blocks: [
      { kind: 'text', text: t2('L’armatura di chiave è un gruppo di diesis o bemolle scritto subito dopo la chiave: vale per tutto il brano ed evita di ripetere le alterazioni nota per nota.', 'The key signature is a group of sharps or flats written right after the clef: it applies to the whole piece and avoids repeating accidentals note by note.') },
      { kind: 'staff', example: { clef: 'treble', keySignature: { fifths: 1 }, elements: majorScale(1, 4).map((pp) => n(pp)), playable: true, caption: t2('Sol maggiore: un diesis in armatura (Fa♯)', 'G major: one sharp in the key signature (F♯)') } },
      { kind: 'text', text: t2('Ogni tonalità maggiore ha la sua armatura. Do maggiore non ha alterazioni; Sol maggiore ha un diesis (Fa♯); Fa maggiore ha un bemolle (Si♭).', 'Each major key has its key signature. C major has no accidentals; G major has one sharp (F♯); F major has one flat (B♭).') },
      { kind: 'callout', text: t2('La scala maggiore segue sempre lo schema di toni e semitoni: T–T–S–T–T–T–S.', 'The major scale always follows the pattern of tones and semitones: T–T–S–T–T–T–S.') },
    ],
    quiz: [
      { prompt: t2('Quante alterazioni ha l’armatura di Sol maggiore?', 'How many accidentals does G major’s key signature have?'), options: [same('0'), same('1'), same('2')], correctIndex: 1, explanation: t2('Un solo diesis: Fa♯.', 'A single sharp: F♯.') },
      { prompt: t2('Do maggiore ha…', 'C major has…'), options: [t2('Nessuna alterazione', 'No accidentals'), t2('Un diesis', 'One sharp'), t2('Un bemolle', 'One flat')], correctIndex: 0 },
      { prompt: t2('L’armatura di chiave vale…', 'The key signature applies…'), options: [t2('Solo per la prima battuta', 'Only to the first measure'), t2('Per tutto il brano', 'To the whole piece')], correctIndex: 1 },
      { prompt: t2('Quante alterazioni vedi in questa armatura?', 'How many accidentals in this key signature?'), staff: { clef: 'treble', keySignature: { fifths: -1 }, elements: [n(p('F', 4), 'whole')] }, options: [same('1'), same('2'), same('3')], correctIndex: 0, explanation: t2('Fa maggiore: un bemolle (Si♭).', 'F major: one flat (B♭).') },
    ],
  },

  intervalli: {
    id: 'intervalli',
    blocks: [
      { kind: 'text', text: t2('L’intervallo è la distanza tra due note. Si conta includendo entrambe le note: da Do a Mi ci sono Do-Re-Mi, quindi è una terza.', 'An interval is the distance between two notes. You count including both notes: from C to E there are C-D-E, so it’s a third.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4)), n(p('E', 4)), n(p('C', 4)), n(p('G', 4)), n(p('C', 4)), n(p('C', 5))], playable: true, caption: t2('Do–Mi (terza), Do–Sol (quinta), Do–Do (ottava)', 'C–E (third), C–G (fifth), C–C (octave)') } },
      { kind: 'list', items: [t2('Seconda: note vicine (Do–Re)', 'Second: adjacent notes (C–D)'), t2('Terza: salto di una nota (Do–Mi)', 'Third: skip one note (C–E)'), t2('Quinta: Do–Sol', 'Fifth: C–G'), t2('Ottava: stessa nota, più acuta (Do–Do)', 'Octave: same note, higher (C–C)')] },
    ],
    quiz: [
      { prompt: t2('Do–Mi è un intervallo di…', 'C–E is an interval of a…'), options: [t2('Seconda', 'Second'), t2('Terza', 'Third'), t2('Quarta', 'Fourth')], correctIndex: 1 },
      { prompt: t2('Do–Sol è una…', 'C–G is a…'), options: [t2('Quarta', 'Fourth'), t2('Quinta', 'Fifth'), t2('Sesta', 'Sixth')], correctIndex: 1 },
      { prompt: t2('Do–Do (più acuto) è una…', 'C–C (higher) is an…'), options: [t2('Settima', 'Seventh'), t2('Ottava', 'Octave')], correctIndex: 1 },
      { prompt: t2('Per contare un intervallo si includono…', 'To count an interval you include…'), options: [t2('Solo la nota d’arrivo', 'Only the top note'), t2('Entrambe le note', 'Both notes')], correctIndex: 1 },
    ],
  },

  'dinamiche-articolazioni': {
    id: 'dinamiche-articolazioni',
    blocks: [
      { kind: 'text', text: t2('Le dinamiche indicano l’intensità del suono, cioè quanto suonare piano o forte. Si scrivono con lettere sotto il pentagramma.', 'Dynamics indicate the intensity of the sound, i.e. how soft or loud to play. They’re written with letters below the staff.') },
      { kind: 'list', items: [t2('p = piano (debole)', 'p = piano (soft)'), t2('mf = mezzo forte', 'mf = mezzo forte (medium loud)'), t2('f = forte', 'f = forte (loud)'), t2('< crescendo: aumentare gradualmente', '< crescendo: get gradually louder'), t2('> diminuendo: diminuire gradualmente', '> diminuendo: get gradually softer')] },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 5), 'quarter', 0, { dynamic: 'p' }), n(p('E', 5)), n(p('G', 5), 'quarter', 0, { dynamic: 'mf' }), n(p('C', 5), 'quarter', 0, { dynamic: 'f' })], playable: true, caption: t2('Dinamiche: piano (p), mezzo forte (mf), forte (f)', 'Dynamics: piano (p), mezzo forte (mf), forte (f)') } },
      { kind: 'text', text: t2('Le articolazioni dicono come suonare le note. Lo staccato (un puntino sopra o sotto la nota) le rende brevi e staccate; il legato le collega in modo morbido.', 'Articulations tell how to play the notes. Staccato (a dot above or below the note) makes them short and detached; legato connects them smoothly.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('G', 4), 'quarter', 0, { articulations: ['staccato'] }), n(p('G', 4), 'quarter', 0, { articulations: ['accent'] }), n(p('G', 4), 'quarter', 0, { articulations: ['tenuto'] }), r('quarter')], playable: true, caption: t2('Articolazioni: staccato, accento, tenuto', 'Articulations: staccato, accent, tenuto') } },
      { kind: 'callout', text: t2('Dinamiche e articolazioni non cambiano l’altezza né la durata scritta: aggiungono espressione e carattere alla musica.', 'Dynamics and articulations don’t change the written pitch or duration: they add expression and character to the music.') },
    ],
    quiz: [
      { prompt: t2('Il segno “p” significa…', 'The sign “p” means…'), options: [t2('Piano (debole)', 'Piano (soft)'), t2('Forte', 'Loud')], correctIndex: 0 },
      { prompt: t2('Il segno “f” significa…', 'The sign “f” means…'), options: [t2('Piano', 'Soft'), t2('Forte', 'Loud')], correctIndex: 1 },
      { prompt: t2('Lo staccato rende la nota…', 'Staccato makes the note…'), options: [t2('Breve e staccata', 'Short and detached'), t2('Lunga e legata', 'Long and connected')], correctIndex: 0 },
      { prompt: t2('Il crescendo (<) indica…', 'The crescendo (<) indicates…'), options: [t2('Diminuire il volume', 'Decrease the volume'), t2('Aumentare gradualmente il volume', 'Gradually increase the volume')], correctIndex: 1 },
    ],
  },

  'scale-minori': {
    id: 'scale-minori',
    blocks: [
      { kind: 'text', text: t2('La scala minore ha un carattere più scuro o malinconico rispetto alla maggiore. La scala minore naturale segue lo schema di toni e semitoni: T–S–T–T–S–T–T.', 'The minor scale has a darker, more melancholic character than the major. The natural minor scale follows this pattern of tones and semitones: T–S–T–T–S–T–T.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('A', 4)), n(p('B', 4)), n(p('C', 5)), n(p('D', 5)), n(p('E', 5)), n(p('F', 5)), n(p('G', 5)), n(p('A', 5))], playable: true, caption: t2('La minore naturale: La Si Do Re Mi Fa Sol La', 'A natural minor: A B C D E F G A') } },
      { kind: 'text', text: t2('Ogni tonalità maggiore ha una "relativa minore" che usa le stesse note (e la stessa armatura), ma parte da un’altra nota: la sesta della scala maggiore.', 'Each major key has a “relative minor” that uses the same notes (and the same key signature), but starts on a different note: the sixth degree of the major scale.') },
      { kind: 'staff', example: { clef: 'treble', elements: majorScale(0, 4).map((pp) => n(pp)), playable: true, caption: t2('Do maggiore: stesse note (nessuna alterazione) della relativa La minore', 'C major: same notes (no accidentals) as its relative A minor') } },
      { kind: 'callout', text: t2('La minore è la relativa minore di Do maggiore: stesse sette note, ma con un "centro" diverso (La invece di Do).', 'A minor is the relative minor of C major: the same seven notes, but with a different “home” (A instead of C).') },
    ],
    quiz: [
      { prompt: t2('La relativa minore di Do maggiore è…', 'The relative minor of C major is…'), options: [t2('La minore', 'A minor'), t2('Mi minore', 'E minor'), t2('Re minore', 'D minor')], correctIndex: 0 },
      { prompt: t2('La scala minore naturale segue lo schema…', 'The natural minor scale follows the pattern…'), options: [t2('T–T–S–T–T–T–S (maggiore)', 'T–T–S–T–T–T–S (major)'), t2('T–S–T–T–S–T–T (minore)', 'T–S–T–T–S–T–T (minor)')], correctIndex: 1 },
      { prompt: t2('La relativa minore condivide con la maggiore…', 'The relative minor shares with the major…'), options: [t2('L’armatura (le stesse note)', 'The key signature (the same notes)'), t2('La stessa nota di partenza', 'The same starting note')], correctIndex: 0 },
    ],
  },

  triadi: {
    id: 'triadi',
    blocks: [
      { kind: 'text', text: t2('Una triade è un accordo di tre note sovrapposte “per terze”: la fondamentale, la terza e la quinta.', 'A triad is a chord of three notes stacked “in thirds”: the root, the third and the fifth.') },
      { kind: 'staff', example: { clef: 'treble', elements: [chord([p('C', 4), p('E', 4), p('G', 4)], 'whole')], playable: true, caption: t2('Triade di Do maggiore (Do–Mi–Sol)', 'C major triad (C–E–G)') } },
      { kind: 'list', items: [t2('Maggiore: suono brillante (Do–Mi–Sol)', 'Major: bright sound (C–E–G)'), t2('Minore: suono più scuro (Do–Mi♭–Sol)', 'Minor: darker sound (C–E♭–G)'), t2('Diminuita: tesa (Do–Mi♭–Sol♭)', 'Diminished: tense (C–E♭–G♭)'), t2('Aumentata: sospesa (Do–Mi–Sol♯)', 'Augmented: suspended (C–E–G♯)')] },
      { kind: 'staff', example: { clef: 'treble', elements: [chord([p('C', 4), p('E', 4), p('G', 4)]), chord([p('C', 4), p('E', 4, 'flat'), p('G', 4)]), chord([p('C', 4), p('E', 4, 'flat'), p('G', 4, 'flat')]), chord([p('C', 4), p('E', 4), p('G', 4, 'sharp')])], playable: true, caption: t2('Maggiore, minore, diminuita, aumentata (su Do)', 'Major, minor, diminished, augmented (on C)') } },
    ],
    quiz: [
      { prompt: t2('Una triade è formata da quante note?', 'How many notes form a triad?'), options: [same('2'), same('3'), same('4')], correctIndex: 1 },
      { prompt: t2('La triade di Do maggiore è…', 'The C major triad is…'), options: [t2('Do–Mi–Sol', 'C–E–G'), t2('Do–Fa–La', 'C–F–A'), t2('Re–Fa–La', 'D–F–A')], correctIndex: 0 },
      { prompt: t2('Rispetto alla maggiore, la triade minore ha la terza…', 'Compared with the major, the minor triad has its third…'), options: [t2('Più alta di un semitono', 'A semitone higher'), t2('Più bassa di un semitono', 'A semitone lower')], correctIndex: 1 },
      { prompt: t2('Che triade è?', 'Which triad is this?'), staff: { clef: 'treble', elements: [chord([p('C', 4), p('E', 4, 'flat'), p('G', 4)], 'whole')], playable: true }, options: [t2('Maggiore', 'Major'), t2('Minore', 'Minor'), t2('Diminuita', 'Diminished')], correctIndex: 1 },
    ],
  },
}

export function getLesson(id: string): Lesson | undefined {
  return LESSONS[id]
}
