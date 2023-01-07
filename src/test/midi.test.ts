import { expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseMidi } from '../utils/midi'
import { detectChords } from '../utils/music-analysis'

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
  expect(parsed.tracks[0].notes[0].partStartTicks).toBeDefined()
  expect(parsed.tracks[0].durationTicks).toBe(479)
  expect(parsed.tracks[0].notes[0].noteNameWithOctave).toEqual(['A3', 'A3'])
  expect(parsed.tracks[0].notes[2].noteNameWithOctave).toEqual(['Bb3', 'A#3'])
  expect(parsed.tracks[0].notes[0].noteName).toEqual(['A', 'A'])
  expect(parsed.tracks[0].notes[2].noteName).toEqual(['Bb', 'A#'])

  // Keep a snapshot around in case adaptors or 3rd party libs are changed
  expect(parsed).toMatchSnapshot()
})

// Consider moving detection to the parsing stage
test('chord detection', () => {
  const path = `${__dirname}/sample.mid`
  const data = readFileSync(path)
  const parsed = parseMidi(data)

  const chords = detectChords(parsed, { resolution: 'beat' })
  console.log(chords)
})
