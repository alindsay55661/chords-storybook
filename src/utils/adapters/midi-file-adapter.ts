import { buildNote, MidiPart, Track, Note, GMPatchNames } from '../midi'
import mf from 'midi-file'

// Constants based on midi-file parsing
const TEMPO = 'setTempo'
const TIME_SIGNATURE = 'timeSignature'
const TRACK_NAME = 'trackName'
const PROGRAM_CHANGE = 'programChange'
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

  // Remaining tracks *may* contain note data - otherwise filter
  const tracks = json.tracks.reduce((result: MidiPart['tracks'], track) => {
    const processed = processTrack(track)
    if (processed.notes.length) result.push(processed)
    return result
  }, [])

  return {
    timings: {
      ...timings,
      durationTicks: Math.max(...tracks.map(track => track.durationTicks)),
      ticksPerBeat: json.header.ticksPerBeat || 960,
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

function processTrack(noteEvents: mf.MidiEvent[]): Track {
  let startTicks: number = 0
  const notesOn: NoteEvents = {}
  const notes: Note[] = []
  const track: Track = {
    notes: [],
    durationTicks: 0,
  }

  noteEvents.forEach(event => {
    // Increment startTicks for all events, even non-note events
    // startTicks is the tick location of this event relative to the part
    startTicks += event.deltaTime

    switch (event.type) {
      case TRACK_NAME:
        track.name = event.text
        break
      case PROGRAM_CHANGE:
        track.midiPatch = event.programNumber
        if (!track.name) track.name = GMPatchNames.general[track.midiPatch]
        break
      case NOTE_ON:
        notesOn[event.noteNumber] = { ...event, startTicks }
        break
      case NOTE_OFF:
        processNote(event.noteNumber, notesOn, notes, startTicks)
        break
      case END_OF_TRACK:
        // Terminate all remaining notes
        Object.keys(notesOn).forEach(number => {
          processNote(number, notesOn, notes, startTicks)
        })
        break
      default:
      // ignore
    }
  })

  return {
    ...track,
    durationTicks: startTicks,
    notes,
  }
}

function processNote(
  number: string | number,
  notesOn: NoteEvents,
  notes: Note[],
  currentStartTicks: number,
) {
  // some midi files have multiple NOTE_OFF events...
  if (!notesOn[number]) return

  const { noteNumber, startTicks } = notesOn[number]
  const note = buildNote({ noteNumber, startTicks }, currentStartTicks)
  if (note) notes.push(note)
  delete notesOn[number]

  return note
}
