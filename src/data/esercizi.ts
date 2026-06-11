/**
 * Catalogo degli esercizi di Pratica (metadati). I livelli e la logica di
 * ciascun esercizio verranno definiti nella Fase 4.
 */

export interface ExerciseMeta {
  id: string
  title: string
  titleEn: string
  description: string
  /** Rotta dell'esercizio (attiva dalla Fase 4). */
  path: string
}

export const EXERCISES: ExerciseMeta[] = [
  {
    id: 'riconosci-nota',
    title: 'Riconosci la nota',
    titleEn: 'Name that note',
    description: 'Una nota appare sul pentagramma: indica il nome o premi il tasto giusto.',
    path: '/pratica/riconosci-nota',
  },
  {
    id: 'valori-pause',
    title: 'Valori e pause',
    titleEn: 'Values and rests',
    description: 'Associa ogni simbolo alla sua durata.',
    path: '/pratica/valori-pause',
  },
  {
    id: 'ritmo',
    title: 'Allenamento ritmico',
    titleEn: 'Rhythm training',
    description: 'Riproduci una battuta a tempo con il metronomo.',
    path: '/pratica/ritmo',
  },
  {
    id: 'armature',
    title: 'Quiz sulle armature',
    titleEn: 'Key signature quiz',
    description: 'Riconosci la tonalità maggiore dall’armatura di chiave.',
    path: '/pratica/armature',
  },
  {
    id: 'dettato',
    title: 'Dettato melodico',
    titleEn: 'Melodic dictation',
    description: 'Ascolta 3–4 note e selezionale sul pentagramma.',
    path: '/pratica/dettato',
  },
]

export function exerciseById(id: string): ExerciseMeta | undefined {
  return EXERCISES.find((e) => e.id === id)
}
