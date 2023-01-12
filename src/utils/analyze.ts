import type { Scale } from '@tonaljs/scale'
import type { MidiPart, Note } from './parse'

export type DetectUnit = 'bar' | 'beat'

export type Beat = {
  index: number
  startTicks: number
  notes: Note[]
}

export type NoteStats = {
  frequency: Record<string, number>
  duration: Record<string, number>
  presence?: Record<string, number>
  map: Record<string, Note>
  byBeat: Beat[]
}

export type Stats = Pick<MidiPart, 'timings' | 'timeSignatures'> & {
  notes: NoteStats
  scales: Scale[]
}

export function analyze(part: MidiPart): Stats {
  let stats: Stats = {
    timings: part.timings,
    timeSignatures: part.timeSignatures,
    notes: {
      frequency: {},
      duration: {},
      presence: {},
      map: {},
      byBeat: new Array(part.timings.totalBeats),
    },
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

  // 3-4 are done with other funciton calls
  return stats
}

// Adds this note to the current stats
function analyzeNote(note: Note, stats: Stats) {
  // Add note stats
  stats.notes.frequency = updateFrequencyStats(note, stats)
  stats.notes.duration = updateDurationStats(note, stats)
  stats.notes.map[note.uuid] = note

  const noteOnTicks = note.startTicks
  const noteOffTicks = note.startTicks + note.durationTicks
  const noteStartRange = Math.floor(noteOnTicks / stats.timings.ticksPerBeat)
  const noteEndRange = Math.floor(noteOffTicks / stats.timings.ticksPerBeat)

  // loop is limited to a note's own buckets (typically 1-2)
  for (let i = noteStartRange; i <= noteEndRange; i++) {
    const beat = stats.notes.byBeat[i] ?? {
      index: i,
      startTicks: i * stats.timings.ticksPerBeat,
      notes: [],
    }

    beat.notes.push(note)
    stats.notes.byBeat[i] = beat
  }

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

export function updatePresenceStats(
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

export function noteInBeat(note: Note, beat: number) {
  return true
}
