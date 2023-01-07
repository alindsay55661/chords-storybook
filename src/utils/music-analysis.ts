import Tonal from 'tonal'
import type { MidiPart } from './midi'

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

  console.log(buckets)

  const track = part.tracks[0]

  // Assign each note to a single chord range
  track.notes.forEach(note => {
    // Notes that start and end inside the
    const noteOffTicks = note.partStartTicks + note.durationTicks
  })
}

function getBuckets(part: MidiPart, resolution: 'bar' | 'beat') {
  const ticksPerBeat = part.timings.ticksPerBeat
  const ticksPerBar = part.timeSignature.numerator * ticksPerBeat
  const ticksPerBucket = resolution === 'beat' ? ticksPerBeat : ticksPerBar
  const partDurationTicks = part.timings.durationTicks
  const bucketCount = Math.ceil(partDurationTicks / ticksPerBucket)

  const buckets = new Array(bucketCount)
    .fill(0)
    .reduce((result, value, idx) => {
      const upperLimit = ticksPerBucket * (idx + 1) - 1
      result[upperLimit] = []
      return result
    }, {})

  return {
    ticksPerBucket,
    bucketCount,
    buckets,
  }
}
