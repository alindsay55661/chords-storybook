import { describe, expect, test, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  parseMidi,
  makeNote,
  makeTimeSignature,
  updateTimeSignatures,
  makeBarsAndBeats,
} from '../utils/parse'

describe('makeNote()', () => {
  test('invalid notes', () => {
    const badDuration = { startTicks: 0, durationTicks: 0, noteNumber: 64 }
    const badStart = { startTicks: -100, durationTicks: 100, noteNumber: 64 }
    const lowNumber = { startTicks: 0, durationTicks: 100, noteNumber: -64 }
    const highNumber = { startTicks: 0, durationTicks: 100, noteNumber: 128 }

    expect(makeNote(badDuration)).toBe(false)
    expect(makeNote(badStart)).toBe(false)
    expect(makeNote(lowNumber)).toBe(false)
    expect(makeNote(highNumber)).toBe(false)
  })

  test('valid notes', () => {
    const noteProps = [
      'id',
      'midiChannel',
      'startTicks',
      'durationTicks',
      'noteNumber',
      'noteName',
      'noteNameWithOctave',
    ].sort()
    const note = { startTicks: 0, durationTicks: 100 }
    const cNoteProps = { ...note, noteNumber: 60 }
    const cNote = makeNote(cNoteProps)
    const dNoteProps = { ...note, noteNumber: 61 }
    const dNote = makeNote(dNoteProps)

    expect(Object.keys(cNote).sort()).toEqual(noteProps)

    // Vaidate given properties
    expect(cNote).toMatchObject({
      startTicks: note.startTicks,
      durationTicks: note.durationTicks,
      noteNumber: cNoteProps.noteNumber,
    })

    // Validate generated properties
    expect(cNote).toHaveProperty('id')
    expect(cNote).toMatchObject({ midiChannel: 1 })

    // // Vaidate Tonal name conversion
    expect(cNote).toMatchObject({
      noteName: ['C', 'C'],
      noteNameWithOctave: ['C4', 'C4'],
    })
    expect(dNote).toMatchObject({
      noteName: ['Db', 'C#'],
      noteNameWithOctave: ['Db4', 'C#4'],
    })
  })
})

describe('makeTimeSignature()', () => {
  test('invalid', () => {
    expect(() => makeTimeSignature(0, 0, 4)).toThrowError()
    expect(() => makeTimeSignature(0, 4, 0)).toThrowError()
  })

  test('valid', () => {
    expect(makeTimeSignature(0, 4, 4)).toMatchObject({
      startTicks: 0,
      startBeat: 0,
      beatsInSignature: 0,
      numerator: 4,
      denominator: 4,
      beatTicksMultiplier: 1,
    })

    expect(makeTimeSignature(0, 7, 8)).toMatchObject({
      startTicks: 0,
      startBeat: 0,
      beatsInSignature: 0,
      numerator: 7,
      denominator: 8,
      beatTicksMultiplier: 0.5,
    })

    expect(makeTimeSignature(0, 3, 2)).toMatchObject({
      startTicks: 0,
      startBeat: 0,
      beatsInSignature: 0,
      numerator: 3,
      denominator: 2,
      beatTicksMultiplier: 2,
    })
  })
})

describe('updateTimeSignatures()', () => {
  // The following time signatures should each have 1 full measure
  // 1 measure of 5/4: 480 * 5 * 1   = 2400
  // 1 measure of 3/2: 480 * 3 * 2   = 2880
  // 1 meausre of 7/8: 480 * 7 * 0.5 = 1680
  //                                 -------
  //               songDurationTicks = 6960

  const ticksPerBeat = 480
  const ts1 = makeTimeSignature(0, 5, 4)
  const ts2 = makeTimeSignature(0 + 2400, 3, 2)
  const ts3 = makeTimeSignature(0 + 2400 + 2880, 7, 8)
  const songDurationTicks = 6960
  const timeSignatures = [ts1, ts2, ts3]

  test('invalid', () => {
    expect(() =>
      updateTimeSignatures(timeSignatures, 0, ticksPerBeat),
    ).toThrowError()
  })

  test('valid', () => {
    const updated = updateTimeSignatures(
      timeSignatures,
      songDurationTicks,
      ticksPerBeat,
    )

    expect(updated[0]).toMatchObject({
      startTicks: 0,
      durationTicks: 2400,
      startBeat: 0,
      beatsInSignature: ts1.numerator,
    })
    expect(updated[1]).toMatchObject({
      startTicks: 2400,
      durationTicks: 2880,
      startBeat: 5,
      beatsInSignature: ts2.numerator,
    })
    expect(updated[2]).toMatchObject({
      startTicks: 5280,
      durationTicks: 1680,
      startBeat: 8,
      beatsInSignature: ts3.numerator,
    })
  })
})

describe('makeBarsAndBeats()', () => {
  test('4/4 time signature with 3 bars', () => {
    const ticksPerBeat = 480
    const numerator = 4
    const denominator = 4
    const ts = makeTimeSignature(0, numerator, denominator)
    const measureDurationTicks =
      ticksPerBeat * numerator * ts.beatTicksMultiplier
    // 3 bars of 4/4
    const songDurationTicks = measureDurationTicks * 3
    const updated = updateTimeSignatures([ts], songDurationTicks, ticksPerBeat)

    const bars = makeBarsAndBeats(updated, ticksPerBeat)

    expect(bars.length).toBe(3)
    expect(bars[0]).toMatchObject({
      startTicks: 0,
      durationTicks: measureDurationTicks,
      beatCount: numerator,
    })
    expect(bars[0].beats.length).toBe(numerator)

    // Spot check timing of select beats
    expect(bars[0].beats[2]).toMatchObject({
      startTicks: 960, // 480 * 3 * 1
      durationTicks: ticksPerBeat * ts.beatTicksMultiplier,
    })
    expect(bars[1].beats[3]).toMatchObject({
      startTicks: 3360, // 480 * 7 * 1
      durationTicks: ticksPerBeat * ts.beatTicksMultiplier,
    })
    expect(bars[2].beats[1]).toMatchObject({
      startTicks: 4320, // 480 * 9 * 1
      durationTicks: ticksPerBeat * ts.beatTicksMultiplier,
    })
  })

  test('multiple time signatures with 1 bar each', () => {
    // The following time signatures should each have 1 full measure
    // 1 measure of 5/4: 480 * 5 * 1   = 2400
    // 1 measure of 3/2: 480 * 3 * 2   = 2880
    // 1 meausre of 7/8: 480 * 7 * 0.5 = 1680
    //                                 -------
    //               songDurationTicks = 6960

    const ticksPerBeat = 480
    const ts1 = makeTimeSignature(0, 5, 4)
    const ts2 = makeTimeSignature(0 + 2400, 3, 2)
    const ts3 = makeTimeSignature(0 + 2400 + 2880, 7, 8)
    const songDurationTicks = 6960
    const timeSignatures = [ts1, ts2, ts3]
    const updated = updateTimeSignatures(
      timeSignatures,
      songDurationTicks,
      ticksPerBeat,
    )

    const bars = makeBarsAndBeats(updated, ticksPerBeat)

    expect(bars.length).toBe(3)
    expect(bars[0]).toMatchObject({
      startTicks: 0,
      durationTicks: ts1.numerator * ts1.beatTicksMultiplier * ticksPerBeat,
      beatCount: ts1.numerator,
    })
    expect(bars[0].beats.length).toBe(ts1.numerator)

    expect(bars[1]).toMatchObject({
      startTicks: 2400,
      durationTicks: ts2.numerator * ts2.beatTicksMultiplier * ticksPerBeat,
      beatCount: ts2.numerator,
    })
    expect(bars[1].beats.length).toBe(ts2.numerator)

    expect(bars[2]).toMatchObject({
      startTicks: 5280,
      durationTicks: ts3.numerator * ts3.beatTicksMultiplier * ticksPerBeat,
      beatCount: ts3.numerator,
    })
    expect(bars[2].beats.length).toBe(ts3.numerator)

    // Spot check timing of select beats
    expect(bars[0].beats[2]).toMatchObject({
      startTicks: 960, // 480 * 3 * 1
      durationTicks: ticksPerBeat * ts1.beatTicksMultiplier,
    })
    expect(bars[1].beats[1]).toMatchObject({
      //                   bar in 5/4      bar in 3/2
      startTicks: 3360, // (480 * 5 * 1) + (480 * 1 * 2)
      durationTicks: ticksPerBeat * ts2.beatTicksMultiplier,
    })
    expect(bars[2].beats[6]).toMatchObject({
      //                   bar in 5/4      bar in 3/2      bar in 7/8
      startTicks: 6720, // (480 * 5 * 1) + (480 * 3 * 2) + (480 * 6 * 0.5)
      durationTicks: ticksPerBeat * ts3.beatTicksMultiplier,
    })
  })
})

describe('parseMidi()', () => {
  test('generic parsing', () => {
    const path = `${__dirname}/midi/beat.mid`
    const data = readFileSync(path)
    const parsed = parseMidi(data)

    expect(parsed).toHaveProperty('timings.durationTicks')
    expect(parsed).toHaveProperty('timings.ticksPerBeat')
    expect(parsed).toHaveProperty('timeSignatures')
    expect(parsed).toHaveProperty('tracks')
    expect(parsed).toHaveProperty('barsAndBeats')
    expect(parsed).toHaveProperty('notesMap')
  })

  test('chordTest', () => {
    const path = `${__dirname}/midi/chord-test.mid`
    const data = readFileSync(path)
    const parsed = parseMidi(data)

    expect(parsed.timings).toMatchObject({
      durationTicks: 20856,
      ticksPerBeat: 480,
    })

    expect(parsed.timeSignatures).toMatchSnapshot()

    expect(
      parsed.tracks.map(track => {
        const clone = { ...track }
        clone.id = 'removed'
        clone.notes = []
        return clone
      }),
    ).toMatchSnapshot()

    expect(
      parsed.tracks[0].notes.map(note => {
        const clone = { ...note }
        clone.id = 'removed'
        return clone
      }),
    ).toMatchSnapshot()

    expect(parsed.barsAndBeats).toMatchSnapshot()

    expect(Object.keys(parsed.notesMap).length).toBe(
      parsed.tracks[0].notes.length,
    )
  })
})
