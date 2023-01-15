import { expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  parseMidi,
  buildNote,
  makeBarsAndBeats,
  Note,
  TimeSignature,
} from '../utils/parse'
import { analyze } from '../utils/analyze'
import { detectScales } from '../utils/scales'
import { detectChords, updateDistribution, ChordRange } from '../utils/chords'

function removeUuids(data: any, type: string) {
  switch (type) {
    case 'parsed': {
      const cleaned = data.tracks.map((track: any) => {
        track.notes = track.notes.map((note: any) => {
          return { ...note, id: 'removed' }
        })
        return { ...track, id: 'removed' }
      })
      data.tracks = cleaned
      data.notesMap = {}
      break
    }

    case 'stats': {
      const cleanedBars = data.notes.byBar.map((bar: any) => {
        bar.beats = bar.beats.map((beat: any) => {
          beat.notes = beat.notes.map((note: any) => {
            return { ...note, id: 'removed' }
          })
          return beat
        })

        bar.notes = bar.notes.map((note: any) => {
          return { ...note, id: 'removed' }
        })

        return bar
      })

      data.notes.byBar = cleanedBars
      data.notes.map = {}
      data.tracks = []
      break
    }
  }

  return data
}

test('parseMidi() should parse to a known format', () => {
  const path = `${__dirname}/midi/beat.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)

  // Do some light schema validation
  expect(parsed.timeSignatures[0].denominator).toBeDefined()
  expect(parsed.timeSignatures[0].numerator).toBeDefined()
  expect(parsed.timings.durationTicks).toBeDefined()
  expect(parsed.timings.microsecondsPerBeat).toBeDefined()
  expect(parsed.timings.ticksPerBeat).toBeDefined()
  expect(parsed.tracks[0].notes[0].durationTicks).toBeDefined()
  expect(parsed.tracks[0].notes[0].noteNameWithOctave).toBeDefined()
  expect(parsed.tracks[0].notes[0].noteName).toBeDefined()
  expect(parsed.tracks[0].notes[0].noteNumber).toBeDefined()
  expect(parsed.tracks[0].notes[0].startTicks).toBeDefined()
  expect(parsed.tracks[0].durationTicks).toBe(479)
  expect(parsed.tracks[0].notes[0].noteNameWithOctave).toEqual(['A3', 'A3'])
  expect(parsed.tracks[0].notes[2].noteNameWithOctave).toEqual(['Bb3', 'A#3'])
  expect(parsed.tracks[0].notes[0].noteName).toEqual(['A', 'A'])
  expect(parsed.tracks[0].notes[2].noteName).toEqual(['Bb', 'A#'])

  const cleaned = removeUuids(parsed, 'parsed')

  expect(cleaned).toMatchSnapshot()
})

test('parseMidi() should parse multiple time signatures', () => {
  const path = `${__dirname}/midi/takefivedavebrubeck.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)
  const timeSignatures: TimeSignature[] = [
    {
      beatsInSignature: 305,
      denominator: 4,
      numerator: 5,
      startBeat: 0,
      startTicks: 0,
      beatTicksMultiplier: 1,
    },
    {
      beatsInSignature: 9,
      denominator: 4,
      numerator: 3,
      startBeat: 305,
      startTicks: 146400,
      beatTicksMultiplier: 1,
    },
    {
      beatsInSignature: 97,
      denominator: 4,
      numerator: 5,
      startBeat: 314,
      startTicks: 150720,
      beatTicksMultiplier: 1,
    },
  ]

  expect(parsed.timeSignatures).toEqual(timeSignatures)
})

test('chord detection', () => {
  const path = `${__dirname}/midi/2bar.mid`
  // const path = `${__dirname}/midi/takefivedavebrubeck.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)
  const stats = analyze(parsed)
  const chords = detectChords(stats, { unit: 'bar' })
  const cleaned = chords.map(chord => {
    return { ...chord, uniqueNotes: [] }
  })

  expect(cleaned).toMatchSnapshot()
})

test('analyze()', () => {
  const path = `${__dirname}/midi/sample.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)
  const stats = analyze(parsed)

  const cleaned = removeUuids(stats, 'stats')

  expect(cleaned).toMatchSnapshot()
})

test('makeBars()', () => {
  const path = `${__dirname}/midi/timesigs.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)

  const bars = makeBarsAndBeats(
    parsed.timeSignatures,
    parsed.timings.ticksPerBeat,
  )

  const analyzed = analyze(parsed)
  const chords = detectChords(analyzed, { unit: 'bar' })
})

test('detectScales()', () => {
  const presence = {
    A: 1,
    B: 0.2438918433076174,
    C: 0.6079095198861508,
    D: 0.3573140588719945,
    E: 0.4976630963972735,
    G: 0.41138491498764135,
  }

  const scales = detectScales(presence)
  expect(scales).toMatchSnapshot()
})

test('updateDistribution()', () => {
  const cr: ChordRange = {
    notes: new Set(['A', 'B', 'C', 'D']),
    chords: [],
    unit: 'bar',
    unitNumber: 0,
    distribution: {
      ticks: {},
    },
    startTicks: 100,
    durationTicks: 100,
    uniqueNotes: [],
  }

  const b = buildNote

  // Starts outside bucket, ends in bucket
  const A = b({ startTicks: 50, noteNumber: 57, durationTicks: 60 }) as Note
  // Starts in bucket, ends in bucket
  const B = b({ startTicks: 110, noteNumber: 59, durationTicks: 30 }) as Note
  // Starts in bucket, ends outside bucket
  const C = b({ startTicks: 180, noteNumber: 60, durationTicks: 30 }) as Note
  // Starts before bucket, ends after bucket
  // This case note possible using buildNote :)

  // Starts after bucket, ends after bucket
  const E = b({ startTicks: 280, noteNumber: 64, durationTicks: 10 }) as Note
  // Starts before bucket, ends before bucket
  const F = b({ startTicks: 50, noteNumber: 65, durationTicks: 10 }) as Note

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
