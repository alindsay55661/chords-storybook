import Tonal from 'tonal'
import { buildMidiPart } from './adapters/midi-file-adapter'

export type MidiPart = {
  timings: Timings
  timeSignature: TimeSignature
  tracks: Track[]
}

export type Timings = {
  durationTicks: number
  ticksPerBeat: number
  microsecondsPerBeat: number
}

export type TimeSignature = {
  numerator: number
  denominator: number
}

export type Track = {
  notes: Note[]
  durationTicks: number
  name?: string
}

export type Note = {
  partStartTicks: number
  durationTicks: number
  noteNumber: number
  noteName: string[]
}

export function parseMidi(data: ArrayLike<number>): MidiPart {
  return buildMidiPart(data)
}

export function buildNote(
  note: Pick<Note, 'partStartTicks' | 'noteNumber'>,
  partStartTicks: number,
): Note | false {
  const durationTicks = partStartTicks - note.partStartTicks

  // Ignore notes with no duration (this happens with some midi programs)
  if (!durationTicks) return false

  return {
    partStartTicks,
    durationTicks,
    noteNumber: note.noteNumber,
    noteName: [
      Tonal.Midi.midiToNoteName(note.noteNumber),
      Tonal.Midi.midiToNoteName(note.noteNumber, { sharps: true }),
    ],
  }
}
