/** Generazione di id stabili per gli elementi del modello. */
export function makeId(prefix = 'id'): string {
  const c: Crypto | undefined = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') {
    return `${prefix}_${c.randomUUID()}`
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 6)}`
}
