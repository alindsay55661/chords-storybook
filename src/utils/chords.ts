import Tonal from 'tonal'
import type { MidiPart, Beat, Note, TimeSignature } from './parse'
import type { DetectUnit, Stats } from './analyze'

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
  uniqueNotes: Note[]
}

export type ChordRangeData = {
  ticksPerBeat: number
  timeSignatures: TimeSignature[]
  chordRangeCount: number
  unit: DetectUnit
  chordRanges: ChordRange[]
}

export function detectChords(
  stats: Stats,
  opts?: DetectChordOptions,
): DetectedChords {
  const options = {
    unit: 'bar',
    lengthThreshold: 0.1,
    ...opts,
  } satisfies DetectChordOptions
  const chordRangeData = initChordRangeData(stats, options.unit)

  if (options.unit === 'bar') {
    makeBarRanges(chordRangeData, stats.notes.byBeat)
  } else if (options.unit === 'beat') {
    stats.notes.byBeat.forEach(beat => {
      if (beat) {
        chordRangeData.chordRanges.push(
          createChordRange(beat.notes, {
            unit: 'beat',
            startTicks: beat.startTicks,
            durationTicks: stats.timings.ticksPerBeat,
          }),
        )
      }
    })
  }

  console.log(`totalBeats: ${stats.timings.totalBeats} (from stats)`)

  const chords = chordsFromRanges(
    chordRangeData.chordRanges,
    options.lengthThreshold,
  )

  return chords
}

function makeBarRanges(chordRangeData: ChordRangeData, notesByBeat: Beat[]) {
  let totalBeatsProcessed = 0
  // Detect from chordRanges in each timeSignature
  chordRangeData.timeSignatures.forEach((ts, idx) => {
    // const barCount = ts.beatsInSignature / ts.numerator
    let signatureBeatsProcessed = 0
    let beatsInCurrentBatch = 0
    let notes: Note[] = []
    const { ticksPerBeat } = chordRangeData
    const durationTicks = ticksPerBeat * ts.numerator
    const startTicks = totalBeatsProcessed * ticksPerBeat

    while (signatureBeatsProcessed <= ts.beatsInSignature) {
      const notesFound = notesByBeat[totalBeatsProcessed]

      // update counters
      signatureBeatsProcessed++
      totalBeatsProcessed++
      beatsInCurrentBatch++

      if (notesFound) {
        notes = [...notes, ...notesFound.notes]
      }

      // Create chordRange!
      if (beatsInCurrentBatch === ts.numerator) {
        chordRangeData.chordRanges.push(
          createChordRange(notes, { unit: 'bar', startTicks, durationTicks }),
        )

        // Reset aggregators
        beatsInCurrentBatch = 0
        notes = []
      }
    }

    // Create range for last bar if needed
    if (notes.length && idx === chordRangeData.timeSignatures.length - 1) {
      chordRangeData.chordRanges.push(
        createChordRange(notes, { unit: 'bar', startTicks, durationTicks }),
      )
    }

    console.log(
      `totalBeats: ${notesByBeat.length}, processed: ${totalBeatsProcessed}`,
    )
  })
}

function chordsFromRanges(
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

export function initChordRangeData(
  stats: Stats,
  unit: DetectUnit,
): ChordRangeData {
  const ticksPerBeat = stats.timings.ticksPerBeat
  const timeSignatures = stats.timeSignatures
  let chordRangeCount = 0

  if (unit === 'beat') {
    chordRangeCount = stats.timings.totalBeats
  } else if (unit === 'bar') {
    // Loop through each time signature to get the right # of measures
    timeSignatures.forEach(ts => {
      // ceil required in case last bar of song is missing beats
      chordRangeCount += Math.ceil(ts.beatsInSignature / ts.numerator)
    })
  }

  return {
    ticksPerBeat,
    timeSignatures,
    chordRangeCount,
    unit,
    chordRanges: [],
  }
}

export function createChordRange(
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
  const noteOnTicks = note.startTicks
  const noteOffTicks = note.startTicks + note.durationTicks
  const noteStartRange = Math.floor(noteOnTicks / range.durationTicks)
  const noteEndRange = Math.floor(noteOffTicks / range.durationTicks)

  range.notes.add(note.noteName[0])
  range.uniqueNotes.push(note)
  // Note distribution allows for advanced chord recognition
  range = updateDistribution(range, note)
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
