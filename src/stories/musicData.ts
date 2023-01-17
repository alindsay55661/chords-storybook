import * as twoBarData from '../test/midi/2bar.mid.json'
import * as grooveData from '../test/midi/groove.mid.json'
import * as ghostBustersData from '../test/midi/ghostbusters.mid.json'
import * as takeFiveData from '../test/midi/takefivedavebrubeck.mid.json'
import * as chordTestData from '../test/midi/chord-test.mid.json'
import { analyze } from '../utils/analyze'

export const analyzed = {
  twoBar: analyze(twoBarData),
  groove: analyze(grooveData),
  ghostBusters: analyze(ghostBustersData),
  takeFive: analyze(takeFiveData),
  chordTest: analyze(chordTestData),
}
