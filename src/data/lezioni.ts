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
import { ITALIAN_NOTE_NAMES, STEP_NAMES_IT, STEPS } from '../core/pitch'
import { majorScale } from '../core/theory'

/**
 * CONTENUTO delle lezioni di Teoria (italiano-first). I metadati/indice stanno in
 * data/moduli.ts. Ogni lezione: blocchi di contenuto + un mini-quiz a scelta
 * multipla. Gli esempi musicali sono renderizzati con <Staff> e possono essere
 * cliccati per ascoltarne il suono.
 */

export interface StaffExample {
  clef: ClefType
  timeSignature?: TimeSignature
  keySignature?: KeySignature
  elements: NoteElement[]
  /** Se true, le note sono cliccabili per ascoltarle. */
  playable?: boolean
  caption?: string
}

export interface QuizQuestion {
  prompt: string
  staff?: StaffExample
  options: string[]
  correctIndex: number
  explanation?: string
}

export type ContentBlock =
  | { kind: 'text'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'callout'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'staff'; example: StaffExample }

export interface Lesson {
  id: string
  blocks: ContentBlock[]
  quiz: QuizQuestion[]
}

// ---- Helper compatti per costruire gli esempi ------------------------------

const p = (step: Step, octave: number, accidental?: Accidental): Pitch => ({ step, octave, accidental })
const n = (pitch: Pitch, base: DurationBase = 'quarter', dots: Dots = 0): NoteElement =>
  createNote([pitch], dur(base, dots))
const r = (base: DurationBase, dots: Dots = 0): NoteElement => createRest(dur(base, dots))

/** Domanda "che nota è questa?" con il pentagramma cliccabile. */
function identify(pitch: Pitch, clef: ClefType = 'treble'): QuizQuestion {
  return {
    prompt: 'Che nota è questa?',
    staff: { clef, elements: [n(pitch, 'whole')], playable: true },
    options: ITALIAN_NOTE_NAMES,
    correctIndex: STEPS.indexOf(pitch.step),
    explanation: `È un ${STEP_NAMES_IT[pitch.step]}.`,
  }
}

const VERO_FALSO: string[] = ['Vero', 'Falso']

// ---------------------------------------------------------------------------

export const LESSONS: Record<string, Lesson> = {
  pentagramma: {
    id: 'pentagramma',
    blocks: [
      {
        kind: 'text',
        text: 'Il pentagramma è formato da cinque righe e quattro spazi. Le note si scrivono sulle righe e negli spazi e si leggono dal basso verso l’alto: più una nota è in alto, più il suono è acuto.',
      },
      {
        kind: 'text',
        text: 'All’inizio del pentagramma c’è la chiave, che dà il nome alle note. La chiave di violino (o di Sol) si usa per i suoni acuti; la chiave di basso (o di Fa) per i suoni gravi.',
      },
      {
        kind: 'staff',
        example: { clef: 'treble', elements: [n(p('C', 4), 'whole')], playable: true, caption: 'Il Do centrale in chiave di violino' },
      },
      {
        kind: 'staff',
        example: { clef: 'bass', elements: [n(p('C', 4), 'whole')], playable: true, caption: 'Lo stesso Do centrale in chiave di basso' },
      },
      {
        kind: 'callout',
        text: 'La stessa nota occupa posizioni diverse nelle due chiavi: per questo è importante guardare sempre la chiave all’inizio del rigo.',
      },
    ],
    quiz: [
      { prompt: 'Quante righe ha il pentagramma?', options: ['4', '5', '6', '7'], correctIndex: 1 },
      { prompt: 'Come si legge il pentagramma?', options: ['Dall’alto verso il basso', 'Dal basso verso l’alto'], correctIndex: 1, explanation: 'Più in alto = più acuto.' },
      { prompt: 'La chiave di violino si chiama anche chiave di…', options: ['Sol', 'Fa', 'Do'], correctIndex: 0 },
      { prompt: 'La chiave di basso si usa per i suoni gravi.', options: VERO_FALSO, correctIndex: 0 },
    ],
  },

  'nomi-note': {
    id: 'nomi-note',
    blocks: [
      { kind: 'text', text: 'Le note sono sette: Do, Re, Mi, Fa, Sol, La, Si. Dopo il Si si ricomincia da Do, una posizione più in alto: questa distanza si chiama ottava.' },
      { kind: 'staff', example: { clef: 'treble', elements: majorScale(0, 4).map((pp) => n(pp)), playable: true, caption: 'La scala di Do: Do Re Mi Fa Sol La Si Do (cliccala!)' } },
      { kind: 'text', text: 'Quando una nota è troppo acuta o troppo grave per stare sul pentagramma, si usano piccole righe aggiuntive chiamate tagli addizionali.' },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4), 'whole')], playable: true, caption: 'Il Do centrale: un taglio addizionale sotto il pentagramma di violino' } },
    ],
    quiz: [
      { prompt: 'Quante sono le note?', options: ['5', '7', '8'], correctIndex: 1 },
      identify(p('E', 4)),
      identify(p('G', 4)),
      { prompt: 'Le righe aggiuntive per le note molto acute o gravi si chiamano…', options: ['Stanghette', 'Tagli addizionali', 'Chiavi'], correctIndex: 1 },
    ],
  },

  'valori-note': {
    id: 'valori-note',
    blocks: [
      { kind: 'text', text: 'Ogni nota ha una durata. I valori principali, dal più lungo al più breve, sono: semibreve, minima, semiminima, croma e semicroma.' },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('B', 4), 'whole'), n(p('B', 4), 'half'), n(p('B', 4), 'quarter'), n(p('B', 4), 'eighth'), n(p('B', 4), '16th')], caption: 'Semibreve, minima, semiminima, croma, semicroma' } },
      { kind: 'callout', text: 'Ogni valore dura la metà di quello precedente: la minima vale due semiminime, la semiminima due crome, e così via.' },
    ],
    quiz: [
      { prompt: 'In 4/4, quanti movimenti dura una semibreve?', options: ['1', '2', '4'], correctIndex: 2 },
      { prompt: 'La minima vale quante semiminime?', options: ['1', '2', '4'], correctIndex: 1 },
      { prompt: 'Quale valore dura di meno?', options: ['Semiminima', 'Croma', 'Semicroma'], correctIndex: 2 },
      { prompt: 'Che valore è questo?', staff: { clef: 'treble', elements: [n(p('B', 4), 'half')], playable: true }, options: ['Semibreve', 'Minima', 'Semiminima'], correctIndex: 1 },
    ],
  },

  pause: {
    id: 'pause',
    blocks: [
      { kind: 'text', text: 'Anche il silenzio fa parte della musica. Le pause indicano per quanto tempo non si suona, e hanno gli stessi valori delle note.' },
      { kind: 'staff', example: { clef: 'treble', elements: [r('whole'), r('half'), r('quarter'), r('eighth')], caption: 'Pausa di semibreve, di minima, di semiminima, di croma' } },
      { kind: 'callout', text: 'La pausa di semibreve “pende” sotto la quarta riga; quella di minima “appoggia” sulla terza riga: un modo semplice per distinguerle.' },
    ],
    quiz: [
      { prompt: 'La pausa indica…', options: ['Un suono lungo', 'Un silenzio', 'Una nota acuta'], correctIndex: 1 },
      { prompt: 'La pausa di semiminima dura quanto…', options: ['Una semiminima', 'Una minima', 'Una semibreve'], correctIndex: 0 },
      { prompt: 'Anche i silenzi hanno una durata precisa.', options: VERO_FALSO, correctIndex: 0 },
    ],
  },

  'punto-legatura': {
    id: 'punto-legatura',
    blocks: [
      { kind: 'text', text: 'Il punto di valore si mette a destra della nota e ne aumenta la durata della metà. Una minima (2 movimenti) col punto vale quindi 3 movimenti.' },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('D', 5), 'half', 1)], playable: true, caption: 'Minima col punto: vale 3 movimenti' } },
      { kind: 'text', text: 'La legatura di valore è una linea curva che unisce due note della stessa altezza: si suona una sola nota lunga, sommando le durate.' },
      { kind: 'callout', text: 'Attenzione: la legatura di valore unisce note uguali e ne somma la durata. È diversa dalla legatura di portamento, che collega note di altezza diversa (legato).' },
    ],
    quiz: [
      { prompt: 'Una minima col punto vale quanti movimenti?', options: ['2', '3', '4'], correctIndex: 1 },
      { prompt: 'Il punto di valore aggiunge alla nota…', options: ['La metà del suo valore', 'Il doppio', 'Un quarto'], correctIndex: 0 },
      { prompt: 'La legatura di valore unisce due note…', options: ['Di altezza diversa', 'Della stessa altezza'], correctIndex: 1 },
    ],
  },

  'tempo-battuta': {
    id: 'tempo-battuta',
    blocks: [
      { kind: 'text', text: 'Le stanghette verticali dividono il pentagramma in battute (o misure). L’indicazione di tempo, scritta come una frazione all’inizio, dice quanti movimenti ci sono in ogni battuta e quale valore vale un movimento.' },
      { kind: 'staff', example: { clef: 'treble', timeSignature: { beats: 4, beatType: 4 }, elements: [n(p('C', 5)), n(p('C', 5)), n(p('C', 5)), n(p('C', 5))], caption: '4/4: quattro movimenti da una semiminima ciascuno' } },
      { kind: 'staff', example: { clef: 'treble', timeSignature: { beats: 3, beatType: 4 }, elements: [n(p('C', 5)), n(p('C', 5)), n(p('C', 5))], caption: '3/4: tre movimenti (il tempo di valzer)' } },
      { kind: 'list', items: ['Il numero in alto: quanti movimenti per battuta', 'Il numero in basso: il valore di un movimento (4 = semiminima, 8 = croma)'] },
    ],
    quiz: [
      { prompt: 'In 3/4, quanti movimenti entrano in una battuta?', options: ['2', '3', '4'], correctIndex: 1 },
      { prompt: 'Il numero in alto dell’indicazione di tempo indica…', options: ['Il valore di un movimento', 'Quanti movimenti per battuta'], correctIndex: 1 },
      { prompt: 'Che cosa separa due battute?', options: ['La stanghetta', 'La chiave'], correctIndex: 0 },
      { prompt: 'Quanti movimenti ha questa battuta?', staff: { clef: 'treble', timeSignature: { beats: 4, beatType: 4 }, elements: [n(p('G', 4)), n(p('G', 4)), n(p('G', 4)), n(p('G', 4))], playable: true }, options: ['3', '4', '5'], correctIndex: 1 },
    ],
  },

  alterazioni: {
    id: 'alterazioni',
    blocks: [
      { kind: 'text', text: 'Le alterazioni cambiano l’altezza di una nota di un semitono, la distanza più piccola tra due suoni.' },
      { kind: 'list', items: ['Diesis (♯): alza la nota di un semitono', 'Bemolle (♭): abbassa la nota di un semitono', 'Bequadro (♮): annulla un’alterazione precedente'] },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 5)), n(p('C', 5, 'sharp')), n(p('C', 5, 'natural'))], playable: true, caption: 'Do, Do diesis, Do bequadro' } },
      { kind: 'callout', text: 'Un’alterazione vale per tutta la battuta in cui compare, finché non interviene un bequadro o la stanghetta successiva.' },
    ],
    quiz: [
      { prompt: 'Il diesis (♯)…', options: ['Alza di un semitono', 'Abbassa di un semitono', 'Annulla'], correctIndex: 0 },
      { prompt: 'Il bemolle (♭)…', options: ['Alza di un semitono', 'Abbassa di un semitono'], correctIndex: 1 },
      { prompt: 'Il bequadro (♮) serve a…', options: ['Annullare un’alterazione', 'Raddoppiare la durata'], correctIndex: 0 },
      { prompt: 'Quale alterazione vedi su questa nota?', staff: { clef: 'treble', elements: [n(p('F', 5, 'sharp'))], playable: true }, options: ['Diesis', 'Bemolle', 'Bequadro'], correctIndex: 0 },
    ],
  },

  'armature-scale': {
    id: 'armature-scale',
    blocks: [
      { kind: 'text', text: 'L’armatura di chiave è un gruppo di diesis o bemolle scritto subito dopo la chiave: vale per tutto il brano ed evita di ripetere le alterazioni nota per nota.' },
      { kind: 'staff', example: { clef: 'treble', keySignature: { fifths: 1 }, elements: majorScale(1, 4).map((pp) => n(pp)), playable: true, caption: 'Sol maggiore: un diesis in armatura (Fa♯)' } },
      { kind: 'text', text: 'Ogni tonalità maggiore ha la sua armatura. Do maggiore non ha alterazioni; Sol maggiore ha un diesis (Fa♯); Fa maggiore ha un bemolle (Si♭).' },
      { kind: 'callout', text: 'La scala maggiore segue sempre lo schema di toni e semitoni: T–T–S–T–T–T–S.' },
    ],
    quiz: [
      { prompt: 'Quante alterazioni ha l’armatura di Sol maggiore?', options: ['0', '1', '2'], correctIndex: 1, explanation: 'Un solo diesis: Fa♯.' },
      { prompt: 'Do maggiore ha…', options: ['Nessuna alterazione', 'Un diesis', 'Un bemolle'], correctIndex: 0 },
      { prompt: 'L’armatura di chiave vale…', options: ['Solo per la prima battuta', 'Per tutto il brano'], correctIndex: 1 },
      { prompt: 'Quante alterazioni vedi in questa armatura?', staff: { clef: 'treble', keySignature: { fifths: -1 }, elements: [n(p('F', 4), 'whole')] }, options: ['1', '2', '3'], correctIndex: 0, explanation: 'Fa maggiore: un bemolle (Si♭).' },
    ],
  },

  intervalli: {
    id: 'intervalli',
    blocks: [
      { kind: 'text', text: 'L’intervallo è la distanza tra due note. Si conta includendo entrambe le note: da Do a Mi ci sono Do-Re-Mi, quindi è una terza.' },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4)), n(p('E', 4)), n(p('C', 4)), n(p('G', 4)), n(p('C', 4)), n(p('C', 5))], playable: true, caption: 'Do–Mi (terza), Do–Sol (quinta), Do–Do (ottava)' } },
      { kind: 'list', items: ['Seconda: note vicine (Do–Re)', 'Terza: salto di una nota (Do–Mi)', 'Quinta: Do–Sol', 'Ottava: stessa nota, più acuta (Do–Do)'] },
    ],
    quiz: [
      { prompt: 'Do–Mi è un intervallo di…', options: ['Seconda', 'Terza', 'Quarta'], correctIndex: 1 },
      { prompt: 'Do–Sol è una…', options: ['Quarta', 'Quinta', 'Sesta'], correctIndex: 1 },
      { prompt: 'Do–Do (più acuto) è una…', options: ['Settima', 'Ottava'], correctIndex: 1 },
      { prompt: 'Per contare un intervallo si includono…', options: ['Solo la nota d’arrivo', 'Entrambe le note'], correctIndex: 1 },
    ],
  },

  'dinamiche-articolazioni': {
    id: 'dinamiche-articolazioni',
    blocks: [
      { kind: 'text', text: 'Le dinamiche indicano l’intensità del suono, cioè quanto suonare piano o forte. Si scrivono con lettere sotto il pentagramma.' },
      { kind: 'list', items: ['p = piano (debole)', 'mf = mezzo forte', 'f = forte', '< crescendo: aumentare gradualmente', '> diminuendo: diminuire gradualmente'] },
      { kind: 'text', text: 'Le articolazioni dicono come suonare le note. Lo staccato (un puntino sopra o sotto la nota) le rende brevi e staccate; il legato le collega in modo morbido.' },
      { kind: 'callout', text: 'Dinamiche e articolazioni non cambiano l’altezza né la durata scritta: aggiungono espressione e carattere alla musica.' },
    ],
    quiz: [
      { prompt: 'Il segno “p” significa…', options: ['Piano (debole)', 'Forte'], correctIndex: 0 },
      { prompt: 'Il segno “f” significa…', options: ['Piano', 'Forte'], correctIndex: 1 },
      { prompt: 'Lo staccato rende la nota…', options: ['Breve e staccata', 'Lunga e legata'], correctIndex: 0 },
      { prompt: 'Il crescendo (<) indica…', options: ['Diminuire il volume', 'Aumentare gradualmente il volume'], correctIndex: 1 },
    ],
  },
}

export function getLesson(id: string): Lesson | undefined {
  return LESSONS[id]
}
