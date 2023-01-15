import {
  buildNote,
  makeBarsAndBeats,
  MidiPart,
  TimeSignature,
  Track,
  Note,
  GMPatchNames,
} from '../parse'
import { v4 as uuid } from 'uuid'
import mf from 'midi-file'

// Constants based on midi-file parsing
const TEMPO = 'setTempo'
const TIME_SIGNATURE = 'timeSignature'
const TRACK_NAME = 'trackName'
const PROGRAM_CHANGE = 'programChange'
const NOTE_ON = 'noteOn'
const NOTE_OFF = 'noteOff'
const END_OF_TRACK = 'endOfTrack'

export function midiBufferToJson(data: ArrayLike<number>) {
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
  const notesMap = {}
  const tracks = json.tracks.reduce((result: MidiPart['tracks'], track) => {
    const processed = processTrack(track, notesMap)
    if (processed.notes.length) result.push(processed)
    return result
  }, [])

  const ticksPerBeat = json.header.ticksPerBeat || 960
  const durationTicks = Math.max(...tracks.map(track => track.durationTicks))
  const { timings, timeSignatures } = extractPartDataFromTrack(
    firstTrack,
    ticksPerBeat,
    durationTicks,
  )

  return {
    timings: {
      ...timings,
      durationTicks,
      ticksPerBeat,
    },
    timeSignatures,
    tracks,
    barsAndBeats: makeBarsAndBeats(timeSignatures, ticksPerBeat),
    notesMap,
  }
}

function extractPartDataFromTrack(
  firstTrack: mf.MidiEvent[],
  ticksPerBeat: number,
  durationTicks: number,
) {
  let currentTicks: number = 0
  const defaultPartData: any = {
    timings: {
      microsecondsPerBeat: 0,
    },
    timeSignatures: [],
  }

  const data = firstTrack.reduce((result, event) => {
    // Increment startTicks for all events (deltaTime is relative)
    currentTicks += event.deltaTime

    switch (event.type) {
      case TEMPO:
        result.timings.microsecondsPerBeat = event.microsecondsPerBeat
        break
      case TIME_SIGNATURE:
        const beatTicksMultiplier = 4 / event.denominator
        const signature: TimeSignature = {
          startTicks: currentTicks,
          startBeat: 0,
          beatsInSignature: 0,
          numerator: event.numerator,
          denominator: event.denominator,
          beatTicksMultiplier,
        }
        result.timeSignatures.push(signature)
        break
    }
    return result
  }, defaultPartData)

  // Update timeSignature data
  let startBeat = 0
  data.timeSignatures = data.timeSignatures.map(
    (ts: TimeSignature, idx: number) => {
      const nextSignature = data.timeSignatures[idx + 1]
      let startTicks = nextSignature ? nextSignature.startTicks : durationTicks

      const beatsInSignature = Math.ceil(
        (startTicks - ts.startTicks) / (ticksPerBeat * ts.beatTicksMultiplier),
      )

      const updated = { ...ts, startBeat, beatsInSignature }

      // Increment
      startBeat = startBeat + beatsInSignature

      return updated
    },
  )

  return data
}

type NoteEvent = mf.MidiEvent & Record<string, any>
type NoteEvents = Record<string, NoteEvent>

function processTrack(
  noteEvents: mf.MidiEvent[],
  notesMap: Record<string, Note>,
): Track {
  let currentTicks: number = 0
  const notesOn: NoteEvents = {}
  const notes: Note[] = []
  const lowHigh: Partial<{
    lowestNote: number | undefined
    highestNote: number | undefined
  }> = {}
  const track: Track = {
    id: uuid(),
    notes: [],
    durationTicks: 0,
  }

  noteEvents.forEach(event => {
    // Increment startTicks for all events, even non-note events
    // startTicks is the tick location of this event relative to the part
    currentTicks += event.deltaTime

    switch (event.type) {
      case TRACK_NAME:
        track.name = event.text
        break
      case PROGRAM_CHANGE:
        track.midiPatch = event.programNumber
        if (!track.name) track.name = GMPatchNames.general[track.midiPatch]
        break
      case NOTE_ON:
        notesOn[event.noteNumber] = { ...event, startTicks: currentTicks }

        lowHigh.lowestNote = lowHigh.lowestNote ?? event.noteNumber
        if (lowHigh.lowestNote > event.noteNumber)
          lowHigh.lowestNote = event.noteNumber

        lowHigh.highestNote = lowHigh.highestNote ?? event.noteNumber
        if (lowHigh.highestNote < event.noteNumber)
          lowHigh.highestNote = event.noteNumber
        break
      case NOTE_OFF:
        processNote(event.noteNumber, notesOn, notes, currentTicks, notesMap)
        break
      case END_OF_TRACK:
        // Terminate all remaining notes
        Object.keys(notesOn).forEach(number => {
          processNote(number, notesOn, notes, currentTicks, notesMap)
        })
        break
      default:
      // ignore
    }
  })

  return {
    ...track,
    ...lowHigh,
    durationTicks: currentTicks,
    notes,
  }
}

function processNote(
  number: string | number,
  notesOn: NoteEvents,
  notes: Note[],
  currentTicks: number,
  notesMap: Record<string, Note>,
) {
  // some midi files have multiple NOTE_OFF events...
  if (!notesOn[number]) return

  const { noteNumber, startTicks } = notesOn[number]
  const durationTicks = currentTicks - startTicks
  const note = buildNote({ noteNumber, startTicks, durationTicks })
  if (note) {
    notes.push(note)
    notesMap[note.id] = note
  }
  delete notesOn[number]

  return note
}
