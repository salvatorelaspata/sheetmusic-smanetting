import { describe, expect, it } from 'vitest'
import { durationSeconds, durationTicks, PPQ } from '../src/core/durations'

describe('durations', () => {
  it('ticks delle durate base', () => {
    expect(durationTicks({ base: 'whole', dots: 0 })).toBe(PPQ * 4)
    expect(durationTicks({ base: 'quarter', dots: 0 })).toBe(PPQ)
    expect(durationTicks({ base: 'eighth', dots: 0 })).toBe(PPQ / 2)
    expect(durationTicks({ base: '32nd', dots: 0 })).toBe(PPQ / 8)
  })

  it('punti di valore', () => {
    expect(durationTicks({ base: 'quarter', dots: 1 })).toBe(PPQ * 1.5)
    expect(durationTicks({ base: 'half', dots: 1 })).toBe(PPQ * 3)
    expect(durationTicks({ base: 'half', dots: 2 })).toBe(PPQ * 2 * 1.75)
  })

  it('durata in secondi', () => {
    expect(durationSeconds({ base: 'quarter', dots: 0 }, 60)).toBeCloseTo(1)
    expect(durationSeconds({ base: 'half', dots: 0 }, 120)).toBeCloseTo(1)
  })
})
