import { describe, expect, it } from 'vitest'
import { createNote, createScore, dur } from '../src/core/score'
import {
  addMeasure,
  appendElement,
  deleteElement,
  removeMeasure,
} from '../src/core/scoreEdit'
import { measuresPerRow, pitchFromY, snapY } from '../src/core/staffGeometry'
import { toMusicXML } from '../src/core/musicxml'

describe('scoreEdit', () => {
  it('aggiunge ed elimina elementi in una battuta', () => {
    let score = createScore()
    const note = createNote([{ step: 'C', octave: 4 }], dur('quarter'))
    score = appendElement(score, 0, note)
    expect(score.measures[0].voices[0].elements).toHaveLength(1)
    score = deleteElement(score, 0, note.id)
    expect(score.measures[0].voices[0].elements).toHaveLength(0)
  })

  it('aggiunge e rimuove battute (mai sotto 1)', () => {
    let score = createScore()
    score = addMeasure(score)
    expect(score.measures).toHaveLength(2)
    score = removeMeasure(score, 1)
    expect(score.measures).toHaveLength(1)
    score = removeMeasure(score, 0)
    expect(score.measures).toHaveLength(1) // non scende sotto 1
  })
})

describe('staffGeometry', () => {
  it('mappa Y → altezza in chiave di violino', () => {
    // riga superiore = Fa5; la riga centrale (2 righe sotto) = Si4
    expect(pitchFromY('treble', 0, 10, 0)).toEqual({ step: 'F', octave: 5 })
    expect(pitchFromY('treble', 0, 10, 5)).toEqual({ step: 'E', octave: 5 })
    expect(pitchFromY('treble', 0, 10, 20)).toEqual({ step: 'B', octave: 4 })
  })

  it('aggancia Y alla riga/spazio più vicino', () => {
    expect(snapY(0, 10, 7)).toBe(5)
    expect(snapY(0, 10, 8)).toBe(10)
  })

  it('calcola le battute per riga', () => {
    expect(measuresPerRow(800)).toBe(3)
    expect(measuresPerRow(300)).toBe(1)
  })
})

describe('musicxml', () => {
  it('serializza uno Score in MusicXML valido', () => {
    const score = createScore({
      title: 'Prova & Co',
      measures: [
        {
          id: 'm1',
          voices: [{ id: 'v1', elements: [createNote([{ step: 'C', octave: 4 }], dur('quarter'))] }],
        },
      ],
    })
    const xml = toMusicXML(score)
    expect(xml).toContain('<score-partwise')
    expect(xml).toContain('<divisions>480</divisions>')
    expect(xml).toContain('<sign>G</sign>')
    expect(xml).toContain('<step>C</step>')
    expect(xml).toContain('<octave>4</octave>')
    expect(xml).toContain('<type>quarter</type>')
    expect(xml).toContain('Prova &amp; Co') // titolo con escape XML
  })
})
