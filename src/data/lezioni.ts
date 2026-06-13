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
      { kind: 'text', text: t2('Il pentagramma (dal greco penta = cinque) è formato da cinque righe e quattro spazi. Sia le righe sia gli spazi ospitano le note, e si contano sempre dal basso verso l’alto. Più una nota è in alto sul rigo, più il suo suono è acuto; più è in basso, più è grave.', 'The staff (from the Greek penta = five) has five lines and four spaces. Both the lines and the spaces hold notes, and they are always counted from bottom to top. The higher a note sits on the staff, the higher its pitch; the lower it sits, the lower its pitch.') },
      { kind: 'text', text: t2('All’inizio di ogni rigo c’è la chiave: un simbolo che fissa il nome di una nota di riferimento e, di conseguenza, di tutte le altre. Senza chiave, le note sul pentagramma non avrebbero un nome preciso.', 'At the start of every staff is the clef: a symbol that fixes the name of one reference note and, from it, all the others. Without a clef, the notes on the staff would have no precise name.') },
      { kind: 'heading', text: t2('Le due chiavi più comuni', 'The two most common clefs') },
      { kind: 'text', text: t2('La chiave di violino (o di Sol) avvolge col suo ricciolo la seconda riga, indicando che lì si trova il Sol: si usa per i suoni acuti (voce, flauto, violino, mano destra del pianoforte). La chiave di basso (o di Fa) ha due puntini attorno alla quarta riga, dove si trova il Fa: si usa per i suoni gravi (violoncello, contrabbasso, mano sinistra del pianoforte).', 'The treble (or G) clef curls its spiral around the second line, showing that G sits there: it is used for higher sounds (voice, flute, violin, the pianist’s right hand). The bass (or F) clef places two dots around the fourth line, where F sits: it is used for lower sounds (cello, double bass, the pianist’s left hand).') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4), 'whole')], playable: true, caption: t2('Il Do centrale in chiave di violino (un taglio addizionale sotto il rigo)', 'Middle C in the treble clef (one ledger line below the staff)') } },
      { kind: 'staff', example: { clef: 'bass', elements: [n(p('C', 4), 'whole')], playable: true, caption: t2('Lo stesso Do centrale in chiave di basso (un taglio addizionale sopra il rigo)', 'The same middle C in the bass clef (one ledger line above the staff)') } },
      { kind: 'callout', text: t2('Insieme, chiave di violino e di basso formano il “rigo doppio” (grande stave) del pianoforte. Il Do centrale sta proprio nel mezzo, condiviso dalle due chiavi: per questo lo si chiama “centrale”.', 'Together, the treble and bass clefs form the piano’s “grand staff”. Middle C sits right in between, shared by the two clefs — that is why it is called “middle”.') },
      { kind: 'tip', intent: 'curiosity', text: t2('La notazione su pentagramma fu perfezionata intorno all’anno 1000 dal monaco italiano Guido d’Arezzo: prima di lui le melodie si tramandavano a memoria o con segni vaghi. Le chiavi nascono come lettere stilizzate — la chiave di violino è una “G” (Sol) decorata, quella di basso una “F” (Fa) — e ne esiste anche una terza, la chiave di Do, usata per viola e altri strumenti.', 'Staff notation was perfected around the year 1000 by the Italian monk Guido of Arezzo; before him melodies were passed down by memory or with vague signs. The clefs began as stylized letters — the treble clef is a decorated “G”, the bass clef an “F” — and there is also a third, the C clef, used for viola and other instruments.') },
    ],
    quiz: [
      { prompt: t2('Quante righe e spazi ha il pentagramma?', 'How many lines and spaces does the staff have?'), options: [t2('5 righe e 4 spazi', '5 lines and 4 spaces'), t2('4 righe e 5 spazi', '4 lines and 5 spaces'), t2('5 righe e 5 spazi', '5 lines and 5 spaces')], correctIndex: 0 },
      { prompt: t2('Come si contano righe e spazi?', 'How are lines and spaces counted?'), options: [t2('Dal basso verso l’alto', 'From bottom to top'), t2('Dall’alto verso il basso', 'From top to bottom')], correctIndex: 0, explanation: t2('Più in alto = più acuto.', 'Higher = higher pitch.') },
      { prompt: t2('A che cosa serve la chiave?', 'What is the clef for?'), options: [t2('A dare il nome alle note', 'To name the notes'), t2('A indicare la velocità', 'To set the speed'), t2('A indicare il volume', 'To set the volume')], correctIndex: 0 },
      { prompt: t2('La chiave di violino indica dove si trova il…', 'The treble clef shows where … is'), options: [t2('Sol', 'G'), t2('Fa', 'F'), t2('Do', 'C')], correctIndex: 0 },
      { prompt: t2('Chi perfezionò la notazione su pentagramma?', 'Who perfected staff notation?'), options: [t2('Guido d’Arezzo', 'Guido of Arezzo'), t2('Mozart', 'Mozart'), t2('Beethoven', 'Beethoven')], correctIndex: 0 },
    ],
  },

  'nomi-note': {
    id: 'nomi-note',
    blocks: [
      { kind: 'text', text: t2('Le note sono sette e si ripetono all’infinito: Do, Re, Mi, Fa, Sol, La, Si (in inglese C, D, E, F, G, A, B). Dopo il Si si ricomincia da Do, ma una posizione più in alto: questa distanza tra una nota e la sua ripetizione si chiama ottava.', 'There are seven notes and they repeat endlessly: in Italian Do, Re, Mi, Fa, Sol, La, Si — in English C, D, E, F, G, A, B. After B you start again from C, one position higher: this distance between a note and its repetition is called an octave.') },
      { kind: 'staff', example: { clef: 'treble', elements: majorScale(0, 4).map((pp) => n(pp)), playable: true, caption: t2('La scala di Do: Do Re Mi Fa Sol La Si Do (cliccala per ascoltarla!)', 'The C scale: C D E F G A B C (click it to hear it!)') } },
      { kind: 'text', text: t2('Ogni nota occupa una posizione fissa: salendo, si alternano riga e spazio. Sul rigo di violino, le righe (dal basso) sono Mi-Sol-Si-Re-Fa e gli spazi Fa-La-Do-Mi.', 'Each note has a fixed position: going up, lines and spaces alternate. On the treble staff the lines (from the bottom) are E-G-B-D-F and the spaces F-A-C-E.') },
      { kind: 'tip', intent: 'tip', text: t2('Per ricordare le righe della chiave di violino (Mi-Sol-Si-Re-Fa) in inglese si usa la frase “Every Good Boy Does Fine” (E-G-B-D-F); per gli spazi (Fa-La-Do-Mi) basta la parola “FACE”. Per la chiave di basso: righe (Sol-Si-Re-Fa-La) “Good Boys Deserve Fudge Always”, spazi (La-Do-Mi-Sol) “All Cows Eat Grass”. Inventane una tutta tua: funziona ancora meglio!', 'To remember the treble-clef lines (E-G-B-D-F) use “Every Good Boy Does Fine”; for the spaces (F-A-C-E) just the word “FACE”. For the bass clef: lines (G-B-D-F-A) “Good Boys Deserve Fudge Always”, spaces (A-C-E-G) “All Cows Eat Grass”. Make up your own — it works even better!') },
      { kind: 'text', text: t2('Quando una nota è troppo acuta o troppo grave per stare sul pentagramma, si usano piccole righe aggiuntive chiamate tagli addizionali. Il Do centrale, per esempio, sta su un taglio sotto la chiave di violino.', 'When a note is too high or too low for the staff, small extra lines called ledger lines are used. Middle C, for example, sits on a ledger line below the treble staff.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4), 'whole'), n(p('A', 5), 'whole')], playable: true, caption: t2('Tagli addizionali: Do centrale (sotto) e La acuto (sopra)', 'Ledger lines: middle C (below) and high A (above)') } },
      { kind: 'tip', intent: 'curiosity', text: t2('I nomi Do-Re-Mi-Fa-Sol-La nascono nell’XI secolo: Guido d’Arezzo prese le prime sillabe dei versi di un inno a San Giovanni (“Ut queant laxis…”), ognuno cantato un gradino più in alto. “Ut” fu poi cambiato in “Do” (più facile da cantare) e il “Si” fu aggiunto dalle iniziali di “Sancte Iohannes”. I paesi anglosassoni usano invece le lettere A-G.', 'The names Do-Re-Mi-Fa-Sol-La were born in the 11th century: Guido of Arezzo took the first syllables of the lines of a hymn to St John (“Ut queant laxis…”), each sung one step higher. “Ut” was later changed to “Do” (easier to sing) and “Si” was added from the initials of “Sancte Iohannes”. English-speaking countries use the letters A-G instead.') },
    ],
    quiz: [
      { prompt: t2('Quante sono le note?', 'How many notes are there?'), options: [same('5'), same('7'), same('8')], correctIndex: 1 },
      identify(p('E', 4)),
      identify(p('G', 4)),
      { prompt: t2('La distanza tra una nota e la sua ripetizione più acuta si chiama…', 'The distance between a note and its higher repetition is called an…'), options: [t2('Ottava', 'Octave'), t2('Terza', 'Third'), t2('Quinta', 'Fifth')], correctIndex: 0 },
      { prompt: t2('Le righe aggiuntive per le note molto acute o gravi si chiamano…', 'The extra lines for very high or low notes are called…'), options: [t2('Stanghette', 'Barlines'), t2('Tagli addizionali', 'Ledger lines'), t2('Chiavi', 'Clefs')], correctIndex: 1 },
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
      { kind: 'tip', intent: 'curiosity', text: t2('I nomi italiani raccontano una storia: “semibreve” significa “mezza-breve”, perché un tempo esistevano figure ancora più lunghe (la breve e la lunga). La semibreve, oggi la più lunga in uso, era in origine una delle più corte!', 'The Italian names tell a story: “semibreve” means “half-breve”, because even longer figures once existed (the breve and the long). The whole note — today the longest in common use — was originally one of the shortest!') },
    ],
    quiz: [
      { prompt: t2('In 4/4, quanti movimenti dura una semibreve?', 'In 4/4, how many beats does a whole note last?'), options: [same('1'), same('2'), same('4')], correctIndex: 2 },
      { prompt: t2('La minima vale quante semiminime?', 'A half note equals how many quarter notes?'), options: [same('1'), same('2'), same('4')], correctIndex: 1 },
      { prompt: t2('Quante semicrome stanno in una semiminima?', 'How many sixteenth notes fit in a quarter note?'), options: [same('2'), same('4'), same('8')], correctIndex: 1 },
      { prompt: t2('Quale valore dura di meno?', 'Which value is the shortest?'), options: [t2('Semiminima', 'Quarter'), t2('Croma', 'Eighth'), t2('Semicroma', 'Sixteenth')], correctIndex: 2 },
      { prompt: t2('Che valore è questo?', 'What value is this?'), staff: { clef: 'treble', elements: [n(p('B', 4), 'half')], playable: true }, options: [t2('Semibreve', 'Whole'), t2('Minima', 'Half'), t2('Semiminima', 'Quarter')], correctIndex: 1 },
    ],
  },

  pause: {
    id: 'pause',
    blocks: [
      { kind: 'text', text: t2('Anche il silenzio fa parte della musica: le pause indicano per quanto tempo NON si suona. A ogni valore di nota corrisponde una pausa della stessa durata, con un simbolo dedicato.', 'Silence is part of music too: rests show how long NOT to play. Every note value has a matching rest of the same duration, with its own symbol.') },
      { kind: 'staff', example: { clef: 'treble', elements: [r('whole'), r('half'), r('quarter'), r('eighth')], caption: t2('Pausa di semibreve, di minima, di semiminima, di croma', 'Whole, half, quarter and eighth rests') } },
      { kind: 'tip', intent: 'tip', text: t2('Le pause di semibreve e di minima si somigliano: la pausa di semibreve “pende” sotto la quarta riga (come un cappello appeso), quella di minima “sta seduta” sopra la terza riga. Trucco: la pausa di semibreve è più “pesante” e cade giù; la minima è più “leggera” e galleggia su.', 'The whole and half rests look alike: the whole rest “hangs” under the fourth line (like a hat on a hook), the half rest “sits” on top of the third line. Trick: the whole rest is heavier and falls down; the half rest is lighter and floats up.') },
      { kind: 'callout', text: t2('Una pausa di semibreve, oltre a valere 4 movimenti, è usata anche per indicare un’intera battuta di silenzio, qualunque sia l’indicazione di tempo.', 'Besides being worth 4 beats, a whole rest is also used to mean a whole measure of silence, whatever the time signature.') },
      { kind: 'tip', intent: 'curiosity', text: t2('Le pause non sono “musica che manca”: sono musica vera. Un silenzio ben piazzato crea attesa e tensione. Il compositore Claude Debussy diceva che “la musica è lo spazio tra le note”.', 'Rests are not “missing music”: they are music itself. A well-placed silence creates anticipation and tension. The composer Claude Debussy is said to have remarked that “music is the space between the notes.”') },
    ],
    quiz: [
      { prompt: t2('La pausa indica…', 'A rest indicates…'), options: [t2('Un suono lungo', 'A long sound'), t2('Un silenzio', 'A silence'), t2('Una nota acuta', 'A high note')], correctIndex: 1 },
      { prompt: t2('La pausa di semiminima dura quanto…', 'A quarter rest lasts as long as…'), options: [t2('Una semiminima', 'A quarter note'), t2('Una minima', 'A half note'), t2('Una semibreve', 'A whole note')], correctIndex: 0 },
      { prompt: t2('Quale pausa “pende” sotto la riga?', 'Which rest “hangs” under the line?'), options: [t2('Di semibreve', 'The whole rest'), t2('Di minima', 'The half rest')], correctIndex: 0 },
      { prompt: t2('Anche i silenzi hanno una durata precisa.', 'Silences have a precise duration too.'), options: VERO_FALSO, correctIndex: 0 },
    ],
  },

  'punto-legatura': {
    id: 'punto-legatura',
    blocks: [
      { kind: 'text', text: t2('Il punto di valore si mette a destra della nota e ne aumenta la durata della metà. Una minima (2 movimenti) col punto vale quindi 3 movimenti (2 + 1); una semiminima col punto vale 1 movimento e mezzo.', 'The augmentation dot is placed to the right of a note and increases its duration by half. A half note (2 beats) with a dot is therefore worth 3 beats (2 + 1); a dotted quarter note is worth one and a half beats.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('D', 5), 'half', 1)], playable: true, caption: t2('Minima col punto: vale 3 movimenti', 'Dotted half note: worth 3 beats') } },
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
    ],
  },

  'tempo-battuta': {
    id: 'tempo-battuta',
    blocks: [
      { kind: 'text', text: t2('Le stanghette verticali dividono il pentagramma in battute (o misure): piccoli contenitori che raggruppano i movimenti in modo regolare. L’indicazione di tempo, scritta come una frazione subito dopo la chiave, dice quanti movimenti entrano in ogni battuta e quale figura vale un movimento.', 'Vertical barlines divide the staff into measures (bars): small containers that group the beats regularly. The time signature, written as a fraction right after the clef, tells how many beats go in each measure and which figure is worth one beat.') },
      { kind: 'list', items: [t2('Il numero in alto: quanti movimenti per battuta', 'Top number: how many beats per measure'), t2('Il numero in basso: il valore di un movimento (4 = semiminima, 8 = croma)', 'Bottom number: the value of one beat (4 = quarter, 8 = eighth)')] },
      { kind: 'staff', example: { clef: 'treble', timeSignature: { beats: 4, beatType: 4 }, elements: [n(p('C', 5)), n(p('C', 5)), n(p('C', 5)), n(p('C', 5))], caption: t2('4/4: quattro movimenti da una semiminima ciascuno', '4/4: four beats, each a quarter note') } },
      { kind: 'staff', example: { clef: 'treble', timeSignature: { beats: 3, beatType: 4 }, elements: [n(p('C', 5)), n(p('C', 5)), n(p('C', 5))], caption: t2('3/4: tre movimenti (il tempo del valzer)', '3/4: three beats (waltz time)') } },
      { kind: 'tip', intent: 'tip', text: t2('Il 4/4 è così frequente da essere chiamato “tempo ordinario” e si scrive anche con una “C”. Attenzione al 6/8: si conta in due, non in sei — i sei ottavi si raggruppano in due gruppi da tre (ONE-due-tre DUE-due-tre), dando quel caratteristico ritmo “ondeggiante”.', 'The 4/4 is so common that it is called “common time” and is also written with a “C”. Watch out for 6/8: it is felt in two, not six — the six eighths group into two sets of three (ONE-two-three TWO-two-three), giving that characteristic “swaying” rhythm.') },
      { kind: 'tip', intent: 'curiosity', text: t2('Quella “C” del tempo ordinario NON sta per “Common”: è un cerchio spezzato! Nella notazione medievale il cerchio completo (○) indicava il tempo “perfetto”, ternario, simbolo di completezza (la Trinità); il cerchio incompleto, simile a una C, indicava il tempo “imperfetto”, binario. La C tagliata (₵) significa invece “alla breve”, cioè conta in due.', 'That “C” of common time does NOT stand for “Common”: it’s a broken circle! In medieval notation the full circle (○) meant “perfect”, triple time, a symbol of completeness (the Trinity); the incomplete circle, shaped like a C, meant “imperfect”, duple time. The cut C (₵) instead means “alla breve”, i.e. counted in two.') },
    ],
    quiz: [
      { prompt: t2('In 3/4, quanti movimenti entrano in una battuta?', 'In 3/4, how many beats fit in a measure?'), options: [same('2'), same('3'), same('4')], correctIndex: 1 },
      { prompt: t2('Il numero in alto dell’indicazione di tempo indica…', 'The top number of the time signature indicates…'), options: [t2('Il valore di un movimento', 'The value of a beat'), t2('Quanti movimenti per battuta', 'How many beats per measure')], correctIndex: 1 },
      { prompt: t2('Il numero in basso “4” significa che il movimento è una…', 'A bottom number of “4” means the beat is a…'), options: [t2('Semibreve', 'Whole note'), t2('Semiminima', 'Quarter note'), t2('Croma', 'Eighth note')], correctIndex: 1 },
      { prompt: t2('Che cosa separa due battute?', 'What separates two measures?'), options: [t2('La stanghetta', 'The barline'), t2('La chiave', 'The clef')], correctIndex: 0 },
      { prompt: t2('Quanti movimenti ha questa battuta?', 'How many beats does this measure have?'), staff: { clef: 'treble', timeSignature: { beats: 4, beatType: 4 }, elements: [n(p('G', 4)), n(p('G', 4)), n(p('G', 4)), n(p('G', 4))], playable: true }, options: [same('3'), same('4'), same('5')], correctIndex: 1 },
    ],
  },

  alterazioni: {
    id: 'alterazioni',
    blocks: [
      { kind: 'text', text: t2('Le alterazioni cambiano l’altezza di una nota di un semitono, la distanza più piccola della musica occidentale (sul pianoforte, due tasti adiacenti, bianco o nero). Si scrivono SUBITO PRIMA della nota.', 'Accidentals change a note’s pitch by a semitone, the smallest distance in Western music (on the piano, two adjacent keys, white or black). They are written JUST BEFORE the note.') },
      { kind: 'list', items: [t2('Diesis (♯): alza la nota di un semitono', 'Sharp (♯): raises the note by a semitone'), t2('Bemolle (♭): abbassa la nota di un semitono', 'Flat (♭): lowers the note by a semitone'), t2('Bequadro (♮): annulla un diesis o un bemolle precedente, riportando la nota “naturale”', 'Natural (♮): cancels a previous sharp or flat, restoring the “natural” note')] },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 5)), n(p('C', 5, 'sharp')), n(p('C', 5, 'natural'))], playable: true, caption: t2('Do, Do diesis, Do bequadro', 'C, C sharp, C natural') } },
      { kind: 'callout', text: t2('Un’alterazione vale per tutta la battuta in cui compare, e solo per quella riga/spazio: dopo la stanghetta la nota torna naturale. Lo stesso suono può avere due nomi (Do♯ = Re♭): si chiamano note “enarmoniche”.', 'An accidental applies for the whole measure where it appears, and only on that line/space: after the barline the note returns to natural. The same sound can have two names (C♯ = D♭): these are called “enharmonic” notes.') },
      { kind: 'tip', intent: 'curiosity', text: t2('I nomi italiani svelano la storia: anticamente la nota Si poteva essere cantata in due modi — “B durum” (Si duro), scritto con una b squadrata, e “B molle” (Si morbido), scritto con una b tonda. Da qui “bequadro” (b-quadra → ♮ e ♯) e “bemolle” (b-molle → ♭). Il simbolo del bemolle è proprio una “b” arrotondata!', 'The Italian names reveal the history: long ago the note B could be sung two ways — “B durum” (hard B), written with a square b, and “B molle” (soft B), written with a round b. Hence “bequadro” (square b → ♮ and ♯) and “bemolle” (soft b → ♭). The flat symbol is indeed a rounded “b”!') },
    ],
    quiz: [
      { prompt: t2('Il diesis (♯)…', 'The sharp (♯)…'), options: [t2('Alza di un semitono', 'Raises by a semitone'), t2('Abbassa di un semitono', 'Lowers by a semitone'), t2('Annulla', 'Cancels')], correctIndex: 0 },
      { prompt: t2('Il bemolle (♭)…', 'The flat (♭)…'), options: [t2('Alza di un semitono', 'Raises by a semitone'), t2('Abbassa di un semitono', 'Lowers by a semitone')], correctIndex: 1 },
      { prompt: t2('Il bequadro (♮) serve a…', 'The natural (♮) is used to…'), options: [t2('Annullare un’alterazione', 'Cancel an accidental'), t2('Raddoppiare la durata', 'Double the duration')], correctIndex: 0 },
      { prompt: t2('Do♯ e Re♭ sono lo stesso suono con due nomi: si dicono…', 'C♯ and D♭ are the same sound with two names: they are called…'), options: [t2('Enarmonici', 'Enharmonic'), t2('Cromatici', 'Chromatic'), t2('Diatonici', 'Diatonic')], correctIndex: 0 },
      { prompt: t2('Quale alterazione vedi su questa nota?', 'Which accidental do you see on this note?'), staff: { clef: 'treble', elements: [n(p('F', 5, 'sharp'))], playable: true }, options: [t2('Diesis', 'Sharp'), t2('Bemolle', 'Flat'), t2('Bequadro', 'Natural')], correctIndex: 0 },
    ],
  },

  'armature-scale': {
    id: 'armature-scale',
    blocks: [
      { kind: 'text', text: t2('Una scala maggiore è una “scaletta” di sette note che segue sempre lo stesso schema di toni (T) e semitoni (S): T–T–S–T–T–T–S. Partendo da Do si usano solo i tasti bianchi; partendo da altre note servono alcune alterazioni per rispettare lo schema.', 'A major scale is a “ladder” of seven notes that always follows the same pattern of tones (T) and semitones (S): T–T–S–T–T–T–S. Starting from C you use only the white keys; starting from other notes you need some accidentals to keep the pattern.') },
      { kind: 'text', text: t2('Per non riscrivere le stesse alterazioni a ogni nota, le si raccoglie all’inizio del rigo, subito dopo la chiave: è l’armatura di chiave, valida per tutto il brano. Ogni tonalità maggiore ha la sua: Do maggiore nessuna alterazione, Sol maggiore un diesis (Fa♯), Fa maggiore un bemolle (Si♭).', 'To avoid rewriting the same accidentals on every note, they are gathered at the start of the staff, right after the clef: this is the key signature, valid for the whole piece. Each major key has its own: C major no accidentals, G major one sharp (F♯), F major one flat (B♭).') },
      { kind: 'staff', example: { clef: 'treble', keySignature: { fifths: 1 }, elements: majorScale(1, 4).map((pp) => n(pp)), playable: true, caption: t2('Sol maggiore: un diesis in armatura (Fa♯)', 'G major: one sharp in the key signature (F♯)') } },
      { kind: 'tip', intent: 'tip', text: t2('I diesis compaiono sempre in quest’ordine: Fa Do Sol Re La Mi Si. I bemolle nell’ordine inverso: Si Mi La Re Sol Do Fa. Trucchi: con i diesis, l’ULTIMO diesis è un semitono sotto il nome della tonalità (un Re♯ in armatura → Mi maggiore). Con i bemolle, il PENULTIMO bemolle È il nome della tonalità (…Si♭ Mi♭ → Si♭ maggiore).', 'Sharps always appear in this order: F C G D A E B. Flats in reverse: B E A D G C F. Tricks: with sharps, the LAST sharp is a semitone below the key name (a D♯ in the signature → E major). With flats, the SECOND-TO-LAST flat IS the key name (…B♭ E♭ → B♭ major).') },
      { kind: 'tip', intent: 'curiosity', text: t2('Le tonalità si dispongono nel “circolo delle quinte”: salendo di quinta ogni volta (Do→Sol→Re→La…) si aggiunge un diesis; scendendo (Do→Fa→Si♭…) si aggiunge un bemolle. È una bussola che i musicisti usano per orientarsi tra le tonalità e gli accordi.', 'The keys lay out on the “circle of fifths”: going up a fifth each time (C→G→D→A…) adds a sharp; going down (C→F→B♭…) adds a flat. It is a compass musicians use to navigate keys and chords.') },
    ],
    quiz: [
      { prompt: t2('La scala maggiore segue lo schema di toni e semitoni…', 'The major scale follows the pattern of tones and semitones…'), options: [t2('T–T–S–T–T–T–S', 'T–T–S–T–T–T–S'), t2('T–S–T–T–S–T–T', 'T–S–T–T–S–T–T'), t2('tutti toni', 'all tones')], correctIndex: 0 },
      { prompt: t2('Quante alterazioni ha l’armatura di Sol maggiore?', 'How many accidentals does G major’s key signature have?'), options: [same('0'), same('1'), same('2')], correctIndex: 1, explanation: t2('Un solo diesis: Fa♯.', 'A single sharp: F♯.') },
      { prompt: t2('Qual è l’ordine dei diesis in armatura?', 'What is the order of sharps in a key signature?'), options: [t2('Fa Do Sol Re La Mi Si', 'F C G D A E B'), t2('Do Re Mi Fa Sol La Si', 'C D E F G A B'), t2('Si Mi La Re Sol Do Fa', 'B E A D G C F')], correctIndex: 0 },
      { prompt: t2('L’armatura di chiave vale…', 'The key signature applies…'), options: [t2('Solo per la prima battuta', 'Only to the first measure'), t2('Per tutto il brano', 'To the whole piece')], correctIndex: 1 },
      { prompt: t2('Quante alterazioni vedi in questa armatura?', 'How many accidentals in this key signature?'), staff: { clef: 'treble', keySignature: { fifths: -1 }, elements: [n(p('F', 4), 'whole')] }, options: [same('1'), same('2'), same('3')], correctIndex: 0, explanation: t2('Fa maggiore: un bemolle (Si♭).', 'F major: one flat (B♭).') },
    ],
  },

  intervalli: {
    id: 'intervalli',
    blocks: [
      { kind: 'text', text: t2('L’intervallo è la distanza tra due note. Si conta includendo entrambe le note ai due estremi: da Do a Mi ci sono Do-Re-Mi, quindi è una terza. La stessa nota ripetuta è un “unisono”.', 'An interval is the distance between two notes. You count including both notes at the ends: from C to E there are C-D-E, so it’s a third. The same note repeated is a “unison”.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('C', 4)), n(p('E', 4)), n(p('C', 4)), n(p('G', 4)), n(p('C', 4)), n(p('C', 5))], playable: true, caption: t2('Do–Mi (terza), Do–Sol (quinta), Do–Do (ottava)', 'C–E (third), C–G (fifth), C–C (octave)') } },
      { kind: 'list', items: [t2('Seconda: note vicine (Do–Re)', 'Second: adjacent notes (C–D)'), t2('Terza: salto di una nota (Do–Mi) — è la base degli accordi', 'Third: skip one note (C–E) — the basis of chords'), t2('Quarta e quinta: scheletro dell’armonia (Do–Fa, Do–Sol)', 'Fourth and fifth: the skeleton of harmony (C–F, C–G)'), t2('Ottava: stessa nota, più acuta (Do–Do)', 'Octave: same note, higher (C–C)')] },
      { kind: 'tip', intent: 'tip', text: t2('Alcuni intervalli suonano “stabili e dolci” (consonanti: terza, quinta, ottava), altri “tesi” e bisognosi di risoluzione (dissonanti: seconda, settima). Per memorizzarli a orecchio, associa ogni intervallo all’inizio di una canzone che conosci.', 'Some intervals sound “stable and sweet” (consonant: third, fifth, octave), others “tense” and in need of resolution (dissonant: second, seventh). To learn them by ear, link each interval to the opening of a song you know.') },
      { kind: 'tip', intent: 'curiosity', text: t2('L’intervallo che divide esattamente a metà l’ottava (tre toni, il “tritono”, come Fa–Si) era soprannominato “diabolus in musica”, il diavolo nella musica. La leggenda che la Chiesa lo avesse “proibito” è però falsa: era semplicemente evitato perché instabile e difficile da intonare. Oggi è ovunque, dal jazz alle sigle dei film thriller.', 'The interval that splits the octave exactly in half (three whole tones, the “tritone”, like F–B) was nicknamed “diabolus in musica”, the devil in music. The legend that the Church “banned” it is false, though: it was simply avoided because it is unstable and hard to tune. Today it is everywhere, from jazz to thriller-movie themes.') },
    ],
    quiz: [
      { prompt: t2('Do–Mi è un intervallo di…', 'C–E is an interval of a…'), options: [t2('Seconda', 'Second'), t2('Terza', 'Third'), t2('Quarta', 'Fourth')], correctIndex: 1 },
      { prompt: t2('Do–Sol è una…', 'C–G is a…'), options: [t2('Quarta', 'Fourth'), t2('Quinta', 'Fifth'), t2('Sesta', 'Sixth')], correctIndex: 1 },
      { prompt: t2('Do–Do (più acuto) è una…', 'C–C (higher) is an…'), options: [t2('Settima', 'Seventh'), t2('Ottava', 'Octave')], correctIndex: 1 },
      { prompt: t2('Per contare un intervallo si includono…', 'To count an interval you include…'), options: [t2('Solo la nota d’arrivo', 'Only the top note'), t2('Entrambe le note', 'Both notes')], correctIndex: 1 },
      { prompt: t2('Il “diabolus in musica” è il soprannome del…', 'The “diabolus in musica” is the nickname of the…'), options: [t2('Tritono', 'Tritone'), t2('Unisono', 'Unison'), t2('Ottava', 'Octave')], correctIndex: 0 },
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
      { kind: 'tip', intent: 'tip', text: t2('Dinamiche e articolazioni non cambiano l’altezza né la durata scritta: sono ciò che trasforma le note giuste in vera MUSICA. Suonare “meccanicamente” corretto ma senza dinamica è come leggere ad alta voce senza alcuna intonazione.', 'Dynamics and articulations don’t change the written pitch or duration: they are what turns the right notes into real MUSIC. Playing “mechanically” correct but without dynamics is like reading aloud with no intonation at all.') },
      { kind: 'tip', intent: 'curiosity', text: t2('Perché questi termini sono in italiano (piano, forte, allegro, crescendo…)? Perché nel Seicento, quando dinamiche e tempi vennero codificati, i compositori italiani — Monteverdi, Corelli, Vivaldi, Scarlatti — dominavano la musica europea. Anche Bach e Beethoven li adottarono, e l’italiano è rimasto la “lingua internazionale” della musica.', 'Why are these terms in Italian (piano, forte, allegro, crescendo…)? Because in the 17th century, when dynamics and tempos were codified, Italian composers — Monteverdi, Corelli, Vivaldi, Scarlatti — dominated European music. Even Bach and Beethoven adopted them, and Italian has remained the “international language” of music.') },
    ],
    quiz: [
      { prompt: t2('Il segno “p” significa…', 'The sign “p” means…'), options: [t2('Piano (debole)', 'Piano (soft)'), t2('Forte', 'Loud')], correctIndex: 0 },
      { prompt: t2('Mettile in ordine dal più debole al più forte:', 'Put them in order from softest to loudest:'), options: [t2('p → mf → f', 'p → mf → f'), t2('f → mf → p', 'f → mf → p'), t2('mf → p → f', 'mf → p → f')], correctIndex: 0 },
      { prompt: t2('Lo staccato rende la nota…', 'Staccato makes the note…'), options: [t2('Breve e staccata', 'Short and detached'), t2('Lunga e legata', 'Long and connected')], correctIndex: 0 },
      { prompt: t2('Il crescendo (<) indica…', 'The crescendo (<) indicates…'), options: [t2('Diminuire il volume', 'Decrease the volume'), t2('Aumentare gradualmente il volume', 'Gradually increase the volume')], correctIndex: 1 },
      { prompt: t2('Le dinamiche indicano un volume…', 'Dynamics indicate a volume that is…'), options: [t2('Relativo (più o meno forte)', 'Relative (louder or softer)'), t2('Assoluto (in decibel)', 'Absolute (in decibels)')], correctIndex: 0 },
    ],
  },

  'scale-minori': {
    id: 'scale-minori',
    blocks: [
      { kind: 'text', text: t2('La scala minore ha un carattere più scuro, malinconico o drammatico rispetto alla maggiore. La differenza chiave è il terzo grado: nella minore è più basso (terza minore), ed è questo a darle il colore “triste”.', 'The minor scale has a darker, more melancholic or dramatic character than the major. The key difference is the third degree: in the minor it is lower (a minor third), and this is what gives it the “sad” colour.') },
      { kind: 'text', text: t2('La scala minore naturale segue lo schema: T–S–T–T–S–T–T. Partendo dal La si usano solo i tasti bianchi: La Si Do Re Mi Fa Sol La.', 'The natural minor scale follows this pattern: T–S–T–T–S–T–T. Starting from A you use only the white keys: A B C D E F G A.') },
      { kind: 'staff', example: { clef: 'treble', elements: [n(p('A', 4)), n(p('B', 4)), n(p('C', 5)), n(p('D', 5)), n(p('E', 5)), n(p('F', 5)), n(p('G', 5)), n(p('A', 5))], playable: true, caption: t2('La minore naturale: La Si Do Re Mi Fa Sol La', 'A natural minor: A B C D E F G A') } },
      { kind: 'text', text: t2('Ogni tonalità maggiore ha una “relativa minore” che usa le stesse note e la stessa armatura, ma parte da un’altra nota: la sesta della scala maggiore (una terza minore sotto la tonica). Do maggiore e La minore sono relative.', 'Each major key has a “relative minor” that uses the same notes and the same key signature, but starts on a different note: the sixth degree of the major scale (a minor third below the tonic). C major and A minor are relatives.') },
      { kind: 'staff', example: { clef: 'treble', elements: majorScale(0, 4).map((pp) => n(pp)), playable: true, caption: t2('Do maggiore: stesse note (nessuna alterazione) della relativa La minore', 'C major: same notes (no accidentals) as its relative A minor') } },
      { kind: 'tip', intent: 'tip', text: t2('Per trovare la relativa minore di una tonalità maggiore, scendi di tre semitoni (una terza minore): da Do scendi a La, da Sol a Mi, da Fa a Re. Condividono la stessa armatura, ma il “centro di gravità” è diverso.', 'To find the relative minor of a major key, go down three semitones (a minor third): from C to A, from G to E, from F to D. They share the same key signature, but the “centre of gravity” is different.') },
      { kind: 'tip', intent: 'curiosity', text: t2('Esistono tre forme di scala minore! Alla naturale si aggiungono la “armonica” (alza il settimo grado di un semitono, creando quel sapore esotico e drammatico) e la “melodica” (alza il sesto e il settimo salendo, e li riabbassa scendendo). Servono a rendere più naturale la melodia e a sostenere l’armonia.', 'There are three forms of the minor scale! Besides the natural one there are the “harmonic” (raises the seventh degree by a semitone, creating that exotic, dramatic flavour) and the “melodic” (raises the sixth and seventh going up, and lowers them again coming down). They make the melody flow better and support the harmony.') },
    ],
    quiz: [
      { prompt: t2('La relativa minore di Do maggiore è…', 'The relative minor of C major is…'), options: [t2('La minore', 'A minor'), t2('Mi minore', 'E minor'), t2('Re minore', 'D minor')], correctIndex: 0 },
      { prompt: t2('La scala minore naturale segue lo schema…', 'The natural minor scale follows the pattern…'), options: [t2('T–T–S–T–T–T–S (maggiore)', 'T–T–S–T–T–T–S (major)'), t2('T–S–T–T–S–T–T (minore)', 'T–S–T–T–S–T–T (minor)')], correctIndex: 1 },
      { prompt: t2('Che cosa dà alla scala minore il suo carattere “triste”?', 'What gives the minor scale its “sad” character?'), options: [t2('La terza minore (3° grado più basso)', 'The minor third (lower 3rd degree)'), t2('La tonica', 'The tonic'), t2('L’ottava', 'The octave')], correctIndex: 0 },
      { prompt: t2('La relativa minore condivide con la maggiore…', 'The relative minor shares with the major…'), options: [t2('L’armatura (le stesse note)', 'The key signature (the same notes)'), t2('La stessa nota di partenza', 'The same starting note')], correctIndex: 0 },
      { prompt: t2('Quante forme di scala minore esistono?', 'How many forms of the minor scale exist?'), options: [t2('Una', 'One'), t2('Tre (naturale, armonica, melodica)', 'Three (natural, harmonic, melodic)')], correctIndex: 1 },
    ],
  },

  triadi: {
    id: 'triadi',
    blocks: [
      { kind: 'text', text: t2('Una triade è l’accordo più semplice: tre note sovrapposte “per terze”, cioè saltando una nota ogni volta. Si chiamano fondamentale (la nota di base), terza e quinta. La triade è il mattone con cui si costruisce gran parte dell’armonia.', 'A triad is the simplest chord: three notes stacked “in thirds”, i.e. skipping one note each time. They are called the root (the base note), the third and the fifth. The triad is the building block of most harmony.') },
      { kind: 'staff', example: { clef: 'treble', elements: [chord([p('C', 4), p('E', 4), p('G', 4)], 'whole')], playable: true, caption: t2('Triade di Do maggiore (Do–Mi–Sol)', 'C major triad (C–E–G)') } },
      { kind: 'text', text: t2('Cambiando di un semitono la terza e/o la quinta si ottengono quattro tipi, ciascuno con un “colore” diverso:', 'By shifting the third and/or the fifth by a semitone you get four types, each with a different “colour”:') },
      { kind: 'list', items: [t2('Maggiore: terza maggiore + terza minore — suono brillante e stabile (Do–Mi–Sol)', 'Major: major third + minor third — bright, stable sound (C–E–G)'), t2('Minore: terza minore + terza maggiore — suono più scuro (Do–Mi♭–Sol)', 'Minor: minor third + major third — darker sound (C–E♭–G)'), t2('Diminuita: due terze minori — tesa, instabile (Do–Mi♭–Sol♭)', 'Diminished: two minor thirds — tense, unstable (C–E♭–G♭)'), t2('Aumentata: due terze maggiori — sospesa, misteriosa (Do–Mi–Sol♯)', 'Augmented: two major thirds — suspended, mysterious (C–E–G♯)')] },
      { kind: 'staff', example: { clef: 'treble', elements: [chord([p('C', 4), p('E', 4), p('G', 4)]), chord([p('C', 4), p('E', 4, 'flat'), p('G', 4)]), chord([p('C', 4), p('E', 4, 'flat'), p('G', 4, 'flat')]), chord([p('C', 4), p('E', 4), p('G', 4, 'sharp')])], playable: true, caption: t2('Maggiore, minore, diminuita, aumentata (sulla fondamentale Do)', 'Major, minor, diminished, augmented (on the root C)') } },
      { kind: 'tip', intent: 'tip', text: t2('La differenza tra maggiore e minore sta tutta nella terza: nella maggiore è “grande” (4 semitoni dalla fondamentale), nella minore è “piccola” (3 semitoni). È un solo tasto di differenza, ma cambia completamente l’emozione dell’accordo.', 'The difference between major and minor lies entirely in the third: in the major it is “big” (4 semitones from the root), in the minor “small” (3 semitones). Just one key apart, yet it completely changes the emotion of the chord.') },
      { kind: 'tip', intent: 'curiosity', text: t2('Le note di una triade si possono riordinare: se al posto della fondamentale metti in basso la terza o la quinta, ottieni i “rivolti”. L’accordo resta lo stesso (Do maggiore è sempre Do-Mi-Sol), ma cambia colore e permette ai musicisti di collegare gli accordi in modo più fluido.', 'The notes of a triad can be reordered: if you put the third or the fifth at the bottom instead of the root, you get “inversions”. The chord stays the same (a C major is still C-E-G), but its colour changes and it lets musicians connect chords more smoothly.') },
    ],
    quiz: [
      { prompt: t2('Una triade è formata da quante note?', 'How many notes form a triad?'), options: [same('2'), same('3'), same('4')], correctIndex: 1 },
      { prompt: t2('Le tre note di una triade si chiamano…', 'The three notes of a triad are called…'), options: [t2('Fondamentale, terza, quinta', 'Root, third, fifth'), t2('Tonica, dominante, sensibile', 'Tonic, dominant, leading tone'), t2('Prima, seconda, terza', 'First, second, third')], correctIndex: 0 },
      { prompt: t2('La triade di Do maggiore è…', 'The C major triad is…'), options: [t2('Do–Mi–Sol', 'C–E–G'), t2('Do–Fa–La', 'C–F–A'), t2('Re–Fa–La', 'D–F–A')], correctIndex: 0 },
      { prompt: t2('Rispetto alla maggiore, la triade minore ha la terza…', 'Compared with the major, the minor triad has its third…'), options: [t2('Più alta di un semitono', 'A semitone higher'), t2('Più bassa di un semitono', 'A semitone lower')], correctIndex: 1 },
      { prompt: t2('Che triade è?', 'Which triad is this?'), staff: { clef: 'treble', elements: [chord([p('C', 4), p('E', 4, 'flat'), p('G', 4)], 'whole')], playable: true }, options: [t2('Maggiore', 'Major'), t2('Minore', 'Minor'), t2('Diminuita', 'Diminished')], correctIndex: 1 },
    ],
  },
}

export function getLesson(id: string): Lesson | undefined {
  return LESSONS[id]
}
