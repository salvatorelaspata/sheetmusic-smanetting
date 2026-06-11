import { describe, expect, it } from 'vitest'
import {
  diatonicValue,
  frequencyOf,
  midiOf,
  noteName,
  stepFromItalian,
  vexAccidentalCode,
  vexKey,
} from '../src/core/pitch'

describe('pitch', () => {
  it('numero MIDI', () => {
    expect(midiOf({ step: 'C', octave: 4 })).toBe(60)
    expect(midiOf({ step: 'A', octave: 4 })).toBe(69)
    expect(midiOf({ step: 'C', octave: 4, accidental: 'sharp' })).toBe(61)
    expect(midiOf({ step: 'B', octave: 4, accidental: 'flat' })).toBe(70)
  })

  it('frequenza (La4 = 440 Hz)', () => {
    expect(frequencyOf({ step: 'A', octave: 4 })).toBeCloseTo(440)
    expect(frequencyOf({ step: 'A', octave: 5 })).toBeCloseTo(880)
  })

  it('nome italiano ed equivalente inglese', () => {
    expect(noteName({ step: 'G', octave: 4 })).toBe('Sol')
    expect(noteName({ step: 'F', octave: 4, accidental: 'sharp' }, { showEnglish: true })).toBe(
      'Fa♯ (F#)',
    )
  })

  it('chiave e alterazioni VexFlow', () => {
    expect(vexKey({ step: 'E', octave: 4, accidental: 'flat' })).toBe('eb/4')
    expect(vexKey({ step: 'C', octave: 4 })).toBe('c/4')
    expect(vexAccidentalCode({ step: 'C', octave: 4, accidental: 'sharp' })).toBe('#')
    expect(vexAccidentalCode({ step: 'C', octave: 4 })).toBeUndefined()
  })

  it('valore diatonico monotòno con l\'altezza', () => {
    expect(diatonicValue({ step: 'D', octave: 4 })).toBeGreaterThan(
      diatonicValue({ step: 'C', octave: 4 }),
    )
    expect(diatonicValue({ step: 'C', octave: 5 })).toBeGreaterThan(
      diatonicValue({ step: 'B', octave: 4 }),
    )
  })

  it('parsing dal nome italiano', () => {
    expect(stepFromItalian('Sol')).toBe('G')
    expect(stepFromItalian('do')).toBe('C')
    expect(stepFromItalian('xx')).toBeUndefined()
  })
})
