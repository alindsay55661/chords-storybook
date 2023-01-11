import Tonal from 'tonal'
import type { MidiPart, Note } from './midi'
import type { DetectUnit } from './music-analysis'

export type DetectChordOptions = {
  unit?: DetectUnit
  lengthThreshold?: number
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
  uniqueNotes: string[]
}

export type ChordRangeData = {
  ticksPerChordRange: number
  chordRangeCount: number
  unit: DetectUnit
  chordRanges: ChordRange[]
}

export function detectChords(
  part: MidiPart,
  { unit = 'bar', lengthThreshold = 0.1 }: DetectChordOptions,
): DetectedChords {
  const chordRangeData = chordRangeDataFromPart(part, unit)
  const chords = chordRangeData.chordRanges.map(cr => {
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

export function chordRangeDataFromPart(
  part: MidiPart,
  unit: DetectUnit,
): ChordRangeData {
  // log all notes that belong to the specified unit of measurement
  let chordRangeData = initChordRangeData(part, unit)

  // chord recognition should happen across all tracks (i.e. is time-based)
  // optimize O(n^2) ? - typical track count is low, however
  part.tracks.forEach(track => {
    track.notes.forEach(note => {
      chordRangeData = addNoteToChordRange(note, chordRangeData)
    })
  })

  return chordRangeData
}

export function initChordRangeData(
  part: MidiPart,
  unit: DetectUnit,
): ChordRangeData {
  const ticksPerBeat = part.timings.ticksPerBeat
  const ticksPerBar = part.timeSignature.numerator * ticksPerBeat
  const ticksPerChordRange = unit === 'beat' ? ticksPerBeat : ticksPerBar
  const durationTicks = part.timings.durationTicks
  const chordRangeCount = Math.ceil(durationTicks / ticksPerChordRange)

  return {
    ticksPerChordRange,
    chordRangeCount,
    unit,
    chordRanges: [],
  }
}

export function addNoteToChordRange(note: Note, data: ChordRangeData) {
  const noteOnTicks = note.startTicks
  const noteOffTicks = note.startTicks + note.durationTicks
  const noteStartRange = Math.floor(noteOnTicks / data.ticksPerChordRange)
  const noteEndRange = Math.floor(noteOffTicks / data.ticksPerChordRange)
  const newChordRange: ChordRange = {
    notes: new Set(),
    distribution: {
      ticks: {},
    },
    chords: [],
    unit: data.unit,
    unitNumber: 0,
    startTicks: 0,
    durationTicks: data.ticksPerChordRange,
    uniqueNotes: [],
  }

  // loop is limited to a note's own buckets (typically 1-2)
  for (let i = noteStartRange; i <= noteEndRange; i++) {
    let cr: ChordRange = data.chordRanges[i] || {
      ...newChordRange,
      unitNumber: i,
      startTicks: i * data.ticksPerChordRange,
    }
    // Set vs Array prevents duplicates
    cr.notes.add(note.noteName[0])
    cr.uniqueNotes.push(note.uuid)
    // Note distribution allows for advanced chord recognition
    cr = updateDistribution(cr, note)
    data.chordRanges[i] = cr
  }

  return data
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
