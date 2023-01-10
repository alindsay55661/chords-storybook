import Tonal from 'tonal'
import { v4 as uuid } from 'uuid'
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
  midiPatch?: number
}

export type Note = {
  uuid: string
  startTicks: number
  durationTicks: number
  noteNumber: number
  noteNameWithOctave: string[]
  noteName: string[]
}

export function parseMidi(data: ArrayLike<number>): MidiPart {
  return buildMidiPart(data)
}

export function buildNote(
  note: Pick<Note, 'startTicks' | 'noteNumber'>,
  partStartTicks: number,
): Note | false {
  const durationTicks = partStartTicks - note.startTicks

  // Ignore notes with no duration (this happens with some midi programs)
  if (!durationTicks) return false

  return {
    uuid: uuid(),
    startTicks: partStartTicks,
    durationTicks,
    noteNumber: note.noteNumber,
    noteNameWithOctave: [
      Tonal.Midi.midiToNoteName(note.noteNumber),
      Tonal.Midi.midiToNoteName(note.noteNumber, { sharps: true }),
    ],
    noteName: [
      Tonal.Midi.midiToNoteName(note.noteNumber, { pitchClass: true }),
      Tonal.Midi.midiToNoteName(note.noteNumber, {
        pitchClass: true,
        sharps: true,
      }),
    ],
  }
}
type GMPatchNames = {
  general: Record<number, string>
  percussion: Record<number, string>
}

export const GMPatchNames: GMPatchNames = {
  general: {
    0: 'Acoustic Grand',
    1: 'Bright Acoustic',
    2: 'Electric Grand',
    3: 'Honky-Tonk',
    4: 'Electric Piano 1',
    5: 'Electric Piano 2',
    6: 'Harpsichord',
    7: 'Clav',
    8: 'Celesta',
    9: 'Glockenspiel',
    10: 'Music Box',
    11: 'Vibraphone',
    12: 'Marimba',
    13: 'Xylophone',
    14: 'Tubular Bells',
    15: 'Dulcimer',
    16: 'Drawbar Organ',
    17: 'Percussive Organ',
    18: 'Rock Organ',
    19: 'Church Organ',
    20: 'Reed Organ',
    21: 'Accordion',
    22: 'Harmonica',
    23: 'Tango Accordion',
    24: 'Acoustic Guitar(nylon)',
    25: 'Acoustic Guitar(steel)',
    26: 'Electric Guitar(jazz)',
    27: 'Electric Guitar(clean)',
    28: 'Electric Guitar(muted)',
    29: 'Overdriven Guitar',
    30: 'Distortion Guitar',
    31: 'Guitar Harmonics',
    32: 'Acoustic Bass',
    33: 'Electric Bass(finger)',
    34: 'Electric Bass(pick)',
    35: 'Fretless Bass',
    36: 'Slap Bass 1',
    37: 'Slap Bass 2',
    38: 'Synth Bass 1',
    39: 'Synth Bass 2',
    40: 'Violin',
    41: 'Viola',
    42: 'Cello',
    43: 'Contrabass',
    44: 'Tremolo Strings',
    45: 'Pizzicato Strings',
    46: 'Orchestral Harp',
    47: 'Timpani',
    48: 'String Ensemble 1',
    49: 'String Ensemble 2',
    50: 'SynthStrings 1',
    51: 'SynthStrings 2',
    52: 'Choir Aahs',
    53: 'Voice Oohs',
    54: 'Synth Voice',
    55: 'Orchestra Hit',
    56: 'Trumpet',
    57: 'Trombone',
    58: 'Tuba',
    59: 'Muted Trumpet',
    60: 'French Horn',
    61: 'Brass Section',
    62: 'SynthBrass 1',
    63: 'SynthBrass 2',
    64: 'Soprano Sax',
    65: 'Alto Sax',
    66: 'Tenor Sax',
    67: 'Baritone Sax',
    68: 'Oboe',
    69: 'English Horn',
    70: 'Bassoon',
    71: 'Clarinet',
    72: 'Piccolo',
    73: 'Flute',
    74: 'Recorder',
    75: 'Pan Flute',
    76: 'Blown Bottle',
    77: 'Shakuhachi',
    78: 'Whistle',
    79: 'Ocarina',
    80: 'Lead 1 (square)',
    81: 'Lead 2 (sawtooth)',
    82: 'Lead 3 (calliope)',
    83: 'Lead 4 (chiff)',
    84: 'Lead 5 (charang)',
    85: 'Lead 6 (voice)',
    86: 'Lead 7 (fifths)',
    87: 'Lead 8 (bass+lead)',
    88: 'Pad 1 (new age)',
    89: 'Pad 2 (warm)',
    90: 'Pad 3 (polysynth)',
    91: 'Pad 4 (choir)',
    92: 'Pad 5 (bowed)',
    93: 'Pad 6 (metallic)',
    94: 'Pad 7 (halo)',
    95: 'Pad 8 (sweep)',
    96: 'FX 1 (rain)',
    97: 'FX 2 (soundtrack)',
    98: 'FX 3 (crystal)',
    99: 'FX 4 (atmosphere)',
    100: 'FX 5 (brightness)',
    101: 'FX 6 (goblins)',
    102: 'FX 7 (echoes)',
    103: 'FX 8 (sci-fi)',
    104: 'Sitar',
    105: 'Banjo',
    106: 'Shamisen',
    107: 'Koto',
    108: 'Kalimba',
    109: 'Bagpipe',
    110: 'Fiddle',
    111: 'Shanai',
    112: 'Tinkle Bell',
    113: 'Agogo',
    114: 'Steel Drums',
    115: 'Woodblock',
    116: 'Taiko Drum',
    117: 'Melodic Tom',
    118: 'Synth Drum',
    119: 'Reverse Cymbal',
    120: 'Guitar Fret Noise',
    121: 'Breath Noise',
    122: 'Seashore',
    123: 'Bird Tweet',
    124: 'Telephone Ring',
    125: 'Helicopter',
    126: 'Applause',
    127: 'Gunshot',
  },
  percussion: {
    24: 'Snare Roll',
    25: 'Finger Snap',
    26: 'High Q',
    27: 'Slap',
    28: 'Scratch Pull',
    29: 'Scratch Push',
    30: 'Sticks',
    31: 'Square Click',
    32: 'Metronome Bell',
    33: 'Metronome Click',
    34: 'Acoustic Bass Drum',
    35: 'Electric Bass Drum',
    36: 'Side Stick',
    37: 'Acoustic Snare',
    38: 'Hand Clap',
    39: 'Electric Snare',
    40: 'Low Floor Tom',
    41: 'Closed Hi-hat',
    42: 'High Floor Tom',
    43: 'Pedal Hi-hat',
    44: 'Low Tom',
    45: 'Open Hi-hat',
    46: 'Low-Mid Tom',
    47: 'High-Mid Tom',
    48: 'Crash Cymbal 1',
    49: 'High Tom',
    50: 'Ride Cymbal 1',
    51: 'Chinese Cymbal',
    52: 'Ride Bell',
    53: 'Tambourine',
    54: 'Splash Cymbal',
    55: 'Cowbell',
    56: 'Crash Cymbal 2',
    57: 'Vibraslap',
    58: 'Ride Cymbal 2',
    59: 'High Bongo',
    60: 'Low Bongo',
    61: 'Mute High Conga',
    62: 'Open High Conga',
    63: 'Low Conga',
    64: 'High Timbale',
    65: 'Low Timbale',
    66: 'High Agogô',
    67: 'Low Agogô',
    68: 'Cabasa',
    69: 'Maracas',
    70: 'Short Whistle',
    71: 'Long Whistle',
    72: 'Short Guiro',
    73: 'Long Guiro',
    74: 'Claves',
    75: 'High Woodblock',
    76: 'Low Woodblock',
    77: 'Mute Cuica',
    78: 'Open Cuica',
    79: 'Mute Triangle',
    80: 'Open Triangle',
    81: 'Shaker',
    82: 'Jingle Bell',
    83: 'Belltree',
    84: 'Castanets',
    85: 'Mute Surdo',
    86: 'Open Surdo',
  },
}
