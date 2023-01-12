import { expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseMidi, buildNote, Note, TimeSignature } from '../utils/parse'
import { analyze } from '../utils/analyze'
import { detectScales } from '../utils/scales'
import { detectChords, updateDistribution, ChordRange } from '../utils/chords'

function removeUuids(data: any, type: string) {
  switch (type) {
    case 'tracks': {
      const cleaned = data.tracks.map((track: any) => {
        track.notes = track.notes.map((note: any) => {
          return { ...note, uuid: 'removed' }
        })
        return track
      })
      data.tracks = cleaned
      break
    }

    case 'stats': {
      const cleaned = data.notes.byBeat.map((beat: any) => {
        beat.notes = beat.notes.map((note: any) => {
          return { ...note, uuid: 'removed' }
        })
        return beat
      })
      data.notes.byBeat = cleaned
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

  const cleaned = removeUuids(parsed, 'tracks')

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
    },
    {
      beatsInSignature: 9,
      denominator: 4,
      numerator: 3,
      startBeat: 305,
      startTicks: 146400,
    },
    {
      beatsInSignature: 97,
      denominator: 4,
      numerator: 5,
      startBeat: 314,
      startTicks: 150720,
    },
  ]

  expect(parsed.timeSignatures).toEqual(timeSignatures)
})

test('chord detection', () => {
  const path = `${__dirname}/midi/sample.mid`
  // const path = `${__dirname}/midi/takefivedavebrubeck.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)
  const stats = analyze(parsed)
  const chords = detectChords(stats, { unit: 'bar' })
  const cleaned = chords.map(chord => {
    return { ...chord, uniqueNotes: [] }
  })

  // expect(cleaned).toMatchSnapshot()
})

test('analyze()', () => {
  const path = `${__dirname}/midi/sample.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)
  const stats = analyze(parsed)

  const cleaned = removeUuids(stats, 'stats')

  expect(cleaned).toMatchSnapshot()
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

test.skip('updateDistribution()', () => {
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

  // Starts outside bucket, ends in bucket
  const noteA = buildNote({ startTicks: 50, noteNumber: 57 }, 80) as Note
  // Starts in bucket, ends in bucket
  const noteB = buildNote({ startTicks: 90, noteNumber: 59 }, 120) as Note
  // Starts in bucket, ends outside bucket
  const noteC = buildNote({ startTicks: 150, noteNumber: 60 }, 180) as Note
  // Starts before bucket, ends after bucket
  // This case note possible using buildNote :)

  // Starts after bucket, ends after bucket
  const noteE = buildNote({ startTicks: 280, noteNumber: 64 }, 290) as Note
  // Starts before bucket, ends before bucket
  const noteF = buildNote({ startTicks: 50, noteNumber: 65 }, 60) as Note

  expect(updateDistribution(cr, noteA).distribution).toEqual({
    ticks: { A: 10 },
  })
  expect(updateDistribution(cr, noteB).distribution).toEqual({
    ticks: { A: 10, B: 30 },
  })
  expect(updateDistribution(cr, noteC).distribution).toEqual({
    ticks: { A: 10, B: 30, C: 20 },
  })

  expect(updateDistribution(cr, noteE).distribution).toEqual({
    ticks: { A: 10, B: 30, C: 20 },
  })
  expect(updateDistribution(cr, noteF).distribution).toEqual({
    ticks: { A: 10, B: 30, C: 20 },
  })

  // Add A a 2nd time should increase ticks & percentage
  expect(updateDistribution(cr, noteA).distribution).toEqual({
    ticks: { A: 20, B: 30, C: 20 },
  })

  expect(updateDistribution(cr).distribution).toEqual({
    ticks: { A: 20, B: 30, C: 20 },
    time: { A: 0.2, B: 0.3, C: 0.2 },
  })
})
