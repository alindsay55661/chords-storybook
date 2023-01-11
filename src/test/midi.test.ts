import { expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseMidi, buildNote, Note } from '../utils/midi'
import { analyze, analyzeScale } from '../utils/music-analysis'
import { detectChords, updateDistribution, ChordRange } from '../utils/chords'

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
  // Remove uuids first
  const cleaned = parsed.tracks.map(track => {
    track.notes = track.notes.map(note => {
      return { ...note, uuid: 'removed' }
    })
    return track
  })

  parsed.tracks = cleaned
  expect(parsed).toMatchSnapshot()
})

// Consider moving detection (or bucket building) to the parsing stage
test('chord detection', () => {
  const path = `${__dirname}/sample.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)
  const chords = detectChords(parsed, { unit: 'beat' })
  const cleaned = chords.map(chord => {
    return { ...chord, uniqueNotes: [] }
  })

  expect(cleaned).toMatchSnapshot()
})

test('analyze()', () => {
  const path = `${__dirname}/sample.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)
  const stats = analyze(parsed, { unit: 'beat' })
  const cleaned = stats.chords.chordRanges.map(chord => {
    return { ...chord, uniqueNotes: [] }
  })

  stats.chords.chordRanges = cleaned

  expect(stats).toMatchSnapshot()
})

test('analyzeScale()', () => {
  const presence = {
    A: 1,
    B: 0.2438918433076174,
    C: 0.6079095198861508,
    D: 0.3573140588719945,
    E: 0.4976630963972735,
    G: 0.41138491498764135,
  }

  const scales = analyzeScale(presence)
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
