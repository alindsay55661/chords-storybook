import { buildNote, MidiPart, Note } from '../midi'
import mf from 'midi-file'

// Constants based on midi-file parsing
const TEMPO = 'setTempo'
const TIME_SIGNATURE = 'timeSignature'
const NOTE_ON = 'noteOn'
const NOTE_OFF = 'noteOff'
const END_OF_TRACK = 'endOfTrack'

function midiBufferToJson(data: ArrayLike<number>) {
  return mf.parseMidi(data)
}

export function buildMidiPart(data: ArrayLike<number>): MidiPart {
  const json = midiBufferToJson(data)

  // Only process format 1 midi
  if (json.header.format !== 1) {
    throw new Error('You can currently only use midi format 1!')
  }

  // By convention the first track in format 1 is metadata only
  const firstTrack = json.tracks.shift() as mf.MidiEvent[]
  const { timings, timeSignature } = extractPartDataFromTrack(firstTrack)

  // Remaining tracks contain note data
  const tracks = json.tracks.map(track => processNoteEvents(track))

  return {
    timings: {
      ...timings,
      durationTicks: Math.max(...tracks.map(track => track.durationTicks)),
      ticksPerBeat: json.header.ticksPerBeat || 480,
    },
    timeSignature,
    tracks,
  }
}

function extractPartDataFromTrack(firstTrack: mf.MidiEvent[]) {
  const defaultPartData = {
    timings: {
      microsecondsPerBeat: 0,
    },
    timeSignature: {
      numerator: 4,
      denominator: 4,
    },
  }
  return firstTrack.reduce((result, track) => {
    switch (track.type) {
      case TEMPO:
        result.timings.microsecondsPerBeat = track.microsecondsPerBeat
        break
      case TIME_SIGNATURE:
        result.timeSignature.numerator = track.numerator
        result.timeSignature.denominator = track.denominator
        break
    }
    return result
  }, defaultPartData)
}

type NoteEvent = mf.MidiEvent & Record<string, any>
type NoteEvents = Record<string, NoteEvent>

function processNoteEvents(noteEvents: mf.MidiEvent[]) {
  let partStartTicks: number = 0
  const notesOn: NoteEvents = {}
  const notes: Note[] = []

  noteEvents.forEach(event => {
    // Increment partStartTicks for all events, even non-note events
    // partStartTicks is the tick location of this event relative to the part
    partStartTicks += event.deltaTime

    switch (event.type) {
      case NOTE_ON:
        notesOn[event.noteNumber] = { ...event, partStartTicks }
        break
      case NOTE_OFF:
        processNote(event.noteNumber, notesOn, notes, partStartTicks)
        break
      case END_OF_TRACK:
        // Terminate all remaining notes
        Object.keys(notesOn).forEach(number => {
          processNote(number, notesOn, notes, partStartTicks)
        })
        break
    }
  })

  return {
    durationTicks: partStartTicks,
    notes,
  }
}

function processNote(
  number: string | number,
  notesOn: NoteEvents,
  notes: Note[],
  currentPartStartTicks: number,
) {
  const { noteNumber, partStartTicks } = notesOn[number]
  const note = buildNote({ noteNumber, partStartTicks }, currentPartStartTicks)
  if (note) notes.push(note)
  delete notesOn[number]

  return note
}
