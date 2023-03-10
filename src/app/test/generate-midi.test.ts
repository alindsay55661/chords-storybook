import { test } from 'vitest'
import { readFileSync, writeFileSync } from 'node:fs'
import { parseMidi } from '../utils/parse'

// This test file is not an actual test, just a shortcut to writing files
// Change 'test.skip(' to 'test(' to write files - then restore the skip
test.skip('save parsed midi files to disk', () => {
  function writeParsed(midiFile: string) {
    const inputPath = `${__dirname}/midi/`
    const outputPath = `${__dirname}/midi/`
    const data = readFileSync(inputPath + midiFile)
    const parsed = parseMidi(data)

    writeFileSync(
      outputPath + midiFile + '.json',
      JSON.stringify(parsed, null, 2),
    )
  }

  const files = [
    '2bar.mid',
    'beat.mid',
    'blackbird.mid',
    'chord-test.mid',
    'ghostbusters.mid',
    'groove.mid',
    'sample.mid',
    'takefivedavebrubeck.mid',
  ]

  files.forEach(writeParsed)
})
