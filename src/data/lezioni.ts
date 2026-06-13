import type {
  Accidental,
  DisplayClef,
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
  clef: DisplayClef
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
  | { kind: 'tip'; text: L; intent?: 'tip' | 'curiosity' }
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
function identify(pitch: Pitch, clef: DisplayClef = 'treble'): QuizQuestion {
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
      { kind: 'text', text: t2('Il pentagramma (dal greco penta = cinque) è formato da cinque righe e quattro spazi. Sia le righe sia gli spazi ospitano le note, e si contano sempre dal basso verso l’alto. Più una nota è in alto sul rigo, più il suo suono è acuto; più è in basso, più è grave.', 'The staff (from the Greek penta = five) has five lines and four spaces. Both the lines and the spaces hold notes, and they are always counted from bottom to top. The higher a note sits on the staff, the higher its pitch; the lower it sits, the lower its pitch.') },
      { kind: 'text', text: t2('All’inizio di ogni rigo c’è la chiave: un simbolo che fissa il nome di una nota di riferimento e, di conseguenza, di tutte le altre. Senza chiave, le note sul pentagramma non avrebbero un nome preciso.', 'At the start of every staff is the clef: a symbol that fixes the name of one reference note and, from it, all the others. Without a clef, the notes on the staff would have no precise name.') },
      { kind: 'heading', text: t2('Le chiavi più comuni: violino e basso', 'The most common clefs: treble and bass') },
      { kind: 'text', text: t2('La chiave di violino (o di Sol) avvolge col suo ricciolo la seconda riga, indicando che lì si trova il Sol: si usa per i suoni acuti (voce, flauto, violino, mano destra del pianoforte). La chiave di basso (o di Fa) ha due puntini attorno alla quarta riga, dove si trova il Fa: si usa per i suoni gravi (violoncello, contrabbasso, mano sinistra del pianoforte).', 'The treble (or G) clef curls its spiral around the second line, showing that G sits there: it is used for higher sounds (voice, flute, violin, the pianist’s right hand). The bass (or F) clef places two dots around the fourth line, where F sits: it is used for lower sounds (cello, double bass, the pianist’s left hand).') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4), 'whole')], playable: true, caption: t2('Il Do centrale in chiave di violino (un taglio addizionale sotto il rigo)', 'Middle C in the treble clef (one ledger line below the staff)') } },
      { kind: 'staff', example: { clef: 'bass', elements: [n(p('C', 4), 'whole')], playable: true, caption: t2('Lo stesso Do centrale in chiave di basso (un taglio addizionale sopra il rigo)', 'The same middle C in the bass clef (one ledger line above the staff)') } },
      { kind: 'callout', text: t2('Insieme, chiave di violino e di basso formano il “rigo doppio” (grande stave) del pianoforte. Il Do centrale sta proprio nel mezzo, condiviso dalle due chiavi: per questo lo si chiama “centrale”.', 'Together, the treble and bass clefs form the piano’s “grand staff”. Middle C sits right in between, shared by the two clefs — that is why it is called “middle”.') },
      { kind: 'heading', text: t2('Leggere le note: parti dalla nota di riferimento', 'Reading notes: start from the reference note') },
      { kind: 'text', text: t2('Per leggere una nota qualsiasi, parti dalla nota fissata dalla chiave e poi muoviti per gradi: ogni passo successivo è una riga o uno spazio (riga, spazio, riga, spazio…). Salendo i suoni diventano più acuti, scendendo più gravi. Memorizzare la nota di riferimento di ogni chiave è il primo passo per leggere senza contare ogni volta da capo.', 'To read any note, start from the note fixed by the clef and then move by steps: each step is a line or a space (line, space, line, space…). Going up the sounds get higher, going down they get lower. Memorising each clef’s reference note is the first step to reading without counting from scratch every time.') },
      { kind: 'heading', text: t2('In chiave di violino', 'In the treble clef') },
      { kind: 'text', text: t2('La nota di riferimento è il Sol abbracciato dal ricciolo, sulla 2ª riga dal basso. Da lì: le note sulle cinque righe sono Mi-Sol-Si-Re-Fa, quelle nei quattro spazi Fa-La-Do-Mi (sempre contando dal basso).', 'The reference note is the G hugged by the spiral, on the 2nd line from the bottom. From there: the five line notes are E-G-B-D-F, the four space notes F-A-C-E (always counting from the bottom).') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('E', 4), 'whole'), n(p('G', 4), 'whole'), n(p('B', 4), 'whole'), n(p('D', 5), 'whole'), n(p('F', 5), 'whole')], playable: true, caption: t2('Le note sulle cinque righe in chiave di violino: Mi Sol Si Re Fa', 'The five line notes in the treble clef: E G B D F') } },
      { kind: 'heading', text: t2('In chiave di basso', 'In the bass clef') },
      { kind: 'text', text: t2('La nota di riferimento è il Fa tra i due puntini, sulla 4ª riga. Le note sulle righe sono Sol-Si-Re-Fa-La, quelle negli spazi La-Do-Mi-Sol. Attenzione: la stessa posizione che in chiave di violino è un Sol (2ª riga) qui diventa un Si!', 'The reference note is the F between the two dots, on the 4th line. The line notes are G-B-D-F-A, the space notes A-C-E-G. Watch out: the same position that is a G in the treble clef (2nd line) becomes a B here!') },
      { kind: 'staff', example: { clef: 'bass', elements: [n(p('G', 2), 'whole'), n(p('B', 2), 'whole'), n(p('D', 3), 'whole'), n(p('F', 3), 'whole'), n(p('A', 3), 'whole')], playable: true, caption: t2('Le note sulle cinque righe in chiave di basso: Sol Si Re Fa La', 'The five line notes in the bass clef: G B D F A') } },
      { kind: 'heading', text: t2('Le chiavi di Do: contralto e tenore', 'The C clefs: alto and tenor') },
      { kind: 'text', text: t2('Esiste una terza famiglia, le chiavi di Do: il loro centro indica dove si trova il Do centrale (Do4). Sono chiavi “mobili”, perché possono stare su righe diverse. Oggi se ne usano due: la chiave di contralto (Do sulla 3ª riga, quella centrale), tipica della viola, e la chiave di tenore (Do sulla 4ª riga), usata per i registri acuti di violoncello, fagotto e trombone.', 'There is a third family, the C clefs: their centre marks where middle C (C4) sits. They are “movable” clefs, because they can sit on different lines. Two are used today: the alto clef (C on the 3rd, middle line), typical of the viola, and the tenor clef (C on the 4th line), used for the high registers of the cello, bassoon and trombone.') },
      { kind: 'staff', example: { clef: 'alto', elements: [n(p('C', 4), 'whole')], playable: true, caption: t2('Chiave di contralto (viola): il Do centrale è sulla riga di mezzo', 'Alto clef (viola): middle C sits on the middle line') } },
      { kind: 'staff', example: { clef: 'tenor', elements: [n(p('C', 4), 'whole')], playable: true, caption: t2('Chiave di tenore: lo stesso Do centrale sale sulla quarta riga', 'Tenor clef: the same middle C moves up to the fourth line') } },
      { kind: 'text', text: t2('Trovato il Do centrale, conti per gradi come nelle altre chiavi. In chiave di contralto le righe sono Fa-La-Do-Mi-Sol; in chiave di tenore Re-Fa-La-Do-Mi.', 'Once you’ve found middle C, you count by steps as in the other clefs. In the alto clef the line notes are F-A-C-E-G; in the tenor clef D-F-A-C-E.') },
      { kind: 'callout', text: t2('È proprio questo il senso delle chiavi: la stessa posizione sul rigo cambia nome a seconda della chiave. La riga centrale, per esempio, è un Si in chiave di violino, un Re in chiave di basso e un Do in chiave di contralto. Si cambia chiave per tenere le note di una voce o di uno strumento ben dentro il rigo, con il minor numero possibile di tagli addizionali.', 'This is exactly what clefs are for: the same position on the staff changes name depending on the clef. The middle line, for instance, is a B in the treble clef, a D in the bass clef and a C in the alto clef. You switch clef to keep a voice’s or instrument’s notes neatly inside the staff, with as few ledger lines as possible.') },
      { kind: 'tip', intent: 'tip', text: t2('Per orientarti in fretta, in ogni chiave individua subito la sua nota di riferimento — Sol per il violino, Fa per il basso, Do per le chiavi di Do — e usala come “casa base” da cui contare. Con la pratica la riconoscerai a colpo d’occhio, senza più contare riga per riga.', 'To get your bearings quickly, in each clef spot its reference note straight away — G for treble, F for bass, C for the C clefs — and use it as a “home base” to count from. With practice you’ll recognise it at a glance, without counting line by line.') },
      { kind: 'tip', intent: 'curiosity', text: t2('La notazione su pentagramma fu perfezionata intorno all’anno 1000 dal monaco italiano Guido d’Arezzo: prima di lui le melodie si tramandavano a memoria o con segni vaghi. Le chiavi nascono come lettere stilizzate — la chiave di violino è una “G” (Sol), quella di basso una “F” (Fa), quella di Do una “C”. La chiave di Do è davvero “mobile”: un tempo si usavano anche la chiave di soprano (Do sulla 1ª riga) e quella di baritono, così la voce di ogni cantante restava comodamente dentro il rigo.', 'Staff notation was perfected around the year 1000 by the Italian monk Guido of Arezzo; before him melodies were passed down by memory or with vague signs. The clefs began as stylized letters — the treble clef is a “G”, the bass clef an “F”, the C clef a “C”. The C clef really is “movable”: the soprano clef (C on the 1st line) and the baritone clef were once used too, so each singer’s voice stayed comfortably inside the staff.') },
    ],
    quiz: [
      { prompt: t2('Quante righe e spazi ha il pentagramma?', 'How many lines and spaces does the staff have?'), options: [t2('5 righe e 4 spazi', '5 lines and 4 spaces'), t2('4 righe e 5 spazi', '4 lines and 5 spaces'), t2('5 righe e 5 spazi', '5 lines and 5 spaces')], correctIndex: 0 },
      { prompt: t2('A che cosa serve la chiave?', 'What is the clef for?'), options: [t2('A dare il nome alle note', 'To name the notes'), t2('A indicare la velocità', 'To set the speed'), t2('A indicare il volume', 'To set the volume')], correctIndex: 0 },
      { prompt: t2('La chiave di violino indica dove si trova il…', 'The treble clef shows where … is'), options: [t2('Sol', 'G'), t2('Fa', 'F'), t2('Do', 'C')], correctIndex: 0 },
      { prompt: t2('La chiave di basso indica dove si trova il…', 'The bass clef shows where … is'), options: [t2('Fa', 'F'), t2('Sol', 'G'), t2('Do', 'C')], correctIndex: 0, explanation: t2('È sulla 4ª riga, tra i due puntini.', 'It sits on the 4th line, between the two dots.') },
      { prompt: t2('Le chiavi di contralto e di tenore indicano dove si trova il…', 'The alto and tenor clefs show where … is'), options: [t2('Do (centrale)', 'C (middle)'), t2('Sol', 'G'), t2('Fa', 'F')], correctIndex: 0, explanation: t2('Sono le “chiavi di Do”: il loro centro segna il Do centrale.', 'They are the “C clefs”: their centre marks middle C.') },
      identify(p('C', 4), 'alto'),
      { prompt: t2('Una nota sulla riga centrale è un Si in chiave di violino. In chiave di basso, la stessa posizione è un…', 'A note on the middle line is a B in the treble clef. In the bass clef, the same position is a…'), options: [t2('Re', 'D'), t2('Do', 'C'), t2('Si', 'B')], correctIndex: 0, explanation: t2('Riga centrale: Si in violino, Re in basso, Do in contralto.', 'Middle line: B in treble, D in bass, C in alto.') },
      { prompt: t2('Chi perfezionò la notazione su pentagramma?', 'Who perfected staff notation?'), options: [t2('Guido d’Arezzo', 'Guido of Arezzo'), t2('Mozart', 'Mozart'), t2('Beethoven', 'Beethoven')], correctIndex: 0 },
    ],
  },

  'nomi-note': {
    id: 'nomi-note',
    blocks: [
      { kind: 'text', text: t2('Le note sono sette e si ripetono all’infinito: Do, Re, Mi, Fa, Sol, La, Si (in inglese C, D, E, F, G, A, B). Dopo il Si si ricomincia da Do, ma una posizione più in alto: questa distanza tra una nota e la sua ripetizione si chiama ottava.', 'There are seven notes and they repeat endlessly: in Italian Do, Re, Mi, Fa, Sol, La, Si — in English C, D, E, F, G, A, B. After B you start again from C, one position higher: this distance between a note and its repetition is called an octave.') },
      { kind: 'staff', example: { clef: 'treble', elements: majorScale(0, 4).map((pp) => n(pp)), playable: true, caption: t2('La scala di Do: Do Re Mi Fa Sol La Si Do (cliccala per ascoltarla!)', 'The C scale: C D E F G A B C (click it to hear it!)') } },
      { kind: 'text', text: t2('Ogni nota occupa una posizione fissa: salendo, si alternano riga e spazio. Sul rigo di violino, le righe (dal basso) sono Mi-Sol-Si-Re-Fa e gli spazi Fa-La-Do-Mi.', 'Each note has a fixed position: going up, lines and spaces alternate. On the treble staff the lines (from the bottom) are E-G-B-D-F and the spaces F-A-C-E.') },
      { kind: 'tip', intent: 'tip', text: t2('Trucco di lettura: impara a memoria una nota di riferimento (per esempio il Sol della 2ª riga) e ricava le altre saltando di terza in terza, una nota per volta. In inglese si usano frasi-aiuto che sfruttano le LETTERE delle note — gli spazi F-A-C-E formano la parola “FACE” (faccia) — ma con i nomi Do-Re-Mi questo gioco non funziona: se ti è utile, inventa una tua filastrocca con parole che iniziano per Mi, Sol, Si, Re, Fa.', 'Reading trick: memorise one reference note (say the G on the 2nd line) and work out the others by skipping a third at a time, one note per step. English speakers also use letter phrases — the spaces F-A-C-E spell the word “FACE”, the lines “Every Good Boy Does Fine” — but that game doesn’t work with the Do-Re-Mi names. If it helps, make up your own rhyme with words starting in Mi, Sol, Si, Re, Fa.') },
      { kind: 'text', text: t2('Quando una nota è troppo acuta o troppo grave per stare sul pentagramma, si usano piccole righe aggiuntive chiamate tagli addizionali. Il Do centrale, per esempio, sta su un taglio sotto la chiave di violino.', 'When a note is too high or too low for the staff, small extra lines called ledger lines are used. Middle C, for example, sits on a ledger line below the treble staff.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4), 'whole'), n(p('A', 5), 'whole')], playable: true, caption: t2('Tagli addizionali: Do centrale (sotto) e La acuto (sopra)', 'Ledger lines: middle C (below) and high A (above)') } },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('F', 4), 'whole'), n(p('A', 4), 'whole'), n(p('C', 5), 'whole'), n(p('E', 5), 'whole')], playable: true, caption: t2('Le quattro note negli spazi della chiave di violino: Fa La Do Mi', 'The four space notes in the treble clef: F A C E') } },
      { kind: 'text', text: t2('Le stesse sette note si ripetono in registri sempre più acuti o più gravi, e ogni ripetizione dista un’ottava. Per indicare con precisione QUALE Do (o Re, o Mi…) si usa un numero, la cosiddetta notazione scientifica: il Do centrale è Do4, il Do dell’ottava sopra è Do5, quello sotto è Do3. Così “La4” indica un La ben preciso, non uno qualsiasi.', 'The same seven notes repeat in ever higher or lower registers, and each repetition is an octave apart. To say precisely WHICH C (or D, or E…) you mean, so-called scientific notation uses a number: middle C is C4, the C an octave higher is C5, the one below is C3. So “A4” names one precise A, not just any.') },
      { kind: 'tip', intent: 'curiosity', text: t2('I nomi Do-Re-Mi-Fa-Sol-La nascono nell’XI secolo: Guido d’Arezzo prese le prime sillabe dei versi di un inno a San Giovanni (“Ut queant laxis…”), ognuno cantato un gradino più in alto. “Ut” fu poi cambiato in “Do” (più facile da cantare) e il “Si” fu aggiunto dalle iniziali di “Sancte Iohannes”. I paesi anglosassoni usano invece le lettere A-G.', 'The names Do-Re-Mi-Fa-Sol-La were born in the 11th century: Guido of Arezzo took the first syllables of the lines of a hymn to St John (“Ut queant laxis…”), each sung one step higher. “Ut” was later changed to “Do” (easier to sing) and “Si” was added from the initials of “Sancte Iohannes”. English-speaking countries use the letters A-G instead.') },
    ],
    quiz: [
      { prompt: t2('Quante sono le note?', 'How many notes are there?'), options: [same('5'), same('7'), same('8')], correctIndex: 1 },
      identify(p('E', 4)),
      identify(p('G', 4)),
      { prompt: t2('La distanza tra una nota e la sua ripetizione più acuta si chiama…', 'The distance between a note and its higher repetition is called an…'), options: [t2('Ottava', 'Octave'), t2('Terza', 'Third'), t2('Quinta', 'Fifth')], correctIndex: 0 },
      { prompt: t2('Le righe aggiuntive per le note molto acute o gravi si chiamano…', 'The extra lines for very high or low notes are called…'), options: [t2('Stanghette', 'Barlines'), t2('Tagli addizionali', 'Ledger lines'), t2('Chiavi', 'Clefs')], correctIndex: 1 },
      identify(p('F', 4)),
      { prompt: t2('Come si indica il Do centrale nella notazione scientifica?', 'How is middle C written in scientific notation?'), options: [t2('Do4', 'C4'), t2('Do3', 'C3'), t2('Do5', 'C5')], correctIndex: 0 },
    ],
  },

  'valori-note': {
    id: 'valori-note',
    blocks: [
      { kind: 'text', text: t2('Mentre la posizione sul rigo dice QUALE nota suonare, la forma della nota dice QUANTO a lungo tenerla. Ogni figura (testa, gambo, eventuali code) indica una durata diversa.', 'While the position on the staff tells you WHICH note to play, the shape of the note tells you HOW LONG to hold it. Each figure (notehead, stem, possible flags) indicates a different duration.') },
      { kind: 'list', items: [t2('Semibreve: testa vuota senza gambo — il valore più lungo (4 movimenti in 4/4)', 'Whole note: an empty head with no stem — the longest value (4 beats in 4/4)'), t2('Minima: testa vuota con gambo (2 movimenti)', 'Half note: an empty head with a stem (2 beats)'), t2('Semiminima: testa piena con gambo (1 movimento)', 'Quarter note: a filled head with a stem (1 beat)'), t2('Croma: testa piena, gambo e una coda (½ movimento)', 'Eighth note: a filled head, stem and one flag (½ beat)'), t2('Semicroma: testa piena, gambo e due code (¼ di movimento)', 'Sixteenth note: a filled head, stem and two flags (¼ beat)')] },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('B', 4), 'whole'), n(p('B', 4), 'half'), n(p('B', 4), 'quarter'), n(p('B', 4), 'eighth'), n(p('B', 4), '16th')], caption: t2('Semibreve, minima, semiminima, croma, semicroma', 'Whole, half, quarter, eighth, sixteenth') } },
      { kind: 'tip', intent: 'tip', text: t2('Ogni valore dura esattamente la metà del precedente: 1 semibreve = 2 minime = 4 semiminime = 8 crome = 16 semicrome. Immaginalo come un albero che si dimezza a ogni ramo: ti aiuta a contare al volo.', 'Each value lasts exactly half the previous one: 1 whole = 2 halves = 4 quarters = 8 eighths = 16 sixteenths. Picture a tree that halves at every branch — it helps you count on the fly.') },
      { kind: 'callout', text: t2('Quando ci sono più crome o semicrome vicine, le loro code si uniscono in travature (linee orizzontali) per rendere la lettura del ritmo più chiara.', 'When several eighth or sixteenth notes are next to each other, their flags join into beams (horizontal lines) to make the rhythm easier to read.') },
      { kind: 'text', text: t2('La serie può continuare: la biscroma (tre code) vale metà della semicroma, e si può ancora dimezzare. Una cosa, invece, non cambia il suono: il GAMBO. Punta verso l’alto quando la nota sta sotto la riga centrale e verso il basso quando sta sopra — è solo una convenzione grafica per tenere i gambi dentro al rigo.', 'The series can continue: the thirty-second note (three flags) is worth half a sixteenth, and you can keep halving. One thing, though, does NOT change the sound: the STEM. It points up when the note is below the middle line and down when it is above — just a graphic convention to keep stems inside the staff.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('G', 4)), n(p('B', 4)), n(p('D', 5)), n(p('F', 5))], playable: true, caption: t2('Il gambo: in su sotto la riga centrale, in giù sopra', 'The stem: up below the middle line, down above') } },
      { kind: 'tip', intent: 'curiosity', text: t2('I nomi italiani raccontano una storia: “semibreve” significa “mezza-breve”, perché un tempo esistevano figure ancora più lunghe (la breve e la lunga). La semibreve, oggi la più lunga in uso, era in origine una delle più corte!', 'The Italian names tell a story: “semibreve” means “half-breve”, because even longer figures once existed (the breve and the long). The whole note — today the longest in common use — was originally one of the shortest!') },
    ],
    quiz: [
      { prompt: t2('In 4/4, quanti movimenti dura una semibreve?', 'In 4/4, how many beats does a whole note last?'), options: [same('1'), same('2'), same('4')], correctIndex: 2 },
      { prompt: t2('La minima vale quante semiminime?', 'A half note equals how many quarter notes?'), options: [same('1'), same('2'), same('4')], correctIndex: 1 },
      { prompt: t2('Quante semicrome stanno in una semiminima?', 'How many sixteenth notes fit in a quarter note?'), options: [same('2'), same('4'), same('8')], correctIndex: 1 },
      { prompt: t2('Quale valore dura di meno?', 'Which value is the shortest?'), options: [t2('Semiminima', 'Quarter'), t2('Croma', 'Eighth'), t2('Semicroma', 'Sixteenth')], correctIndex: 2 },
      { prompt: t2('Che valore è questo?', 'What value is this?'), staff: { clef: 'treble', elements: [n(p('B', 4), 'half')], playable: true }, options: [t2('Semibreve', 'Whole'), t2('Minima', 'Half'), t2('Semiminima', 'Quarter')], correctIndex: 1 },
      { prompt: t2('Da che parte va il gambo di una nota che sta SOPRA la riga centrale?', 'Which way does the stem of a note ABOVE the middle line point?'), options: [t2('Verso il basso', 'Downward'), t2('Verso l’alto', 'Upward')], correctIndex: 0 },
      { prompt: t2('Quante semicrome valgono come una semibreve?', 'How many sixteenth notes equal a whole note?'), options: [same('8'), same('16'), same('4')], correctIndex: 1 },
    ],
  },

  pause: {
    id: 'pause',
    blocks: [
      { kind: 'text', text: t2('Anche il silenzio fa parte della musica: le pause indicano per quanto tempo NON si suona. A ogni valore di nota corrisponde una pausa della stessa durata, con un simbolo dedicato.', 'Silence is part of music too: rests show how long NOT to play. Every note value has a matching rest of the same duration, with its own symbol.') },
      { kind: 'staff', example: { clef: 'treble', elements: [r('whole'), r('half'), r('quarter'), r('eighth')], caption: t2('Pausa di semibreve, di minima, di semiminima, di croma', 'Whole, half, quarter and eighth rests') } },
      { kind: 'tip', intent: 'tip', text: t2('Le pause di semibreve e di minima si somigliano: la pausa di semibreve “pende” sotto la quarta riga (come un cappello appeso), quella di minima “sta seduta” sopra la terza riga. Trucco: la pausa di semibreve è più “pesante” e cade giù; la minima è più “leggera” e galleggia su.', 'The whole and half rests look alike: the whole rest “hangs” under the fourth line (like a hat on a hook), the half rest “sits” on top of the third line. Trick: the whole rest is heavier and falls down; the half rest is lighter and floats up.') },
      { kind: 'callout', text: t2('Una pausa di semibreve, oltre a valere 4 movimenti, è usata anche per indicare un’intera battuta di silenzio, qualunque sia l’indicazione di tempo.', 'Besides being worth 4 beats, a whole rest is also used to mean a whole measure of silence, whatever the time signature.') },
      { kind: 'text', text: t2('La serie delle pause prosegue come quella delle note: dopo la pausa di croma viene quella di semicroma (con due uncini), poi di biscroma, dimezzando ogni volta. Anche le pause possono avere il punto di valore, che ne allunga la durata della metà.', 'The series of rests continues like the notes’: after the eighth rest comes the sixteenth rest (with two hooks), then the thirty-second, halving each time. Rests can take an augmentation dot too, which lengthens them by half.') },
      { kind: 'tip', intent: 'tip', text: t2('Durante una pausa NON si smette di contare: il tempo scorre comunque. Continua a battere i movimenti nella testa (o con il piede), così rientri esattamente al momento giusto. Una pausa sbagliata rovina il ritmo più di una nota sbagliata.', 'During a rest you do NOT stop counting: time keeps flowing. Keep tapping the beats in your head (or with your foot) so you come back in at exactly the right moment. A wrong rest ruins the rhythm more than a wrong note.') },
      { kind: 'tip', intent: 'curiosity', text: t2('Le pause non sono “musica che manca”: sono musica vera. Un silenzio ben piazzato crea attesa e tensione. Il compositore Claude Debussy diceva che “la musica è lo spazio tra le note”.', 'Rests are not “missing music”: they are music itself. A well-placed silence creates anticipation and tension. The composer Claude Debussy is said to have remarked that “music is the space between the notes.”') },
    ],
    quiz: [
      { prompt: t2('La pausa indica…', 'A rest indicates…'), options: [t2('Un suono lungo', 'A long sound'), t2('Un silenzio', 'A silence'), t2('Una nota acuta', 'A high note')], correctIndex: 1 },
      { prompt: t2('La pausa di semiminima dura quanto…', 'A quarter rest lasts as long as…'), options: [t2('Una semiminima', 'A quarter note'), t2('Una minima', 'A half note'), t2('Una semibreve', 'A whole note')], correctIndex: 0 },
      { prompt: t2('Quale pausa “pende” sotto la riga?', 'Which rest “hangs” under the line?'), options: [t2('Di semibreve', 'The whole rest'), t2('Di minima', 'The half rest')], correctIndex: 0 },
      { prompt: t2('Anche i silenzi hanno una durata precisa.', 'Silences have a precise duration too.'), options: VERO_FALSO, correctIndex: 0 },
      { prompt: t2('Durante una pausa, la pulsazione (il tempo)…', 'During a rest, the beat…'), options: [t2('Continua a scorrere', 'Keeps flowing'), t2('Si ferma', 'Stops')], correctIndex: 0 },
      { prompt: t2('A ogni valore di nota corrisponde una pausa di pari durata.', 'Every note value has a matching rest of equal duration.'), options: VERO_FALSO, correctIndex: 0 },
    ],
  },

  'punto-legatura': {
    id: 'punto-legatura',
    blocks: [
      { kind: 'text', text: t2('Il punto di valore si mette a destra della nota e ne aumenta la durata della metà. Una minima (2 movimenti) col punto vale quindi 3 movimenti (2 + 1); una semiminima col punto vale 1 movimento e mezzo.', 'The augmentation dot is placed to the right of a note and increases its duration by half. A half note (2 beats) with a dot is therefore worth 3 beats (2 + 1); a dotted quarter note is worth one and a half beats.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('D', 5), 'half', 1)], playable: true, caption: t2('Minima col punto: vale 3 movimenti', 'Dotted half note: worth 3 beats') } },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('G', 4), 'quarter', 1), n(p('A', 4), 'eighth'), n(p('G', 4), 'half')], playable: true, caption: t2('Ritmo puntato: semiminima col punto (1½) + croma (½) + minima', 'Dotted rhythm: dotted quarter (1½) + eighth (½) + half note') } },
      { kind: 'text', text: t2('Per contare un valore puntato somma la nota e il punto: una semiminima col punto dura un movimento e mezzo, così la croma che la segue cade sulla seconda metà del secondo movimento. È il classico ritmo “lungo-corto” di tante melodie, marce e inni.', 'To count a dotted value, add the note and the dot: a dotted quarter lasts one and a half beats, so the eighth that follows lands on the second half of the second beat. It’s the classic “long-short” rhythm of many tunes, marches and anthems.') },
      { kind: 'tip', intent: 'tip', text: t2('Regola lampo: il punto aggiunge sempre METÀ del valore della nota. Esiste anche il doppio punto, che aggiunge la metà più un quarto (es. minima con doppio punto = 2 + 1 + ½ = 3 movimenti e mezzo).', 'Quick rule: the dot always adds HALF the note’s value. There is also a double dot, which adds the half plus a quarter (e.g. a double-dotted half note = 2 + 1 + ½ = three and a half beats).') },
      { kind: 'text', text: t2('La legatura di valore è una linea curva che unisce due note della stessa altezza: si suona una sola nota lunga, sommando le durate. Serve soprattutto per “far durare” una nota oltre la stanghetta, da una battuta a quella successiva.', 'The tie is a curved line joining two notes of the same pitch: you play a single long note, adding the durations. It is used above all to “carry” a note past the barline, from one measure into the next.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('E', 4), 'quarter', 0, { tie: 'start' }), n(p('E', 4), 'quarter', 0, { tie: 'stop' }), n(p('G', 4), 'half')], playable: true, caption: t2('Due Mi legati: una sola nota lunga (2 movimenti)', 'Two tied E’s: a single long note (2 beats)') } },
      { kind: 'callout', text: t2('Attenzione a non confonderle: la legatura di valore unisce note UGUALI e ne somma la durata. La legatura di portamento (slur) collega invece note di altezza DIVERSA e si suona “legato”, cioè morbido e senza stacchi.', 'Don’t confuse them: the tie joins IDENTICAL notes and adds their durations. The slur instead connects notes of DIFFERENT pitch and is played “legato”, i.e. smoothly and without gaps.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 5), 'quarter', 0, { slur: 'start' }), n(p('D', 5), 'quarter'), n(p('E', 5), 'quarter', 0, { slur: 'stop' }), r('quarter')], playable: true, caption: t2('Legatura di portamento (legato): note diverse collegate', 'Slur (legato): different notes connected') } },
    ],
    quiz: [
      { prompt: t2('Una minima col punto vale quanti movimenti?', 'How many beats is a dotted half note?'), options: [same('2'), same('3'), same('4')], correctIndex: 1 },
      { prompt: t2('Il punto di valore aggiunge alla nota…', 'The dot adds to the note…'), options: [t2('La metà del suo valore', 'Half its value'), t2('Il doppio', 'Double'), t2('Un quarto', 'A quarter')], correctIndex: 0 },
      { prompt: t2('Una semiminima col punto quanti movimenti vale?', 'How many beats is a dotted quarter note?'), options: [t2('Uno', 'One'), t2('Uno e mezzo', 'One and a half'), t2('Due', 'Two')], correctIndex: 1 },
      { prompt: t2('La legatura di valore unisce due note…', 'The tie joins two notes…'), options: [t2('Di altezza diversa', 'Of different pitch'), t2('Della stessa altezza', 'Of the same pitch')], correctIndex: 1 },
      { prompt: t2('Nel ritmo “semiminima col punto + croma”, quanti movimenti occupano insieme le due figure?', 'In the “dotted quarter + eighth” rhythm, how many beats do the two figures take together?'), options: [same('1'), same('2'), same('3')], correctIndex: 1, explanation: t2('1½ + ½ = 2 movimenti.', '1½ + ½ = 2 beats.') },
    ],
  },

  'tempo-battuta': {
    id: 'tempo-battuta',
    blocks: [
      { kind: 'text', text: t2('Le stanghette verticali dividono il pentagramma in battute (o misure): piccoli contenitori che raggruppano i movimenti in modo regolare. L’indicazione di tempo, scritta come una frazione subito dopo la chiave, dice quanti movimenti entrano in ogni battuta e quale figura vale un movimento.', 'Vertical barlines divide the staff into measures (bars): small containers that group the beats regularly. The time signature, written as a fraction right after the clef, tells how many beats go in each measure and which figure is worth one beat.') },
      { kind: 'list', items: [t2('Il numero in alto: quanti movimenti per battuta', 'Top number: how many beats per measure'), t2('Il numero in basso: il valore di un movimento (4 = semiminima, 8 = croma)', 'Bottom number: the value of one beat (4 = quarter, 8 = eighth)')] },
      { kind: 'staff', example: { clef: 'treble', timeSignature: { beats: 4, beatType: 4 }, elements: [n(p('C', 5)), n(p('C', 5)), n(p('C', 5)), n(p('C', 5))], caption: t2('4/4: quattro movimenti da una semiminima ciascuno', '4/4: four beats, each a quarter note') } },
      { kind: 'staff', example: { clef: 'treble', timeSignature: { beats: 3, beatType: 4 }, elements: [n(p('C', 5)), n(p('C', 5)), n(p('C', 5))], caption: t2('3/4: tre movimenti (il tempo del valzer)', '3/4: three beats (waltz time)') } },
      { kind: 'staff', example: { clef: 'treble', timeSignature: { beats: 2, beatType: 4 }, elements: [n(p('C', 5)), n(p('C', 5))], caption: t2('2/4: due movimenti (il passo della marcia)', '2/4: two beats (march time)') } },
      { kind: 'staff', example: { clef: 'treble', timeSignature: { beats: 6, beatType: 8 }, elements: [n(p('C', 5), 'eighth'), n(p('D', 5), 'eighth'), n(p('E', 5), 'eighth'), n(p('F', 5), 'eighth'), n(p('G', 5), 'eighth'), n(p('A', 5), 'eighth')], caption: t2('6/8: sei crome in due gruppi da tre (si conta in due)', '6/8: six eighths in two groups of three (felt in two)') } },
      { kind: 'text', text: t2('I tempi si dividono in semplici e composti. Nei tempi semplici (2/4, 3/4, 4/4) ogni movimento si divide naturalmente in due; nei tempi composti (6/8, 9/8, 12/8) ogni movimento si divide in tre, e il numero in alto conta le suddivisioni, non i movimenti reali. Ecco perché il 6/8 si “sente” in due, non in sei.', 'Time signatures are either simple or compound. In simple time (2/4, 3/4, 4/4) each beat naturally splits in two; in compound time (6/8, 9/8, 12/8) each beat splits in three, and the top number counts the subdivisions, not the actual beats. That’s why 6/8 is “felt” in two, not six.') },
      { kind: 'callout', text: t2('A volte un brano non comincia sul primo movimento: le note iniziali “in levare” formano l’anacrusi (o battuta in levare), una battuta incompleta che di solito si completa con l’ultima del brano.', 'Sometimes a piece doesn’t begin on the first beat: the opening notes “on the upbeat” form the anacrusis (or pickup), an incomplete measure that is usually completed by the last bar of the piece.') },
      { kind: 'tip', intent: 'tip', text: t2('Il 4/4 è così frequente da essere chiamato “tempo ordinario” e si scrive anche con una “C”. Attenzione al 6/8: si conta in due, non in sei — i sei ottavi si raggruppano in due gruppi da tre (ONE-due-tre DUE-due-tre), dando quel caratteristico ritmo “ondeggiante”.', 'The 4/4 is so common that it is called “common time” and is also written with a “C”. Watch out for 6/8: it is felt in two, not six — the six eighths group into two sets of three (ONE-two-three TWO-two-three), giving that characteristic “swaying” rhythm.') },
      { kind: 'tip', intent: 'curiosity', text: t2('Quella “C” del tempo ordinario NON sta per “Common”: è un cerchio spezzato! Nella notazione medievale il cerchio completo (○) indicava il tempo “perfetto”, ternario, simbolo di completezza (la Trinità); il cerchio incompleto, simile a una C, indicava il tempo “imperfetto”, binario. La C tagliata (₵) significa invece “alla breve”, cioè conta in due.', 'That “C” of common time does NOT stand for “Common”: it’s a broken circle! In medieval notation the full circle (○) meant “perfect”, triple time, a symbol of completeness (the Trinity); the incomplete circle, shaped like a C, meant “imperfect”, duple time. The cut C (₵) instead means “alla breve”, i.e. counted in two.') },
    ],
    quiz: [
      { prompt: t2('In 3/4, quanti movimenti entrano in una battuta?', 'In 3/4, how many beats fit in a measure?'), options: [same('2'), same('3'), same('4')], correctIndex: 1 },
      { prompt: t2('Il numero in alto dell’indicazione di tempo indica…', 'The top number of the time signature indicates…'), options: [t2('Il valore di un movimento', 'The value of a beat'), t2('Quanti movimenti per battuta', 'How many beats per measure')], correctIndex: 1 },
      { prompt: t2('Il numero in basso “4” significa che il movimento è una…', 'A bottom number of “4” means the beat is a…'), options: [t2('Semibreve', 'Whole note'), t2('Semiminima', 'Quarter note'), t2('Croma', 'Eighth note')], correctIndex: 1 },
      { prompt: t2('Che cosa separa due battute?', 'What separates two measures?'), options: [t2('La stanghetta', 'The barline'), t2('La chiave', 'The clef')], correctIndex: 0 },
      { prompt: t2('Quanti movimenti ha questa battuta?', 'How many beats does this measure have?'), staff: { clef: 'treble', timeSignature: { beats: 4, beatType: 4 }, elements: [n(p('G', 4)), n(p('G', 4)), n(p('G', 4)), n(p('G', 4))], playable: true }, options: [same('3'), same('4'), same('5')], correctIndex: 1 },
      { prompt: t2('Il 6/8 di solito si conta…', '6/8 is usually counted…'), options: [t2('In due', 'In two'), t2('In sei', 'In six'), t2('In tre', 'In three')], correctIndex: 0, explanation: t2('Due gruppi da tre crome.', 'Two groups of three eighths.') },
      { prompt: t2('Le note iniziali “in levare”, prima del primo movimento pieno, formano…', 'The opening notes “on the upbeat”, before the first full beat, form…'), options: [t2('L’anacrusi', 'The anacrusis'), t2('La coda', 'The coda'), t2('Il ritornello', 'The refrain')], correctIndex: 0 },
    ],
  },

  alterazioni: {
    id: 'alterazioni',
    blocks: [
      { kind: 'text', text: t2('Le alterazioni cambiano l’altezza di una nota di un semitono, la distanza più piccola della musica occidentale (sul pianoforte, due tasti adiacenti, bianco o nero). Si scrivono SUBITO PRIMA della nota.', 'Accidentals change a note’s pitch by a semitone, the smallest distance in Western music (on the piano, two adjacent keys, white or black). They are written JUST BEFORE the note.') },
      { kind: 'list', items: [t2('Diesis (♯): alza la nota di un semitono', 'Sharp (♯): raises the note by a semitone'), t2('Bemolle (♭): abbassa la nota di un semitono', 'Flat (♭): lowers the note by a semitone'), t2('Bequadro (♮): annulla un diesis o un bemolle precedente, riportando la nota “naturale”', 'Natural (♮): cancels a previous sharp or flat, restoring the “natural” note')] },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 5)), n(p('C', 5, 'sharp')), n(p('C', 5, 'natural'))], playable: true, caption: t2('Do, Do diesis, Do bequadro', 'C, C sharp, C natural') } },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('B', 4)), n(p('B', 4, 'flat')), n(p('B', 4, 'natural'))], playable: true, caption: t2('Si, Si bemolle, Si bequadro', 'B, B flat, B natural') } },
      { kind: 'text', text: t2('Oltre alle alterazioni semplici esistono il doppio diesis (𝄪), che alza di due semitoni (un tono intero), e il doppio bemolle (♭♭), che abbassa di un tono. Sono rari, ma in certe tonalità servono a mantenere coerente il nome delle note.', 'Besides the single accidentals there are the double sharp (𝄪), which raises by two semitones (a whole tone), and the double flat (♭♭), which lowers by a whole tone. They are rare, but in some keys they keep the note names consistent.') },
      { kind: 'callout', text: t2('Un’alterazione vale per tutta la battuta in cui compare, e solo per quella riga/spazio: dopo la stanghetta la nota torna naturale. Lo stesso suono può avere due nomi (Do♯ = Re♭): si chiamano note “enarmoniche”.', 'An accidental applies for the whole measure where it appears, and only on that line/space: after the barline the note returns to natural. The same sound can have two names (C♯ = D♭): these are called “enharmonic” notes.') },
      { kind: 'tip', intent: 'tip', text: t2('Alterazione “di cortesia” (o di precauzione): a volte trovi un bequadro tra parentesi su una nota che sarebbe già naturale dopo la stanghetta. Non cambia nulla nel suono, serve solo a rassicurare l’occhio del lettore. La musica è piena di questi piccoli aiuti.', 'Courtesy (or cautionary) accidental: sometimes you’ll find a natural in brackets on a note that would already be natural after the barline. It changes nothing in the sound — it’s only there to reassure the reader’s eye. Music is full of these little helpers.') },
      { kind: 'tip', intent: 'curiosity', text: t2('I nomi italiani svelano la storia: anticamente la nota Si poteva essere cantata in due modi — “B durum” (Si duro), scritto con una b squadrata, e “B molle” (Si morbido), scritto con una b tonda. Da qui “bequadro” (b-quadra → ♮ e ♯) e “bemolle” (b-molle → ♭). Il simbolo del bemolle è proprio una “b” arrotondata!', 'The Italian names reveal the history: long ago the note B could be sung two ways — “B durum” (hard B), written with a square b, and “B molle” (soft B), written with a round b. Hence “bequadro” (square b → ♮ and ♯) and “bemolle” (soft b → ♭). The flat symbol is indeed a rounded “b”!') },
    ],
    quiz: [
      { prompt: t2('Il diesis (♯)…', 'The sharp (♯)…'), options: [t2('Alza di un semitono', 'Raises by a semitone'), t2('Abbassa di un semitono', 'Lowers by a semitone'), t2('Annulla', 'Cancels')], correctIndex: 0 },
      { prompt: t2('Il bemolle (♭)…', 'The flat (♭)…'), options: [t2('Alza di un semitono', 'Raises by a semitone'), t2('Abbassa di un semitono', 'Lowers by a semitone')], correctIndex: 1 },
      { prompt: t2('Il bequadro (♮) serve a…', 'The natural (♮) is used to…'), options: [t2('Annullare un’alterazione', 'Cancel an accidental'), t2('Raddoppiare la durata', 'Double the duration')], correctIndex: 0 },
      { prompt: t2('Do♯ e Re♭ sono lo stesso suono con due nomi: si dicono…', 'C♯ and D♭ are the same sound with two names: they are called…'), options: [t2('Enarmonici', 'Enharmonic'), t2('Cromatici', 'Chromatic'), t2('Diatonici', 'Diatonic')], correctIndex: 0 },
      { prompt: t2('Quale alterazione vedi su questa nota?', 'Which accidental do you see on this note?'), staff: { clef: 'treble', elements: [n(p('F', 5, 'sharp'))], playable: true }, options: [t2('Diesis', 'Sharp'), t2('Bemolle', 'Flat'), t2('Bequadro', 'Natural')], correctIndex: 0 },
      { prompt: t2('Di quanto alza la nota il doppio diesis?', 'By how much does a double sharp raise a note?'), options: [t2('Un tono (due semitoni)', 'A whole tone (two semitones)'), t2('Un semitono', 'A semitone'), t2('Tre semitoni', 'Three semitones')], correctIndex: 0 },
      { prompt: t2('Un’alterazione scritta su una nota resta valida…', 'An accidental written on a note stays in effect…'), options: [t2('Fino alla fine della battuta', 'Until the end of the measure'), t2('Fino alla fine del brano', 'Until the end of the piece')], correctIndex: 0 },
    ],
  },

  'armature-scale': {
    id: 'armature-scale',
    blocks: [
      { kind: 'text', text: t2('Una scala maggiore è una “scaletta” di sette note che segue sempre lo stesso schema di toni (T) e semitoni (S): T–T–S–T–T–T–S. Partendo da Do si usano solo i tasti bianchi; partendo da altre note servono alcune alterazioni per rispettare lo schema.', 'A major scale is a “ladder” of seven notes that always follows the same pattern of tones (T) and semitones (S): T–T–S–T–T–T–S. Starting from C you use only the white keys; starting from other notes you need some accidentals to keep the pattern.') },
      { kind: 'text', text: t2('Per non riscrivere le stesse alterazioni a ogni nota, le si raccoglie all’inizio del rigo, subito dopo la chiave: è l’armatura di chiave, valida per tutto il brano. Ogni tonalità maggiore ha la sua: Do maggiore nessuna alterazione, Sol maggiore un diesis (Fa♯), Fa maggiore un bemolle (Si♭).', 'To avoid rewriting the same accidentals on every note, they are gathered at the start of the staff, right after the clef: this is the key signature, valid for the whole piece. Each major key has its own: C major no accidentals, G major one sharp (F♯), F major one flat (B♭).') },
      { kind: 'staff', example: { clef: 'treble', keySignature: { fifths: 1 }, elements: majorScale(1, 4).map((pp) => n(pp)), playable: true, caption: t2('Sol maggiore: un diesis in armatura (Fa♯)', 'G major: one sharp in the key signature (F♯)') } },
      { kind: 'staff', example: { clef: 'treble', keySignature: { fifths: -1 }, elements: majorScale(-1, 4).map((pp) => n(pp)), playable: true, caption: t2('Fa maggiore: un bemolle in armatura (Si♭)', 'F major: one flat in the key signature (B♭)') } },
      { kind: 'staff', example: { clef: 'treble', keySignature: { fifths: 2 }, elements: majorScale(2, 4).map((pp) => n(pp)), playable: true, caption: t2('Re maggiore: due diesis (Fa♯ e Do♯)', 'D major: two sharps (F♯ and C♯)') } },
      { kind: 'text', text: t2('I sette gradi della scala hanno un nome e una funzione. I tre più importanti: il 1° grado è la tonica (la nota “di casa”, dà il nome alla tonalità), il 5° è la dominante (crea una tensione che chiede di tornare alla tonica) e il 7° è la sensibile (a un semitono dalla tonica, ci “tira” verso di essa). Sono questi rapporti a far sentire una melodia conclusa oppure ancora sospesa.', 'The seven scale degrees each have a name and a function. The three most important: the 1st degree is the tonic (the “home” note, it names the key), the 5th is the dominant (it creates a tension that asks to return to the tonic) and the 7th is the leading tone (a semitone from the tonic, it “pulls” toward it). These relationships are what make a melody feel finished or still suspended.') },
      { kind: 'tip', intent: 'tip', text: t2('I diesis compaiono sempre in quest’ordine: Fa Do Sol Re La Mi Si. I bemolle nell’ordine inverso: Si Mi La Re Sol Do Fa. Trucchi: con i diesis, l’ULTIMO diesis è un semitono sotto il nome della tonalità (un Re♯ in armatura → Mi maggiore). Con i bemolle, il PENULTIMO bemolle È il nome della tonalità (…Si♭ Mi♭ → Si♭ maggiore).', 'Sharps always appear in this order: F C G D A E B. Flats in reverse: B E A D G C F. Tricks: with sharps, the LAST sharp is a semitone below the key name (a D♯ in the signature → E major). With flats, the SECOND-TO-LAST flat IS the key name (…B♭ E♭ → B♭ major).') },
      { kind: 'tip', intent: 'curiosity', text: t2('Le tonalità si dispongono nel “circolo delle quinte”: salendo di quinta ogni volta (Do→Sol→Re→La…) si aggiunge un diesis; scendendo (Do→Fa→Si♭…) si aggiunge un bemolle. È una bussola che i musicisti usano per orientarsi tra le tonalità e gli accordi.', 'The keys lay out on the “circle of fifths”: going up a fifth each time (C→G→D→A…) adds a sharp; going down (C→F→B♭…) adds a flat. It is a compass musicians use to navigate keys and chords.') },
    ],
    quiz: [
      { prompt: t2('La scala maggiore segue lo schema di toni e semitoni…', 'The major scale follows the pattern of tones and semitones…'), options: [t2('T–T–S–T–T–T–S', 'T–T–S–T–T–T–S'), t2('T–S–T–T–S–T–T', 'T–S–T–T–S–T–T'), t2('tutti toni', 'all tones')], correctIndex: 0 },
      { prompt: t2('Quante alterazioni ha l’armatura di Sol maggiore?', 'How many accidentals does G major’s key signature have?'), options: [same('0'), same('1'), same('2')], correctIndex: 1, explanation: t2('Un solo diesis: Fa♯.', 'A single sharp: F♯.') },
      { prompt: t2('Qual è l’ordine dei diesis in armatura?', 'What is the order of sharps in a key signature?'), options: [t2('Fa Do Sol Re La Mi Si', 'F C G D A E B'), t2('Do Re Mi Fa Sol La Si', 'C D E F G A B'), t2('Si Mi La Re Sol Do Fa', 'B E A D G C F')], correctIndex: 0 },
      { prompt: t2('L’armatura di chiave vale…', 'The key signature applies…'), options: [t2('Solo per la prima battuta', 'Only to the first measure'), t2('Per tutto il brano', 'To the whole piece')], correctIndex: 1 },
      { prompt: t2('Quante alterazioni vedi in questa armatura?', 'How many accidentals in this key signature?'), staff: { clef: 'treble', keySignature: { fifths: -1 }, elements: [n(p('F', 4), 'whole')] }, options: [same('1'), same('2'), same('3')], correctIndex: 0, explanation: t2('Fa maggiore: un bemolle (Si♭).', 'F major: one flat (B♭).') },
      { prompt: t2('Quanti diesis ha l’armatura di Re maggiore?', 'How many sharps does D major’s key signature have?'), options: [same('1'), same('2'), same('3')], correctIndex: 1, explanation: t2('Fa♯ e Do♯.', 'F♯ and C♯.') },
      { prompt: t2('Il 1° grado della scala, la nota “di casa”, si chiama…', 'The 1st scale degree, the “home” note, is called the…'), options: [t2('Tonica', 'Tonic'), t2('Dominante', 'Dominant'), t2('Sensibile', 'Leading tone')], correctIndex: 0 },
    ],
  },

  intervalli: {
    id: 'intervalli',
    blocks: [
      { kind: 'text', text: t2('L’intervallo è la distanza tra due note. Si conta includendo entrambe le note ai due estremi: da Do a Mi ci sono Do-Re-Mi, quindi è una terza. La stessa nota ripetuta è un “unisono”.', 'An interval is the distance between two notes. You count including both notes at the ends: from C to E there are C-D-E, so it’s a third. The same note repeated is a “unison”.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4)), n(p('E', 4)), n(p('C', 4)), n(p('G', 4)), n(p('C', 4)), n(p('C', 5))], playable: true, caption: t2('Do–Mi (terza), Do–Sol (quinta), Do–Do (ottava)', 'C–E (third), C–G (fifth), C–C (octave)') } },
      { kind: 'list', items: [t2('Seconda: note vicine (Do–Re)', 'Second: adjacent notes (C–D)'), t2('Terza: salto di una nota (Do–Mi) — è la base degli accordi', 'Third: skip one note (C–E) — the basis of chords'), t2('Quarta e quinta: scheletro dell’armonia (Do–Fa, Do–Sol)', 'Fourth and fifth: the skeleton of harmony (C–F, C–G)'), t2('Sesta e settima: intervalli più ampi (Do–La, Do–Si)', 'Sixth and seventh: wider intervals (C–A, C–B)'), t2('Ottava: stessa nota, più acuta (Do–Do)', 'Octave: same note, higher (C–C)')] },
      { kind: 'text', text: t2('Contare i gradi dà il “numero” dell’intervallo (seconda, terza…), ma due intervalli con lo stesso numero possono avere ampiezza diversa: conta anche la QUALITÀ. Una terza maggiore (Do–Mi) misura 4 semitoni, una terza minore (Do–Mi♭) ne misura 3. Seconde, terze, seste e settime possono essere maggiori o minori; quarte, quinte e ottave si dicono invece “giuste”.', 'Counting the steps gives the interval’s “number” (second, third…), but two intervals with the same number can be different sizes: QUALITY matters too. A major third (C–E) spans 4 semitones, a minor third (C–E♭) spans 3. Seconds, thirds, sixths and sevenths can be major or minor; fourths, fifths and octaves are instead called “perfect”.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4)), n(p('E', 4)), n(p('C', 4)), n(p('E', 4, 'flat'))], playable: true, caption: t2('Terza maggiore (Do–Mi, 4 semitoni) e terza minore (Do–Mi♭, 3 semitoni)', 'Major third (C–E, 4 semitones) and minor third (C–E♭, 3 semitones)') } },
      { kind: 'text', text: t2('Infine, se le due note si suonano una dopo l’altra l’intervallo è melodico; se si suonano insieme è armonico. La distanza è la stessa: cambia solo il modo di eseguirle.', 'Finally, if the two notes are played one after the other the interval is melodic; if played together it’s harmonic. The distance is the same — only the way of playing them changes.') },
      { kind: 'tip', intent: 'tip', text: t2('Alcuni intervalli suonano “stabili e dolci” (consonanti: terza, quinta, ottava), altri “tesi” e bisognosi di risoluzione (dissonanti: seconda, settima). Per memorizzarli a orecchio, associa ogni intervallo all’inizio di una canzone che conosci.', 'Some intervals sound “stable and sweet” (consonant: third, fifth, octave), others “tense” and in need of resolution (dissonant: second, seventh). To learn them by ear, link each interval to the opening of a song you know.') },
      { kind: 'tip', intent: 'curiosity', text: t2('L’intervallo che divide esattamente a metà l’ottava (tre toni, il “tritono”, come Fa–Si) era soprannominato “diabolus in musica”, il diavolo nella musica. La leggenda che la Chiesa lo avesse “proibito” è però falsa: era semplicemente evitato perché instabile e difficile da intonare. Oggi è ovunque, dal jazz alle sigle dei film thriller.', 'The interval that splits the octave exactly in half (three whole tones, the “tritone”, like F–B) was nicknamed “diabolus in musica”, the devil in music. The legend that the Church “banned” it is false, though: it was simply avoided because it is unstable and hard to tune. Today it is everywhere, from jazz to thriller-movie themes.') },
    ],
    quiz: [
      { prompt: t2('Do–Mi è un intervallo di…', 'C–E is an interval of a…'), options: [t2('Seconda', 'Second'), t2('Terza', 'Third'), t2('Quarta', 'Fourth')], correctIndex: 1 },
      { prompt: t2('Do–Sol è una…', 'C–G is a…'), options: [t2('Quarta', 'Fourth'), t2('Quinta', 'Fifth'), t2('Sesta', 'Sixth')], correctIndex: 1 },
      { prompt: t2('Do–Do (più acuto) è una…', 'C–C (higher) is an…'), options: [t2('Settima', 'Seventh'), t2('Ottava', 'Octave')], correctIndex: 1 },
      { prompt: t2('Per contare un intervallo si includono…', 'To count an interval you include…'), options: [t2('Solo la nota d’arrivo', 'Only the top note'), t2('Entrambe le note', 'Both notes')], correctIndex: 1 },
      { prompt: t2('Il “diabolus in musica” è il soprannome del…', 'The “diabolus in musica” is the nickname of the…'), options: [t2('Tritono', 'Tritone'), t2('Unisono', 'Unison'), t2('Ottava', 'Octave')], correctIndex: 0 },
      { prompt: t2('Una terza maggiore (Do–Mi) misura…', 'A major third (C–E) spans…'), options: [t2('4 semitoni', '4 semitones'), t2('3 semitoni', '3 semitones'), t2('5 semitoni', '5 semitones')], correctIndex: 0 },
      { prompt: t2('Due note suonate INSIEME formano un intervallo…', 'Two notes played TOGETHER form an interval that is…'), options: [t2('Armonico', 'Harmonic'), t2('Melodico', 'Melodic')], correctIndex: 0 },
    ],
  },

  'dinamiche-articolazioni': {
    id: 'dinamiche-articolazioni',
    blocks: [
      { kind: 'text', text: t2('Le dinamiche indicano l’intensità del suono, cioè quanto suonare piano o forte. Sono indicazioni RELATIVE, non volumi assoluti: dicono “più forte di prima”, non “a 80 decibel”.', 'Dynamics indicate the intensity of the sound, i.e. how soft or loud to play. They are RELATIVE indications, not absolute volumes: they say “louder than before”, not “at 80 decibels”.') },
      { kind: 'list', items: [t2('pp pianissimo, p piano, mp mezzo piano (deboli)', 'pp pianissimo, p piano, mp mezzo piano (soft)'), t2('mf mezzo forte, f forte, ff fortissimo (intensi)', 'mf mezzo forte, f forte, ff fortissimo (loud)'), t2('< crescendo: aumentare gradualmente', '< crescendo: get gradually louder'), t2('> diminuendo (o decrescendo): diminuire gradualmente', '> diminuendo (or decrescendo): get gradually softer')] },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 5), 'quarter', 0, { dynamic: 'p' }), n(p('E', 5)), n(p('G', 5), 'quarter', 0, { dynamic: 'mf' }), n(p('C', 5), 'quarter', 0, { dynamic: 'f' })], playable: true, caption: t2('Dinamiche: piano (p), mezzo forte (mf), forte (f)', 'Dynamics: piano (p), mezzo forte (mf), forte (f)') } },
      { kind: 'text', text: t2('Le articolazioni dicono COME attaccare e collegare le note. Lo staccato (un puntino sopra o sotto la testa) le rende brevi e staccate; l’accento (>) le rende più decise; il tenuto (–) le tiene per tutto il loro valore; il legato collega le note in modo morbido.', 'Articulations tell HOW to attack and connect the notes. Staccato (a dot above or below the head) makes them short and detached; the accent (>) makes them stronger; tenuto (–) holds them for their full value; legato connects the notes smoothly.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('G', 4), 'quarter', 0, { articulations: ['staccato'] }), n(p('G', 4), 'quarter', 0, { articulations: ['accent'] }), n(p('G', 4), 'quarter', 0, { articulations: ['tenuto'] }), r('quarter')], playable: true, caption: t2('Articolazioni: staccato, accento, tenuto', 'Articulations: staccato, accent, tenuto') } },
      { kind: 'heading', text: t2('L’andatura (il “tempo”)', 'Tempo (the speed)') },
      { kind: 'text', text: t2('All’inizio del brano, sopra il rigo, una parola italiana indica l’andatura, cioè la velocità generale: dal più lento al più veloce — Largo, Adagio, Andante (“a passo d’uomo”), Moderato, Allegro, Presto. Spesso si aggiunge anche il valore preciso in battiti al minuto (BPM), per esempio ♩ = 120.', 'At the start of a piece, above the staff, an Italian word gives the tempo — the overall speed, from slowest to fastest: Largo, Adagio, Andante (“at a walking pace”), Moderato, Allegro, Presto. Often a precise value in beats per minute (BPM) is added too, e.g. ♩ = 120.') },
      { kind: 'list', items: [t2('sf / sfz (sforzato): un singolo attacco molto marcato', 'sf / sfz (sforzando): a single, strongly accented attack'), t2('fp: forte e subito piano', 'fp: loud, then immediately soft'), t2('Corona o fermata (𝄐): tieni la nota o la pausa più a lungo, a piacere', 'Fermata (𝄐): hold the note or rest longer, at will'), t2('rit. (ritardando) e accel. (accelerando): rallentare o accelerare gradualmente', 'rit. (ritardando) and accel. (accelerando): gradually slow down or speed up')] },
      { kind: 'tip', intent: 'tip', text: t2('Dinamiche e articolazioni non cambiano l’altezza né la durata scritta: sono ciò che trasforma le note giuste in vera MUSICA. Suonare “meccanicamente” corretto ma senza dinamica è come leggere ad alta voce senza alcuna intonazione.', 'Dynamics and articulations don’t change the written pitch or duration: they are what turns the right notes into real MUSIC. Playing “mechanically” correct but without dynamics is like reading aloud with no intonation at all.') },
      { kind: 'tip', intent: 'curiosity', text: t2('Perché questi termini sono in italiano (piano, forte, allegro, crescendo…)? Perché nel Seicento, quando dinamiche e tempi vennero codificati, i compositori italiani — Monteverdi, Corelli, Vivaldi, Scarlatti — dominavano la musica europea. Anche Bach e Beethoven li adottarono, e l’italiano è rimasto la “lingua internazionale” della musica.', 'Why are these terms in Italian (piano, forte, allegro, crescendo…)? Because in the 17th century, when dynamics and tempos were codified, Italian composers — Monteverdi, Corelli, Vivaldi, Scarlatti — dominated European music. Even Bach and Beethoven adopted them, and Italian has remained the “international language” of music.') },
    ],
    quiz: [
      { prompt: t2('Il segno “p” significa…', 'The sign “p” means…'), options: [t2('Piano (debole)', 'Piano (soft)'), t2('Forte', 'Loud')], correctIndex: 0 },
      { prompt: t2('Mettile in ordine dal più debole al più forte:', 'Put them in order from softest to loudest:'), options: [t2('p → mf → f', 'p → mf → f'), t2('f → mf → p', 'f → mf → p'), t2('mf → p → f', 'mf → p → f')], correctIndex: 0 },
      { prompt: t2('Lo staccato rende la nota…', 'Staccato makes the note…'), options: [t2('Breve e staccata', 'Short and detached'), t2('Lunga e legata', 'Long and connected')], correctIndex: 0 },
      { prompt: t2('Il crescendo (<) indica…', 'The crescendo (<) indicates…'), options: [t2('Diminuire il volume', 'Decrease the volume'), t2('Aumentare gradualmente il volume', 'Gradually increase the volume')], correctIndex: 1 },
      { prompt: t2('Le dinamiche indicano un volume…', 'Dynamics indicate a volume that is…'), options: [t2('Relativo (più o meno forte)', 'Relative (louder or softer)'), t2('Assoluto (in decibel)', 'Absolute (in decibels)')], correctIndex: 0 },
      { prompt: t2('Quale di questi indica un’andatura veloce?', 'Which of these marks a fast tempo?'), options: [t2('Allegro', 'Allegro'), t2('Adagio', 'Adagio'), t2('Largo', 'Largo')], correctIndex: 0 },
      { prompt: t2('La corona (fermata) su una nota indica di…', 'A fermata over a note means to…'), options: [t2('Tenerla più a lungo, a piacere', 'Hold it longer, at will'), t2('Suonarla staccata', 'Play it staccato')], correctIndex: 0 },
    ],
  },

  'scale-minori': {
    id: 'scale-minori',
    blocks: [
      { kind: 'text', text: t2('La scala minore ha un carattere più scuro, malinconico o drammatico rispetto alla maggiore. La differenza chiave è il terzo grado: nella minore è più basso (terza minore), ed è questo a darle il colore “triste”.', 'The minor scale has a darker, more melancholic or dramatic character than the major. The key difference is the third degree: in the minor it is lower (a minor third), and this is what gives it the “sad” colour.') },
      { kind: 'text', text: t2('La scala minore naturale segue lo schema: T–S–T–T–S–T–T. Partendo dal La si usano solo i tasti bianchi: La Si Do Re Mi Fa Sol La.', 'The natural minor scale follows this pattern: T–S–T–T–S–T–T. Starting from A you use only the white keys: A B C D E F G A.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('A', 4)), n(p('B', 4)), n(p('C', 5)), n(p('D', 5)), n(p('E', 5)), n(p('F', 5)), n(p('G', 5)), n(p('A', 5))], playable: true, caption: t2('La minore naturale: La Si Do Re Mi Fa Sol La', 'A natural minor: A B C D E F G A') } },
      { kind: 'text', text: t2('Alla scala minore naturale si affiancano due varianti molto usate. La minore armonica alza il 7° grado di un semitono (in La minore il Sol diventa Sol♯): nasce così la sensibile, la nota che “tira” verso la tonica e rende più convincente la chiusura.', 'The natural minor scale comes with two much-used variants. The harmonic minor raises the 7th degree by a semitone (in A minor, G becomes G♯): this creates the leading tone, the note that “pulls” toward the tonic and makes the cadence more convincing.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('A', 4)), n(p('B', 4)), n(p('C', 5)), n(p('D', 5)), n(p('E', 5)), n(p('F', 5)), n(p('G', 5, 'sharp')), n(p('A', 5))], playable: true, caption: t2('La minore armonica: 7° grado alzato (Sol♯)', 'A harmonic minor: raised 7th degree (G♯)') } },
      { kind: 'text', text: t2('La minore melodica alza il 6° e il 7° grado salendo (Fa♯ e Sol♯), per ammorbidire il salto che l’armonica crea fra il 6° e il 7° grado; scendendo, di solito torna naturale.', 'The melodic minor raises both the 6th and 7th degrees going up (F♯ and G♯), to smooth the leap the harmonic minor creates between the 6th and 7th; coming down, it usually returns to natural.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('A', 4)), n(p('B', 4)), n(p('C', 5)), n(p('D', 5)), n(p('E', 5)), n(p('F', 5, 'sharp')), n(p('G', 5, 'sharp')), n(p('A', 5))], playable: true, caption: t2('La minore melodica (salendo): 6° e 7° grado alzati (Fa♯, Sol♯)', 'A melodic minor (ascending): raised 6th and 7th (F♯, G♯)') } },
      { kind: 'text', text: t2('Ogni tonalità maggiore ha una “relativa minore” che usa le stesse note e la stessa armatura, ma parte da un’altra nota: la sesta della scala maggiore (una terza minore sotto la tonica). Do maggiore e La minore sono relative.', 'Each major key has a “relative minor” that uses the same notes and the same key signature, but starts on a different note: the sixth degree of the major scale (a minor third below the tonic). C major and A minor are relatives.') },
      { kind: 'staff', example: { clef: 'treble', elements: majorScale(0, 4).map((pp) => n(pp)), playable: true, caption: t2('Do maggiore: stesse note (nessuna alterazione) della relativa La minore', 'C major: same notes (no accidentals) as its relative A minor') } },
      { kind: 'tip', intent: 'tip', text: t2('Per trovare la relativa minore di una tonalità maggiore, scendi di tre semitoni (una terza minore): da Do scendi a La, da Sol a Mi, da Fa a Re. Condividono la stessa armatura, ma il “centro di gravità” è diverso.', 'To find the relative minor of a major key, go down three semitones (a minor third): from C to A, from G to E, from F to D. They share the same key signature, but the “centre of gravity” is different.') },
      { kind: 'callout', text: t2('Non confondere due parole simili: la relativa minore condivide l’armatura con la maggiore (Do magg. ↔ La min.), mentre l’omonima (o parallela) condivide la tonica ma cambia armatura (Do maggiore ↔ Do minore, che ha tre bemolle). Stessa “casa”, atmosfera opposta.', 'Don’t confuse two similar words: the relative minor shares the key signature with the major (C maj. ↔ A min.), while the parallel minor shares the tonic but changes key signature (C major ↔ C minor, which has three flats). Same “home”, opposite mood.') },
      { kind: 'tip', intent: 'curiosity', text: t2('Esistono tre forme di scala minore! Alla naturale si aggiungono la “armonica” (alza il settimo grado di un semitono, creando quel sapore esotico e drammatico) e la “melodica” (alza il sesto e il settimo salendo, e li riabbassa scendendo). Servono a rendere più naturale la melodia e a sostenere l’armonia.', 'There are three forms of the minor scale! Besides the natural one there are the “harmonic” (raises the seventh degree by a semitone, creating that exotic, dramatic flavour) and the “melodic” (raises the sixth and seventh going up, and lowers them again coming down). They make the melody flow better and support the harmony.') },
    ],
    quiz: [
      { prompt: t2('La relativa minore di Do maggiore è…', 'The relative minor of C major is…'), options: [t2('La minore', 'A minor'), t2('Mi minore', 'E minor'), t2('Re minore', 'D minor')], correctIndex: 0 },
      { prompt: t2('La scala minore naturale segue lo schema…', 'The natural minor scale follows the pattern…'), options: [t2('T–T–S–T–T–T–S (maggiore)', 'T–T–S–T–T–T–S (major)'), t2('T–S–T–T–S–T–T (minore)', 'T–S–T–T–S–T–T (minor)')], correctIndex: 1 },
      { prompt: t2('Che cosa dà alla scala minore il suo carattere “triste”?', 'What gives the minor scale its “sad” character?'), options: [t2('La terza minore (3° grado più basso)', 'The minor third (lower 3rd degree)'), t2('La tonica', 'The tonic'), t2('L’ottava', 'The octave')], correctIndex: 0 },
      { prompt: t2('La relativa minore condivide con la maggiore…', 'The relative minor shares with the major…'), options: [t2('L’armatura (le stesse note)', 'The key signature (the same notes)'), t2('La stessa nota di partenza', 'The same starting note')], correctIndex: 0 },
      { prompt: t2('Quante forme di scala minore esistono?', 'How many forms of the minor scale exist?'), options: [t2('Una', 'One'), t2('Tre (naturale, armonica, melodica)', 'Three (natural, harmonic, melodic)')], correctIndex: 1 },
      { prompt: t2('Nella scala minore armonica si alza…', 'In the harmonic minor scale you raise…'), options: [t2('Il 7° grado (la sensibile)', 'The 7th degree (the leading tone)'), t2('Il 3° grado', 'The 3rd degree'), t2('Il 5° grado', 'The 5th degree')], correctIndex: 0 },
      { prompt: t2('Do maggiore e Do minore (stessa tonica, armatura diversa) si dicono…', 'C major and C minor (same tonic, different key signature) are called…'), options: [t2('Omonime (parallele)', 'Parallel'), t2('Relative', 'Relative'), t2('Enarmoniche', 'Enharmonic')], correctIndex: 0 },
    ],
  },

  triadi: {
    id: 'triadi',
    blocks: [
      { kind: 'text', text: t2('Una triade è l’accordo più semplice: tre note sovrapposte “per terze”, cioè saltando una nota ogni volta. Si chiamano fondamentale (la nota di base), terza e quinta. La triade è il mattone con cui si costruisce gran parte dell’armonia.', 'A triad is the simplest chord: three notes stacked “in thirds”, i.e. skipping one note each time. They are called the root (the base note), the third and the fifth. The triad is the building block of most harmony.') },
      { kind: 'staff', example: { clef: 'treble', elements: [chord([p('C', 4), p('E', 4), p('G', 4)], 'whole')], playable: true, caption: t2('Triade di Do maggiore (Do–Mi–Sol)', 'C major triad (C–E–G)') } },
      { kind: 'text', text: t2('Per costruire una triade su una nota della scala, parti da quella nota (la fondamentale) e aggiungi la 3ª e la 5ª contando dentro la scala: su Do in Do maggiore ottieni Do (1) – Mi (3) – Sol (5). Lo stesso procedimento su ogni grado dà tutti gli accordi di quella tonalità.', 'To build a triad on a scale note, start from that note (the root) and add the 3rd and 5th counting within the scale: on C in C major you get C (1) – E (3) – G (5). The same process on each degree gives all the chords of that key.') },
      { kind: 'text', text: t2('Cambiando di un semitono la terza e/o la quinta si ottengono quattro tipi, ciascuno con un “colore” diverso:', 'By shifting the third and/or the fifth by a semitone you get four types, each with a different “colour”:') },
      { kind: 'list', items: [t2('Maggiore: terza maggiore + terza minore — suono brillante e stabile (Do–Mi–Sol)', 'Major: major third + minor third — bright, stable sound (C–E–G)'), t2('Minore: terza minore + terza maggiore — suono più scuro (Do–Mi♭–Sol)', 'Minor: minor third + major third — darker sound (C–E♭–G)'), t2('Diminuita: due terze minori — tesa, instabile (Do–Mi♭–Sol♭)', 'Diminished: two minor thirds — tense, unstable (C–E♭–G♭)'), t2('Aumentata: due terze maggiori — sospesa, misteriosa (Do–Mi–Sol♯)', 'Augmented: two major thirds — suspended, mysterious (C–E–G♯)')] },
      { kind: 'staff', example: { clef: 'treble', elements: [chord([p('C', 4), p('E', 4), p('G', 4)]), chord([p('C', 4), p('E', 4, 'flat'), p('G', 4)]), chord([p('C', 4), p('E', 4, 'flat'), p('G', 4, 'flat')]), chord([p('C', 4), p('E', 4), p('G', 4, 'sharp')])], playable: true, caption: t2('Maggiore, minore, diminuita, aumentata (sulla fondamentale Do)', 'Major, minor, diminished, augmented (on the root C)') } },
      { kind: 'tip', intent: 'tip', text: t2('La differenza tra maggiore e minore sta tutta nella terza: nella maggiore è “grande” (4 semitoni dalla fondamentale), nella minore è “piccola” (3 semitoni). È un solo tasto di differenza, ma cambia completamente l’emozione dell’accordo.', 'The difference between major and minor lies entirely in the third: in the major it is “big” (4 semitones from the root), in the minor “small” (3 semitones). Just one key apart, yet it completely changes the emotion of the chord.') },
      { kind: 'text', text: t2('Le tre note si possono impilare in ordine diverso senza cambiare l’accordo: sono i rivolti. Con la fondamentale in basso l’accordo è in stato fondamentale; con la 3ª in basso è in 1° rivolto; con la 5ª in basso è in 2° rivolto. Le note restano Do-Mi-Sol, cambia solo quale sta sotto.', 'The three notes can be stacked in a different order without changing the chord: these are inversions. With the root at the bottom the chord is in root position; with the 3rd at the bottom it’s in 1st inversion; with the 5th at the bottom it’s in 2nd inversion. The notes are still C-E-G — only which one sits at the bottom changes.') },
      { kind: 'staff', example: { clef: 'treble', elements: [chord([p('C', 4), p('E', 4), p('G', 4)]), chord([p('E', 4), p('G', 4), p('C', 5)]), chord([p('G', 4), p('C', 5), p('E', 5)])], playable: true, caption: t2('Do maggiore: stato fondamentale, 1° rivolto, 2° rivolto', 'C major: root position, 1st inversion, 2nd inversion') } },
      { kind: 'tip', intent: 'curiosity', text: t2('Aggiungendo una quarta nota a distanza di terza sopra la quinta si ottiene un accordo di settima (per esempio Do–Mi–Sol–Si♭, l’accordo di “dominante” che chiede di risolvere): è il colore tipico del blues e del jazz. E con soli tre o quattro accordi maggiori e minori si accompagnano moltissime canzoni: il celebre giro Do–Sol–Lam–Fa ne è la prova.', 'Add a fourth note a third above the fifth and you get a seventh chord (for example C–E–G–B♭, the “dominant” chord that begs to resolve): it’s the signature colour of blues and jazz. And just three or four major and minor chords are enough to back countless songs — the famous C–G–Am–F progression is proof.') },
    ],
    quiz: [
      { prompt: t2('Una triade è formata da quante note?', 'How many notes form a triad?'), options: [same('2'), same('3'), same('4')], correctIndex: 1 },
      { prompt: t2('Le tre note di una triade si chiamano…', 'The three notes of a triad are called…'), options: [t2('Fondamentale, terza, quinta', 'Root, third, fifth'), t2('Tonica, dominante, sensibile', 'Tonic, dominant, leading tone'), t2('Prima, seconda, terza', 'First, second, third')], correctIndex: 0 },
      { prompt: t2('La triade di Do maggiore è…', 'The C major triad is…'), options: [t2('Do–Mi–Sol', 'C–E–G'), t2('Do–Fa–La', 'C–F–A'), t2('Re–Fa–La', 'D–F–A')], correctIndex: 0 },
      { prompt: t2('Rispetto alla maggiore, la triade minore ha la terza…', 'Compared with the major, the minor triad has its third…'), options: [t2('Più alta di un semitono', 'A semitone higher'), t2('Più bassa di un semitono', 'A semitone lower')], correctIndex: 1 },
      { prompt: t2('Che triade è?', 'Which triad is this?'), staff: { clef: 'treble', elements: [chord([p('C', 4), p('E', 4, 'flat'), p('G', 4)], 'whole')], playable: true }, options: [t2('Maggiore', 'Major'), t2('Minore', 'Minor'), t2('Diminuita', 'Diminished')], correctIndex: 1 },
      { prompt: t2('Una triade con la 3ª in basso (invece della fondamentale) è in…', 'A triad with the 3rd at the bottom (instead of the root) is in…'), options: [t2('1° rivolto', '1st inversion'), t2('Stato fondamentale', 'Root position'), t2('2° rivolto', '2nd inversion')], correctIndex: 0 },
      { prompt: t2('Aggiungendo una nota a distanza di terza sopra la quinta si ottiene…', 'Adding a note a third above the fifth gives…'), options: [t2('Un accordo di settima', 'A seventh chord'), t2('Un’altra triade', 'Another triad'), t2('Un intervallo', 'An interval')], correctIndex: 0 },
    ],
  },
}

export function getLesson(id: string): Lesson | undefined {
  return LESSONS[id]
}
