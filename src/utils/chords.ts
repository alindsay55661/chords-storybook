import * as Tonal from 'tonal'
import type { Note } from './parse'
import type { DetectUnit, Song } from './analyze'

export type DetectChordOptions = {
  unit?: DetectUnit
  excludeThreshold?: number
}

export type DetectedChords = Array<
  ChordRange & {
    chords: string[]
  }
>

export type ChordRange = {
  notes: Set<string>
  distribution: {
    ticks: Record<string, number>
    time?: Record<string, number>
  }
  chords: string[]
  unit: DetectUnit
  unitNumber: number
  startTicks: number
  durationTicks: number
  uniqueNotes: Note[]
}

export function detectChords(
  song: Song,
  opts?: DetectChordOptions,
): DetectedChords {
  const options = {
    unit: 'bar',
    excludeThreshold: 0.1,
    ...opts,
  } satisfies DetectChordOptions
  const chordRanges: ChordRange[] = []
  const { unit } = options

  if (unit === 'bar') {
    song.notes.byBar.forEach(bar => {
      chordRanges.push(
        makeChordRange(bar.notes, {
          unit,
          startTicks: bar.startTicks,
          durationTicks: bar.durationTicks,
        }),
      )
    })
  } else if (unit === 'beat') {
    song.notes.byBar.forEach(bar => {
      bar.beats.forEach(beat => {
        chordRanges.push(
          makeChordRange(beat.notes, {
            unit,
            startTicks: beat.startTicks,
            durationTicks: beat.durationTicks,
          }),
        )
      })
    })
  }

  const chords = chordsFromRanges(chordRanges, options.excludeThreshold)

  return chords
}

export function chordsFromRanges(
  chordRanges: ChordRange[],
  lengthThreshold: number,
): ChordRange[] {
  const chords = chordRanges.map(cr => {
    // apply specialized filtering
    const percentages = notePercentagesInChordRange(cr)

    // Remove notes that are "threshold" or less of the chord range
    // Optimize
    let newNotes: string[] = []
    Object.keys(percentages).forEach(note => {
      if (percentages[note] > lengthThreshold) newNotes.push(note)
    })

    cr.distribution.time = percentages

    return {
      ...cr,
      chordNotes: new Set(newNotes),
      chords: Tonal.Chord.detect([...newNotes]),
    }
  })

  return chords
}

export function makeChordRange(
  notes: Note[],
  options: { unit: DetectUnit; startTicks: number; durationTicks: number },
): ChordRange {
  const chordRange: ChordRange = {
    notes: new Set(),
    distribution: {
      ticks: {},
    },
    chords: [],
    unit: options.unit,
    unitNumber: 0,
    startTicks: options.startTicks,
    durationTicks: options.durationTicks,
    uniqueNotes: [],
  }

  // Evalute whether every note should be part of the chord
  notes.forEach(note => addNoteToChordRange(note, chordRange))

  return chordRange
}

export function addNoteToChordRange(note: Note, range: ChordRange) {
  // Ignore notes on channel 10 (percussion)
  if (note.midiChannel === 10) return

  range.notes.add(note.noteName[0])
  range.uniqueNotes.push(note)
  // Note distribution allows for advanced chord recognition
  updateDistribution(range, note)
}

export function notePercentagesInChordRange(chordRange: ChordRange) {
  const { ticks } = chordRange.distribution
  const percentages: ChordRange['distribution']['time'] = {}

  Object.keys(ticks).forEach(noteName => {
    const time = ticks[noteName] / chordRange.durationTicks
    percentages[noteName] = time
  })

  return percentages
}

// distribution is an attempt to measure note strength
// we will track the time the note is played, including doubling
// distribution can be useful to exclude some notes from chord recognition
export function updateDistribution(
  chordRange: ChordRange,
  note: Note | undefined = undefined,
) {
  const { ticks } = chordRange.distribution

  // If note is omitted, calculate percentages
  if (!note) {
    Object.keys(ticks).forEach(noteName => {
      const time = ticks[noteName] / chordRange.durationTicks
      chordRange.distribution.time = chordRange.distribution.time ?? {}
      chordRange.distribution.time[noteName] = time
    })
    return chordRange
  }

  const noteName = note.noteName[0]
  const noteOffTicks = note.startTicks + note.durationTicks
  const chordRangeOffTicks = chordRange.startTicks + chordRange.durationTicks
  const startTicks =
    note.startTicks < chordRange.startTicks
      ? chordRange.startTicks
      : note.startTicks
  const endTicks =
    noteOffTicks > chordRangeOffTicks ? chordRangeOffTicks : noteOffTicks

  // Can occur if this funciton is called directly with bad data
  if (startTicks >= endTicks) return chordRange
  if (endTicks <= startTicks) return chordRange

  if (!ticks[noteName]) {
    ticks[noteName] = endTicks - startTicks
  } else {
    ticks[noteName] = ticks[noteName] + endTicks - startTicks
  }

  return chordRange
}
