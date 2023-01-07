import Tonal from 'tonal'
import type { MidiPart, Note } from './midi'

type DetectChordOptions = {
  resolution: 'beat' | 'bar'
}

type Chord = {
  name: string[]
}

type Units = Record<string, any>

export function detectChords(
  part: MidiPart,
  options: DetectChordOptions = {
    resolution: 'bar',
  },
) {
  // log all notes that belong to the specified resolution
  const { resolution } = options
  const buckets = getBuckets(part, resolution)

  // combine all tracks
  // optimize O(n2) ? - typical track count is low
  part.tracks.forEach(track => {
    track.notes.forEach(note => {
      addNoteToBuckets(note, buckets)
    })
  })

  // Assign each note to a single chord range
  const chords = buckets.buckets.map(bucket => Tonal.Chord.detect(bucket))
  return chords
}

function addNoteToBuckets(note: Note, buckets: Buckets) {
  const noteOnTicks = note.partStartTicks
  const noteOffTicks = note.partStartTicks + note.durationTicks
  const noteStartBucket = Math.floor(noteOnTicks / buckets.ticksPerBucket)
  const noteEndBucket = Math.floor(noteOffTicks / buckets.ticksPerBucket)

  // at least loop is limited to its own buckets (typically 1-2)
  for (let i = noteStartBucket; i <= noteEndBucket; i++) {
    buckets.buckets[i] = buckets.buckets[i] || []
    buckets.buckets[i].push(note.noteName[0])
  }

  return buckets
}

type Buckets = {
  ticksPerBucket: number
  bucketCount: number
  buckets: string[][]
}

function getBuckets(part: MidiPart, resolution: 'bar' | 'beat'): Buckets {
  const ticksPerBeat = part.timings.ticksPerBeat
  const ticksPerBar = part.timeSignature.numerator * ticksPerBeat
  const ticksPerBucket = resolution === 'beat' ? ticksPerBeat : ticksPerBar
  const partDurationTicks = part.timings.durationTicks
  const bucketCount = Math.ceil(partDurationTicks / ticksPerBucket)

  return {
    ticksPerBucket,
    bucketCount,
    buckets: [],
  }
}
