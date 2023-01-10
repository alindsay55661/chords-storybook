import Tonal from 'tonal'
import type { MidiPart, Note } from './midi'

type DetectUnit = 'bar' | 'beat'

type DetectChordOptions = {
  unit?: DetectUnit
  lengthThreshold?: number
}

type DetectedChords = Array<
  ChordRange & {
    chords: string[]
  }
>

type AnalyzeOptions = {
  unit?: DetectUnit
  noteLengthThreshold?: number
  noteOccuranceThreshold?: number
  noteFrequencyWeight?: number
  noteDurationWeight?: number
}

type NoteStats = {
  frequency: Record<string, number>
  duration: Record<string, number>
  presence?: Record<string, number>
}

type Stats = {
  chords: ChordRangeData
  notes: NoteStats
}

export function analyze(
  part: MidiPart,
  {
    unit = 'bar',
    noteLengthThreshold = 0.1,
    noteOccuranceThreshold = 0.1,
  }: AnalyzeOptions,
) {
  const chordRangeData = initChordRangeData(part, unit)
  let stats: Stats = {
    chords: chordRangeData,
    notes: { frequency: {}, duration: {}, presence: {} },
  }

  part.tracks.forEach(track => {
    track.notes.forEach(note => {
      stats = analyzeNote(note, stats)
    })
  })

  stats.notes.presence = updatePresenceStats(stats)

  return stats
}

function analyzeScale(stats: Stats): Stats {
  return stats
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

// Adds this note to the current stats
function analyzeNote(note: Note, stats: Stats) {
  const name = note.noteName[0]
  // Add note stats
  stats.notes.frequency = updateFrequencyStats(note, stats)
  stats.notes.duration = updateDurationStats(note, stats)

  // Add chord stats
  stats.chords = addNoteToChordRange(note, stats.chords)

  return stats
}

function updateFrequencyStats(note: Note, stats: Stats) {
  const name = note.noteName[0]
  const frequency = stats.notes.frequency ?? {}
  frequency[name] = frequency[name] ?? 0
  frequency[name] = frequency[name] + 1
  return frequency
}

function updateDurationStats(note: Note, stats: Stats) {
  const name = note.noteName[0]
  const duration = stats.notes.duration ?? {}
  duration[name] = duration[name] ?? 0
  duration[name] = duration[name] + note.durationTicks
  return duration
}

function updatePresenceStats(
  stats: Stats,
  noteDurationWeight: number = 1,
  noteFrequencyWeight: number = 0.3,
) {
  const presence = stats.notes.presence ?? {}
  const duration = normalizeToOne(stats.notes.duration)
  const frequency = normalizeToOne(stats.notes.frequency)

  Object.keys(frequency).forEach(name => {
    presence[name] =
      duration[name] * noteDurationWeight +
      frequency[name] * noteFrequencyWeight
  })

  return normalizeToOne(presence)
}

function normalizeToOne(noteMap: Record<string, number>) {
  const values = Object.values(noteMap)
  const min = 0 //Math.min(...values)
  const max = Math.max(...values)
  const factor = 1 / (max - min)

  return Object.entries(noteMap).reduce((result: any, tuple) => {
    result[tuple[0]] = (tuple[1] - min) * factor
    return result
  }, {})
}

function addNoteToChordRange(note: Note, data: ChordRangeData) {
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
}

type ChordRangeData = {
  ticksPerChordRange: number
  chordRangeCount: number
  unit: DetectUnit
  chordRanges: ChordRange[]
}

function initChordRangeData(part: MidiPart, unit: DetectUnit): ChordRangeData {
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
