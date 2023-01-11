import Tonal from 'tonal'
import type { Scale } from '@tonaljs/scale'
import type { MidiPart, Note } from './midi'
import {
  ChordRangeData,
  initChordRangeData,
  addNoteToChordRange,
} from './chords'

export type DetectUnit = 'bar' | 'beat'

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
  scales: Scale[]
}

export function analyze(
  part: MidiPart,
  {
    unit = 'bar',
    noteLengthThreshold = 0.1,
    noteOccuranceThreshold = 0.1,
  }: AnalyzeOptions,
): Stats {
  const chordRangeData = initChordRangeData(part, unit)
  let stats: Stats = {
    chords: chordRangeData,
    notes: { frequency: {}, duration: {}, presence: {} },
    scales: [],
  }

  // Execution order matters
  // 1 - every note must be analyzed before scale or chord detection can occur
  // 2 - note "presence" improve scale recognition and should be done first
  // 3 - scale recognition helps with proper chord spelling
  // 4 - chord recognition is the last thing to take place

  // 1 - Note analysis
  part.tracks.forEach(track => {
    track.notes.forEach(note => {
      stats = analyzeNote(note, stats)
    })
  })

  // 2 - Note "presence" calculation
  stats.notes.presence = updatePresenceStats(stats) as Record<string, number>

  // 3 - Scale recognition
  stats.scales = analyzeScale(stats.notes.presence)

  // 4 - Recognize chords
  // TODO

  return stats
}

export function analyzeScale(presence: Record<string, number>) {
  // order by prominence
  const notes = Object.entries(presence)
    .map(entry => {
      return { name: entry[0], presence: entry[1] }
    })
    .sort((a, b) => {
      if (a.presence > b.presence) return -1
      if (a.presence < b.presence) return 1
      return 0
    })

  const scaleNotes = Tonal.Scale.scaleNotes(notes.map(note => note.name))

  // Get distance from C
  const interval = Tonal.Interval.distance(scaleNotes[0], 'C')
  const transposed = scaleNotes.map(Tonal.Note.transposeBy(interval))
  const pcset = Tonal.Pcset.get(transposed)

  // Filter scales that include these intervals
  const scales = Tonal.ScaleType.all().filter(scale => {
    let intervalsFound = 0
    pcset.intervals.forEach(interval => {
      if (scale.intervals.includes(interval)) intervalsFound++
    })

    if (intervalsFound === pcset.intervals.length) return true
  })

  const keyScales = scales.map(scale => {
    return Tonal.Scale.get(`${scaleNotes[0]} ${scale.name}`)
  })

  return keyScales
}

// Adds this note to the current stats
function analyzeNote(note: Note, stats: Stats) {
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
