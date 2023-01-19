import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseMidi, makeNote, Note } from '../utils/parse'
import { makeChordRange, updateDistribution, ChordRange } from '../utils/chords'
import { makeSong } from '../utils/song'

describe('makeChordRange()', () => {
  test('by bar', () => {
    const path = `${__dirname}/midi/chord-test.mid`
    const data = readFileSync(path)
    const parsed = parseMidi(data)
    const song = makeSong(parsed)
    const bar1 = song.notes.byBar[0]

    const cr = makeChordRange(bar1.notes, {
      unit: 'bar',
      startTicks: bar1.startTicks,
      durationTicks: bar1.durationTicks,
    })

    // Validate the stats only for now
    expect(cr).toMatchObject({
      unitNumber: 0,
      durationTicks: 2400,
      notes: new Set(['Eb', 'Bb', 'G', 'D', 'F', 'Db', 'Ab']),
      uniqueNotes: new Set([75, 70, 67, 51, 74, 65, 73, 68]),
    })
    expect(cr.distribution.ticks).toMatchObject({
      Eb: 3268,
      Bb: 2304,
      G: 914,
      D: 936,
      F: 1393,
      Db: 456,
      Ab: 2,
    })
    expect(cr.distribution.time).toMatchObject({
      Eb: 1.3616666666666666,
      Bb: 0.96,
      G: 0.38083333333333336,
      D: 0.39,
      F: 0.5804166666666667,
      Db: 0.19,
      Ab: 0.0008333333333333334,
    })
  })
})

describe('updateDistribution()', () => {
  test('ensure ticks and time are calculated', () => {
    const cr: ChordRange = {
      notes: new Set(['A', 'B', 'C', 'D']),
      chords: [],
      chordsInclusive: [],
      unit: 'bar',
      unitNumber: 0,
      distribution: {
        ticks: {},
      },
      startTicks: 100,
      durationTicks: 100,
      uniqueNotes: new Set([]),
    }

    const m = makeNote

    // Starts outside bucket, ends in bucket
    const A = m({ startTicks: 50, noteNumber: 57, durationTicks: 60 }) as Note
    // Starts in bucket, ends in bucket
    const B = m({ startTicks: 110, noteNumber: 59, durationTicks: 30 }) as Note
    // Starts in bucket, ends outside bucket
    const C = m({ startTicks: 180, noteNumber: 60, durationTicks: 30 }) as Note
    // Starts before bucket, ends after bucket
    // This case note possible using buildNote :)

    // Starts after bucket, ends after bucket
    const E = m({ startTicks: 280, noteNumber: 64, durationTicks: 10 }) as Note
    // Starts before bucket, ends before bucket
    const F = m({ startTicks: 50, noteNumber: 65, durationTicks: 10 }) as Note

    expect(updateDistribution(cr, A).distribution).toEqual({
      ticks: { A: 10 },
    })
    expect(updateDistribution(cr, B).distribution).toEqual({
      ticks: { A: 10, B: 30 },
    })
    expect(updateDistribution(cr, C).distribution).toEqual({
      ticks: { A: 10, B: 30, C: 20 },
    })

    expect(updateDistribution(cr, E).distribution).toEqual({
      ticks: { A: 10, B: 30, C: 20 },
    })
    expect(updateDistribution(cr, F).distribution).toEqual({
      ticks: { A: 10, B: 30, C: 20 },
    })

    // Add A a 2nd time should increase ticks & percentage
    expect(updateDistribution(cr, A).distribution).toEqual({
      ticks: { A: 20, B: 30, C: 20 },
    })

    expect(updateDistribution(cr).distribution).toEqual({
      ticks: { A: 20, B: 30, C: 20 },
      time: { A: 0.2, B: 0.3, C: 0.2 },
    })
  })
})
