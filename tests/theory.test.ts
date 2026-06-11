import { describe, expect, it } from 'vitest'
import {
  interval,
  keySignatureAccidentals,
  majorKeyName,
  majorScale,
  vexKeySignatureName,
} from '../src/core/theory'

describe('theory', () => {
  it('alterazioni in armatura', () => {
    expect(keySignatureAccidentals(0)).toEqual([])
    expect(keySignatureAccidentals(1)).toEqual([{ step: 'F', type: 'sharp' }])
    expect(keySignatureAccidentals(-2)).toEqual([
      { step: 'B', type: 'flat' },
      { step: 'E', type: 'flat' },
    ])
  })

  it('nomi delle tonalità', () => {
    expect(majorKeyName(0)).toBe('Do maggiore')
    expect(majorKeyName(1)).toBe('Sol maggiore')
    expect(majorKeyName(-2, 'en')).toBe('B♭ major')
    expect(vexKeySignatureName(2)).toBe('D')
    expect(vexKeySignatureName(-2)).toBe('Bb')
  })

  it('scala di Do maggiore = tasti bianchi', () => {
    const scale = majorScale(0, 4)
    expect(scale.map((p) => p.step)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'])
    expect(scale.every((p) => !p.accidental)).toBe(true)
    expect(scale[7].octave).toBe(5)
  })

  it('scala di Sol maggiore ha il Fa diesis', () => {
    const scale = majorScale(1, 4)
    expect(scale.find((p) => p.step === 'F')?.accidental).toBe('sharp')
  })

  it('riconoscimento degli intervalli', () => {
    expect(interval({ step: 'C', octave: 4 }, { step: 'E', octave: 4 }).nameIt).toBe(
      'Terza maggiore',
    )
    expect(interval({ step: 'C', octave: 4 }, { step: 'G', octave: 4 }).nameIt).toBe('Quinta giusta')
    expect(interval({ step: 'C', octave: 4 }, { step: 'C', octave: 5 }).nameIt).toBe('Ottava giusta')
    expect(interval({ step: 'E', octave: 4 }, { step: 'F', octave: 4 }).nameIt).toBe(
      'Seconda minore',
    )
  })
})
