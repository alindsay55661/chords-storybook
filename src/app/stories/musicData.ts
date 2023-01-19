import * as twoBarData from '../test/midi/2bar.mid.json'
import * as grooveData from '../test/midi/groove.mid.json'
import * as ghostBustersData from '../test/midi/ghostbusters.mid.json'
import * as takeFiveData from '../test/midi/takefivedavebrubeck.mid.json'
import * as chordTestData from '../test/midi/chord-test.mid.json'
import { makeSong } from '../utils/song'

export const songs = {
  twoBar: makeSong(twoBarData),
  groove: makeSong(grooveData),
  ghostBusters: makeSong(ghostBustersData),
  takeFive: makeSong(takeFiveData),
  chordTest: makeSong(chordTestData),
}
