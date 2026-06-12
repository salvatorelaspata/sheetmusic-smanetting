/**
 * Catalogo degli esercizi di Pratica (metadati). I titoli/descrizioni mostrati
 * usano le chiavi i18n (`exercises.<i18nKey>.*`), così sono bilingui come le
 * pagine degli esercizi.
 */

export interface ExerciseMeta {
  id: string
  /** Chiave i18n breve: exercises.<i18nKey>.title / .desc */
  i18nKey: string
  /** Rotta dell'esercizio. */
  path: string
}

export const EXERCISES: ExerciseMeta[] = [
  { id: 'riconosci-nota', i18nKey: 'riconosci', path: '/pratica/riconosci-nota' },
  { id: 'valori-pause', i18nKey: 'valori', path: '/pratica/valori-pause' },
  { id: 'ritmo', i18nKey: 'ritmo', path: '/pratica/ritmo' },
  { id: 'armature', i18nKey: 'armature', path: '/pratica/armature' },
  { id: 'dettato', i18nKey: 'dettato', path: '/pratica/dettato' },
  { id: 'intervalli', i18nKey: 'intervalli', path: '/pratica/intervalli' },
  { id: 'accordi', i18nKey: 'accordi', path: '/pratica/accordi' },
]

export function exerciseById(id: string): ExerciseMeta | undefined {
  return EXERCISES.find((e) => e.id === id)
}
