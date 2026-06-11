import { describe, expect, it } from 'vitest'
import { createMeasure, createNote, createRest, dur } from '../src/core/score'
import { expectedTicks, measureStatus, remainingTicks } from '../src/core/validation'
import type { Pitch } from '../src/core/model'

const C4: Pitch = { step: 'C', octave: 4 }
const ts44 = { beats: 4, beatType: 4 }
const ts68 = { beats: 6, beatType: 8 }

describe('validation', () => {
  it('battuta completa in 4/4', () => {
    const m = createMeasure([
      createNote([C4], dur('quarter')),
      createNote([C4], dur('quarter')),
      createNote([C4], dur('half')),
    ])
    expect(measureStatus(m, ts44)).toBe('complete')
    expect(remainingTicks(m, ts44)).toBe(0)
  })

  it('battuta incompleta ed eccedente', () => {
    const incomplete = createMeasure([createNote([C4], dur('quarter'))])
    expect(measureStatus(incomplete, ts44)).toBe('incomplete')

    const overfull = createMeasure([createNote([C4], dur('whole')), createNote([C4], dur('quarter'))])
    expect(measureStatus(overfull, ts44)).toBe('overfull')
  })

  it('battuta vuota', () => {
    expect(measureStatus(createMeasure(), ts44)).toBe('empty')
  })

  it('6/8 attende 1440 ticks', () => {
    expect(expectedTicks(ts68)).toBe(1440)
    const m = createMeasure([createRest(dur('half', 1))]) // minima col punto = 1440
    expect(measureStatus(m, ts68)).toBe('complete')
  })
})
