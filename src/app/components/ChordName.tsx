import { memo } from 'react'
import { chordParserFactory, chordRendererFactory } from 'chord-symbol'
import styles from './chord-name.module.css'

const parseChord = chordParserFactory()
const renderChord = chordRendererFactory({ useShortNamings: true })
const subText = `<span class="${styles.subtext}">$&</span>`

type ChordNameProps = {
  chordText: string
}

function ChordName({ chordText }: ChordNameProps) {
  // Initial clean up by chord-symbol
  const parsed = parseChord(chordText)
  let override

  if (parsed?.error) {
    override = parsed.error[0]?.chord?.input?.symbol ?? ' '
  }

  const rendered = override ? `${override}` : parsed ? renderChord(parsed) : ' '
  const chord = rendered
    .replaceAll('b', '♭')
    .replaceAll('#', '♯')
    .replace(/omit/g, 'no')
    .replace(/m\/ma*/g, 'miMa')
    .replace(/miMa[0-9]*/g, subText)
    .replace(/\(.+\)/g, subText)
    .replace(/mi[0-9]*/g, subText)
    .replace(/ma[0-9]*/gi, subText)
    .replace(/sus/g, subText)
    .replace(/dim[0-9]*/g, subText)

  return (
    <div
      className="chord"
      dangerouslySetInnerHTML={{ __html: chord }}
    />
  )
}

export default memo(ChordName)
