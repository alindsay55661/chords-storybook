import {
  buildNote,
  MidiPart,
  TimeSignature,
  Track,
  Note,
  GMPatchNames,
} from '../parse'
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
  const tracks = json.tracks.reduce((result: MidiPart['tracks'], track) => {
    const processed = processTrack(track)
    if (processed.notes.length) result.push(processed)
    return result
  }, [])

  const ticksPerBeat = json.header.ticksPerBeat || 960
  const durationTicks = Math.max(...tracks.map(track => track.durationTicks))
  const totalBeats = Math.ceil(durationTicks / ticksPerBeat)
  const { timings, timeSignatures } = extractPartDataFromTrack(
    firstTrack,
    ticksPerBeat,
    totalBeats,
  )

  return {
    timings: {
      ...timings,
      durationTicks,
      ticksPerBeat,
      totalBeats,
    },
    timeSignatures,
    tracks,
  }
}

function extractPartDataFromTrack(
  firstTrack: mf.MidiEvent[],
  ticksPerBeat: number,
  totalBeats: number,
) {
  let startTicks: number = 0
  const defaultPartData: any = {
    timings: {
      microsecondsPerBeat: 0,
    },
    timeSignatures: [],
  }

  const data = firstTrack.reduce((result, event) => {
    // Increment startTicks for all events (deltaTime is relative)
    startTicks += event.deltaTime

    switch (event.type) {
      case TEMPO:
        result.timings.microsecondsPerBeat = event.microsecondsPerBeat
        break
      case TIME_SIGNATURE:
        const signature: TimeSignature = {
          startTicks,
          startBeat: Math.floor(startTicks / ticksPerBeat),
          beatsInSignature: 0,
          numerator: event.numerator,
          denominator: event.denominator,
        }
        result.timeSignatures.push(signature)
        break
    }
    return result
  }, defaultPartData)

  // Update timeSignature data
  data.timeSignatures = data.timeSignatures.map(
    (ts: TimeSignature, idx: number) => {
      const beatsInSignature = data.timeSignatures[idx + 1]
        ? data.timeSignatures[idx + 1].startBeat - ts.startBeat
        : totalBeats - ts.startBeat
      return { ...ts, beatsInSignature }
    },
  )

  return data
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
