import * as Tonal from 'tonal'
import type { Note } from './parse'
import type { DetectUnit, Song } from './song'

// Additional 7th chords
Tonal.ChordType.add(
  ['1P', '3M', '7M'],
  ['M7no5', 'maj7no5', 'ma7no5', 'Ma7no5', '^7no5'],
  'major seventh no5',
)
Tonal.ChordType.add(
  ['1P', '3m', '7m'],
  ['m7no5', 'min7no5', 'mi7no5', '-7no5'],
  'minor seventh no5',
)
Tonal.ChordType.add(
  ['1P', '3m', '7M'],
  ['mM7no5', 'mMaj7no5'],
  'minor/major seventh no5',
)

// Additional 9th chords
Tonal.ChordType.add(
  ['1P', '3m', '7m', '9M'],
  ['m9no5', 'min9no5', 'mi9no5', '-9no5'],
  'minor ninth no5',
)
Tonal.ChordType.add(
  ['1P', '3m', '9M'],
  ['madd9', 'minadd9', 'miadd9', '-add9'],
  'minor add 9',
)

// Additional 11th chords
Tonal.ChordType.add(
  ['1P', '3m', '11m'],
  ['madd11', 'minadd11', 'miadd11', '-add11'],
  'minor add 11',
)
Tonal.ChordType.add(
  ['1P', '3m', '9M', '11m'],
  ['madd9add11', 'minadd9add11', 'miadd9add11', '-add9add11'],
  'minor add 9 add 11',
)
Tonal.ChordType.add(
  ['1P', '3m', '7m', '9M', '11m'],
  ['m7add9add11', 'min7add9add11', 'mi7add9add11', '-7add9add11'],
  'minor 7 add 9 add 11',
)
Tonal.ChordType.add(
  ['1P', '3m', '5M', '9M', '11m'],
  ['madd9add11', 'minadd9add11', 'miadd9add11', '-add9add11'],
  'minor add 9 add 11',
)

// Not working...
Tonal.ChordType.add(['1P', '5P', '11A'], ['5#11'], 'fifth sharp 11')

// Additional 13th chords
Tonal.ChordType.add(
  ['1P', '3m', '5M', '7m', '9M', '11m', '13M'],
  ['m13', 'min13', 'mi13', '-13'],
  'minor 13',
)

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
  chordsInclusive: string[]
  unit: DetectUnit
  unitNumber: number
  startTicks: number
  durationTicks: number
  uniqueNotes: Set<number>
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
      chordsInclusive: Tonal.Chord.detect(
        [...cr.uniqueNotes]
          .sort()
          .map(number => Tonal.Midi.midiToNoteName(number)),
      ),
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
    chordsInclusive: [],
    unit: options.unit,
    unitNumber: 0,
    startTicks: options.startTicks,
    durationTicks: options.durationTicks,
    uniqueNotes: new Set(),
  }

  // Evalute whether every note should be part of the chord
  notes.forEach(note => addNoteToChordRange(note, chordRange))

  // Calculate time distribution
  return updateDistribution(chordRange)
}

export function addNoteToChordRange(note: Note, range: ChordRange) {
  // Ignore notes on channel 10 (percussion)
  if (note.midiChannel === 10) return

  range.notes.add(note.noteName[0])
  range.uniqueNotes.add(note.noteNumber)
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
