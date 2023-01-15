import type { Scale } from '@tonaljs/scale'
import type { MidiPart, Bar, Track, Note } from './parse'

export type DetectUnit = 'bar' | 'beat'

export type NoteStats = {
  frequency: Record<string, number>
  duration: Record<string, number>
  presence?: Record<string, number>
  map: Record<string, Note>
  byBar: Bar[]
}

export type Stats = Pick<MidiPart, 'timings' | 'timeSignatures'> & {
  notes: NoteStats
  scales: Scale[]
  tracks: Track[]
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
      byBar: [],
    },
    scales: [],
    tracks: [],
  }

  // Execution order matters
  // 1 - every note must be analyzed before scale or chord detection can occur
  // 2 - note "presence" improve scale recognition and should be done first
  // 3 - scale recognition helps with proper chord spelling
  // 4 - chord recognition is the last thing to take place

  // 1 - Note analysis (Hydrate barsAndBeats)
  const notes = Object.values(part.notesMap)
  function isNoteInRange(note: Note, startTicks: number, endTicks: number) {
    const noteEndTicks = note.startTicks + note.durationTicks

    // Note starts and ends in the range (CONTAINED - most common)
    if (note.startTicks >= startTicks && note.startTicks <= endTicks) {
      return true
    }

    // Note starts in the range and ends after the range (HEAD)
    if (note.startTicks >= startTicks && noteEndTicks > endTicks) {
      return true
    }

    // Note starts before the range and ends in the range (TAIL)
    if (note.startTicks < startTicks && noteEndTicks <= endTicks) {
      return true
    }

    // Note starts before the range and ends after range (THROUGH)
    if (note.startTicks < startTicks && noteEndTicks > endTicks) {
      return true
    }
  }

  part.barsAndBeats.forEach(bar => {
    // Find notes in this bar
    const barEndTicks = bar.startTicks + bar.durationTicks
    const notesInBar = notes.filter(note => {
      if (isNoteInRange(note, bar.startTicks, barEndTicks)) return note
    })
    bar.notes = notesInBar

    // Find notes in this bar's beats
    bar.beats.forEach(beat => {
      const beatEndTicks = beat.startTicks + beat.durationTicks
      const notesInBeat = notesInBar.filter(note => {
        if (isNoteInRange(note, beat.startTicks, beatEndTicks)) return note
      })
      beat.notes = notesInBeat
    })
  })

  stats.notes.byBar = part.barsAndBeats
  stats.tracks = part.tracks
  // stats.notes.frequency = updateFrequencyStats(note, stats)
  // stats.notes.duration = updateDurationStats(note, stats)

  // 2 - Note "presence" calculation
  stats.notes.presence = updatePresenceStats(stats) as Record<string, number>

  // 3-4 are done with other funciton calls
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
