import { describe, expect, it } from 'vitest'
import { midiOf, pitchClass, pitchFromMidi, stepPitchClass } from '../src/core/pitch'
import { SIMPLE_INTERVALS } from '../src/core/theory'
import { randomInt, sample } from '../src/core/random'
import { RICONOSCI_LEVELS } from '../src/data/riconosci'

describe('pratica — classe d\'altezza', () => {
  it('pitchClass ignora l\'ottava', () => {
    expect(pitchClass({ step: 'C', octave: 4 })).toBe(0)
    expect(pitchClass({ step: 'C', octave: 5 })).toBe(0)
    expect(pitchClass({ step: 'F', octave: 4, accidental: 'sharp' })).toBe(6)
    expect(pitchClass({ step: 'B', octave: 4, accidental: 'flat' })).toBe(10)
  })

  it('stepPitchClass dei nomi naturali', () => {
    expect(stepPitchClass('C')).toBe(0)
    expect(stepPitchClass('G')).toBe(7)
    expect(stepPitchClass('B')).toBe(11)
  })
})

describe('pratica — random utils', () => {
  it('sample restituisce elementi distinti', () => {
    const s = sample([1, 2, 3, 4, 5], 3)
    expect(s).toHaveLength(3)
    expect(new Set(s).size).toBe(3)
  })

  it('randomInt resta nei limiti', () => {
    for (let i = 0; i < 50; i++) {
      const n = randomInt(2, 5)
      expect(n).toBeGreaterThanOrEqual(2)
      expect(n).toBeLessThanOrEqual(5)
    }
  })
})

describe('pratica — livelli Riconosci la nota', () => {
  it('i pool non sono vuoti e l\'ultimo livello ha alterazioni', () => {
    RICONOSCI_LEVELS.forEach((l) => expect(l.pool.length).toBeGreaterThan(0))
    const alt = RICONOSCI_LEVELS.find((l) => l.id === 'alterazioni')
    expect(alt).toBeDefined()
    expect(alt!.pool.every((p) => !!p.accidental)).toBe(true)
  })
})

describe('pratica — ear training', () => {
  it('pitchFromMidi è coerente con midiOf (per gli accordi)', () => {
    for (let m = 48; m <= 84; m++) expect(midiOf(pitchFromMidi(m))).toBe(m)
  })

  it('SIMPLE_INTERVALS ha nomi IT/EN', () => {
    expect(SIMPLE_INTERVALS.length).toBeGreaterThan(5)
    expect(SIMPLE_INTERVALS.every((s) => !!s.it && !!s.en)).toBe(true)
  })
})
