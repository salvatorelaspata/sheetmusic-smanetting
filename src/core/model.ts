/**
 * Modello dati musicale — l'UNICA fonte di verità dell'app.
 * VexFlow e Tone.js sono solo "viste" derivate da queste strutture
 * (vedi REQUISITI.md §3 e §5). Le note usano internamente i nomi
 * anglosassoni (C–B); la presentazione IT/EN è in core/pitch.ts.
 */

export type Step = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

export type Accidental = 'natural' | 'sharp' | 'flat' | 'double-sharp' | 'double-flat'

export interface Pitch {
  step: Step
  /** Ottava scientifica: il Do centrale è C4. */
  octave: number
  /** Alterazione esplicita (oltre all'armatura). */
  accidental?: Accidental
}

export type DurationBase = 'whole' | 'half' | 'quarter' | 'eighth' | '16th' | '32nd'

export type Dots = 0 | 1 | 2

export interface Duration {
  base: DurationBase
  dots: Dots
}

export type Articulation = 'staccato' | 'accent' | 'tenuto'

export type Dynamic = 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff'

export interface NoteElement {
  id: string
  kind: 'note' | 'rest'
  duration: Duration
  /** Vuoto per le pause, 1 per una nota, >1 per un accordo. */
  pitches: Pitch[]
  /** Legatura di valore. */
  tie?: 'start' | 'stop' | 'continue'
  articulations?: Articulation[]
  /** Legatura di portamento. */
  slur?: 'start' | 'stop'
  dynamic?: Dynamic
}

export interface Voice {
  id: string
  elements: NoteElement[]
}

export interface Measure {
  id: string
  /** v1: una sola voce per battuta. */
  voices: Voice[]
  /** Override locale dell'indicazione di tempo (cambi di tempo). */
  timeSignature?: TimeSignature
}

export type ClefType = 'treble' | 'bass'

/**
 * Chiavi supportate SOLO in visualizzazione (esempi di Teoria): oltre a violino
 * (treble) e basso (bass), le chiavi di Do — contralto (3ª riga) e tenore (4ª
 * riga). L'editor Componi, lo Score e l'export MusicXML restano a violino/basso
 * (ClefType): qui serve solo a disegnare gli esempi delle lezioni.
 */
export type DisplayClef = ClefType | 'alto' | 'tenor'

export interface TimeSignature {
  beats: number
  beatType: number
}

export interface KeySignature {
  /** Posizione sul circolo delle quinte: -7..+7 (modo maggiore). */
  fifths: number
}

export interface Score {
  id: string
  title: string
  clef: ClefType
  timeSignature: TimeSignature
  keySignature: KeySignature
  tempoBpm: number
  measures: Measure[]
  createdAt: number
  updatedAt: number
  schemaVersion: number
}

export const SCORE_SCHEMA_VERSION = 1
