import { expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseMidi, Note } from '../utils/midi'
import {
  detectChords,
  updateDistribution,
  Bucket,
} from '../utils/music-analysis'

test('parseMidi() should parse to a known format', () => {
  const path = `${__dirname}/beat.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)

  // Do some light schema validation
  expect(parsed.timeSignature.denominator).toBeDefined()
  expect(parsed.timeSignature.numerator).toBeDefined()
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

  // Keep a snapshot around in case adaptors or 3rd party libs are changed
  expect(parsed).toMatchSnapshot()
})

// Consider moving detection (or bucket building) to the parsing stage
test('chord detection', () => {
  const path = `${__dirname}/sample.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)

  const chords = detectChords(parsed, { unit: 'beat' })
  console.log(chords)
})

test('updateDistribution()', () => {
  const bucket: Bucket = {
    notes: new Set(['A', 'B', 'C', 'D']),
    chords: [],
    unit: 'bar',
    unitNumber: 0,
    distribution: {
      ticks: {},
    },
    startTicks: 100,
    durationTicks: 100,
  }

  // Starts outside bucket, ends in bucket
  const noteA: Note = {
    startTicks: 80,
    durationTicks: 30,
    noteNumber: 57,
    noteName: ['A'],
    noteNameWithOctave: ['A3'],
  }

  // Starts in bucket, ends in bucket
  const noteB: Note = {
    startTicks: 120,
    durationTicks: 30,
    noteNumber: 59,
    noteName: ['B'],
    noteNameWithOctave: ['B3'],
  }

  // Starts in bucket, ends outside bucket
  const noteC: Note = {
    startTicks: 180,
    durationTicks: 30,
    noteNumber: 60,
    noteName: ['C'],
    noteNameWithOctave: ['C4'],
  }

  // Starts before bucket, ends after bucket
  const noteD: Note = {
    startTicks: 80,
    durationTicks: 130,
    noteNumber: 62,
    noteName: ['D'],
    noteNameWithOctave: ['D4'],
  }

  // Starts after bucket, ends after bucket
  const noteE: Note = {
    startTicks: 280,
    durationTicks: 10,
    noteNumber: 64,
    noteName: ['E'],
    noteNameWithOctave: ['E4'],
  }

  // Starts before bucket, ends before bucket
  const noteF: Note = {
    startTicks: 50,
    durationTicks: 10,
    noteNumber: 65,
    noteName: ['F'],
    noteNameWithOctave: ['F4'],
  }

  expect(updateDistribution(bucket, noteA).distribution).toEqual({
    ticks: {
      A: 10,
    },
  })
  expect(updateDistribution(bucket, noteB).distribution).toEqual({
    ticks: {
      A: 10,
      B: 30,
    },
  })
  expect(updateDistribution(bucket, noteC).distribution).toEqual({
    ticks: {
      A: 10,
      B: 30,
      C: 20,
    },
  })
  expect(updateDistribution(bucket, noteD).distribution).toEqual({
    ticks: {
      A: 10,
      B: 30,
      C: 20,
      D: 100,
    },
  })
  expect(updateDistribution(bucket, noteE).distribution).toEqual({
    ticks: {
      A: 10,
      B: 30,
      C: 20,
      D: 100,
    },
  })
  expect(updateDistribution(bucket, noteF).distribution).toEqual({
    ticks: {
      A: 10,
      B: 30,
      C: 20,
      D: 100,
    },
  })

  // Add A a 2nd time should increase ticks & percentage
  expect(updateDistribution(bucket, noteA).distribution).toEqual({
    ticks: {
      A: 20,
      B: 30,
      C: 20,
      D: 100,
    },
  })

  expect(updateDistribution(bucket).distribution).toEqual({
    ticks: {
      A: 20,
      B: 30,
      C: 20,
      D: 100,
    },
    time: {
      A: 0.2,
      B: 0.3,
      C: 0.2,
      D: 1,
    },
  })
})
