import Tonal from 'tonal'
import type { MidiPart, Note } from './midi'

type DetectUnit = 'bar' | 'beat'

type DetectChordOptions = {
  unit: DetectUnit
}

export function detectChords(
  part: MidiPart,
  options: DetectChordOptions = {
    unit: 'bar',
  },
) {
  // log all notes that belong to the specified unit of measurement
  const { unit } = options
  let bucketData = getBucketData(part, unit)

  // chord recognition should happen across all tracks (i.e. is time-based)
  // optimize O(n^2) ? - typical track count is low, however
  part.tracks.forEach(track => {
    track.notes.forEach(note => {
      bucketData = addNoteToBuckets(note, bucketData)
    })
  })

  // Assign each note to a single chord range
  const chords = bucketData.buckets.map(bucket => {
    return {
      ...bucket,
      chords: Tonal.Chord.detect([...bucket.notes]),
    }
  })
  return chords
}

function addNoteToBuckets(note: Note, bucketData: BucketData) {
  const noteOnTicks = note.startTicks
  const noteOffTicks = note.startTicks + note.durationTicks
  const noteStartBucket = Math.floor(noteOnTicks / bucketData.ticksPerBucket)
  const noteEndBucket = Math.floor(noteOffTicks / bucketData.ticksPerBucket)
  const newBucket: Bucket = {
    notes: new Set(),
    distribution: {
      ticks: {},
    },
    chords: [],
    unit: bucketData.unit,
    unitNumber: 0,
    startTicks: 0,
    durationTicks: bucketData.ticksPerBucket,
  }

  // loop is limited to a note's own buckets (typically 1-2)
  for (let i = noteStartBucket; i <= noteEndBucket; i++) {
    let bucket: Bucket = bucketData.buckets[i] || {
      ...newBucket,
      unitNumber: i,
      startTicks: i * bucketData.ticksPerBucket,
    }
    // Set vs Array prevents duplicates
    bucket.notes.add(note.noteName[0])
    // Note distribution allows for advanced chord recognition
    bucket = updateDistribution(bucket, note)
    bucketData.buckets[i] = bucket
  }

  return bucketData
}

// distribution is an attempt to measure note strength
// we will track the time the note is played, including doubling
// distribution can be useful to exclude some notes from chord recognition
export function updateDistribution(
  bucket: Bucket,
  note: Note | undefined = undefined,
) {
  const { ticks } = bucket.distribution

  // If note is omitted, calculate percentages
  if (!note) {
    Object.keys(ticks).forEach(noteName => {
      // Divide the note ticks by the bucket length
      const time = ticks[noteName] / bucket.durationTicks

      bucket.distribution.time = bucket.distribution.time ?? {}
      bucket.distribution.time[noteName] = time
    })
    return bucket
  }

  const noteName = note.noteName[0]
  const noteOffTicks = note.startTicks + note.durationTicks
  const bucketOffTicks = bucket.startTicks + bucket.durationTicks
  const startTicks =
    note.startTicks < bucket.startTicks ? bucket.startTicks : note.startTicks
  const endTicks = noteOffTicks > bucketOffTicks ? bucketOffTicks : noteOffTicks

  // Only occurs if this funciton is called directly
  if (startTicks >= endTicks) return bucket
  if (endTicks <= startTicks) return bucket

  if (!ticks[noteName]) {
    ticks[noteName] = endTicks - startTicks
  } else {
    ticks[noteName] = ticks[noteName] + endTicks - startTicks
  }

  return bucket
}

export type Bucket = {
  notes: Set<string>
  distribution: {
    ticks: Record<string, number>
    time?: Record<string, number>
    pitch?: Record<string, number>
  }
  chords: string[]
  unit: DetectUnit
  unitNumber: number
  startTicks: number
  durationTicks: number
}

type BucketData = {
  ticksPerBucket: number
  bucketCount: number
  unit: DetectUnit
  buckets: Bucket[]
}

function getBucketData(part: MidiPart, unit: DetectUnit): BucketData {
  const ticksPerBeat = part.timings.ticksPerBeat
  const ticksPerBar = part.timeSignature.numerator * ticksPerBeat
  const ticksPerBucket = unit === 'beat' ? ticksPerBeat : ticksPerBar
  const durationTicks = part.timings.durationTicks
  const bucketCount = Math.ceil(durationTicks / ticksPerBucket)

  return {
    ticksPerBucket,
    bucketCount,
    unit,
    buckets: [],
  }
}
