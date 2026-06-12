/**
 * Catalogo (indice) dei moduli e delle lezioni di Teoria. Solo metadati bilingui
 * (titolo/riassunto IT+EN); il CONTENUTO delle lezioni è in data/lezioni.ts.
 */

export interface LessonMeta {
  id: string
  moduleId: string
  title: string
  titleEn: string
}

export interface ModuleMeta {
  id: string
  index: number
  title: string
  titleEn: string
  summary: string
  summaryEn: string
  lessons: LessonMeta[]
}

function mod(
  index: number,
  id: string,
  title: string,
  titleEn: string,
  summary: string,
  summaryEn: string,
  lessons: { id: string; title: string; titleEn: string }[],
): ModuleMeta {
  return {
    id,
    index,
    title,
    titleEn,
    summary,
    summaryEn,
    lessons: lessons.map((l) => ({ ...l, moduleId: id })),
  }
}

export const MODULES: ModuleMeta[] = [
  mod(1, 'pentagramma', 'Il pentagramma e le chiavi', 'The staff and clefs',
    'Le cinque righe, gli spazi e le chiavi di violino e di basso.',
    'The five lines, the spaces and the treble and bass clefs.',
    [{ id: 'pentagramma', title: 'Pentagramma, chiave di violino e di basso', titleEn: 'The staff, treble and bass clefs' }]),
  mod(2, 'nomi-note', 'I nomi delle note', 'Note names',
    'Righe, spazi e tagli addizionali: come si chiamano le note.',
    'Lines, spaces and ledger lines: what the notes are called.',
    [{ id: 'nomi-note', title: 'Note su righe, spazi e tagli addizionali', titleEn: 'Notes on lines, spaces and ledger lines' }]),
  mod(3, 'valori-note', 'I valori delle note', 'Note values',
    'Semibreve, minima, semiminima, croma e semicroma.',
    'Whole, half, quarter, eighth and sixteenth notes.',
    [{ id: 'valori-note', title: 'Dalla semibreve alla semicroma', titleEn: 'From whole note to sixteenth' }]),
  mod(4, 'pause', 'Le pause', 'Rests',
    'I simboli del silenzio e i loro valori.',
    'The symbols of silence and their values.',
    [{ id: 'pause', title: 'Le pause e i loro valori', titleEn: 'Rests and their values' }]),
  mod(5, 'punto-legatura', 'Punto di valore e legatura', 'Dot and tie',
    'Allungare la durata di una nota.',
    'Lengthening a note’s duration.',
    [{ id: 'punto-legatura', title: 'Punto di valore e legatura di valore', titleEn: 'Augmentation dot and tie' }]),
  mod(6, 'tempo-battuta', 'Tempo e battuta', 'Time signatures and measures',
    'Indicazioni di tempo 4/4, 3/4, 2/4, 6/8 e il concetto di battuta.',
    'Time signatures 4/4, 3/4, 2/4, 6/8 and the idea of the measure.',
    [{ id: 'tempo-battuta', title: 'Indicazioni di tempo e battuta', titleEn: 'Time signatures and the measure' }]),
  mod(7, 'alterazioni', 'Le alterazioni', 'Accidentals',
    'Diesis, bemolle e bequadro.',
    'Sharp, flat and natural.',
    [{ id: 'alterazioni', title: 'Diesis, bemolle, bequadro', titleEn: 'Sharp, flat, natural' }]),
  mod(8, 'armature-scale', 'Armature e scale maggiori', 'Key signatures and major scales',
    'Riconoscere le tonalità e costruire le scale maggiori.',
    'Recognizing keys and building major scales.',
    [{ id: 'armature-scale', title: 'Armature di chiave e scale maggiori', titleEn: 'Key signatures and major scales' }]),
  mod(9, 'intervalli', 'Gli intervalli', 'Intervals',
    'La distanza tra due note.',
    'The distance between two notes.',
    [{ id: 'intervalli', title: 'Gli intervalli di base', titleEn: 'Basic intervals' }]),
  mod(10, 'dinamiche-articolazioni', 'Dinamiche e articolazioni', 'Dynamics and articulations',
    'p, mf, f, crescendo, staccato, legato…',
    'p, mf, f, crescendo, staccato, legato…',
    [{ id: 'dinamiche-articolazioni', title: 'Dinamiche e articolazioni', titleEn: 'Dynamics and articulations' }]),
  mod(11, 'scale-minori', 'Le scale minori', 'Minor scales',
    'La scala minore naturale e la relativa minore.',
    'The natural minor scale and the relative minor.',
    [{ id: 'scale-minori', title: 'La scala minore e la relativa minore', titleEn: 'The minor scale and the relative minor' }]),
  mod(12, 'triadi', 'Le triadi (accordi)', 'Triads (chords)',
    'Accordi a tre note: maggiore, minore, diminuita, aumentata.',
    'Three-note chords: major, minor, diminished, augmented.',
    [{ id: 'triadi', title: 'Le triadi: maggiore, minore, diminuita, aumentata', titleEn: 'Triads: major, minor, diminished, augmented' }]),
]

/** Tutte le lezioni in ordine di percorso. */
export const ALL_LESSONS: LessonMeta[] = MODULES.flatMap((m) => m.lessons)

export function lessonById(id: string): LessonMeta | undefined {
  return ALL_LESSONS.find((l) => l.id === id)
}

export function lessonOrder(id: string): number {
  return ALL_LESSONS.findIndex((l) => l.id === id)
}

/**
 * Sblocco sequenziale: una lezione è disponibile se è la prima del percorso o se
 * la lezione immediatamente precedente è stata completata.
 */
export function isLessonUnlocked(id: string, completed: Set<string> | string[]): boolean {
  const set = completed instanceof Set ? completed : new Set(completed)
  const order = lessonOrder(id)
  if (order <= 0) return true
  return set.has(ALL_LESSONS[order - 1].id)
}

// Selettori bilingui per titolo/riassunto.
export const moduleTitle = (m: ModuleMeta, lang: string): string => (lang === 'en' ? m.titleEn : m.title)
export const moduleSummary = (m: ModuleMeta, lang: string): string =>
  lang === 'en' ? m.summaryEn : m.summary
export const lessonTitle = (l: LessonMeta, lang: string): string => (lang === 'en' ? l.titleEn : l.title)
