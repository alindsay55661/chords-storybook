import { Stats } from '../utils/analyze'
import { Timings, TimeSignature } from '../utils/parse'
import { detectChords } from '../utils/chords'

type ChordMarkerProps = {
  analyzed: Stats
  timings: Timings
  width: number
}
export default function ChordMarkers({
  analyzed,
  timings,
  width,
}: ChordMarkerProps) {
  const chords = detectChords(analyzed, { unit: 'bar' })
  console.log(chords)
  const ticksPerPixel = timings.durationTicks / width
  const markers = chords.map((chord, idx) => {
    const x = chord.startTicks / ticksPerPixel
    return {
      key: `${chord.startTicks}`,
      x,
      label: `${chord.chords[0]}`,
    }
  })

  return (
    <div style={{ width: `${width}px` }}>
      {markers.map(marker => (
        <div
          key={marker.key}
          className="absolute flex flex-col h-full"
          style={{ left: `${marker.x}px` }}
        >
          <div className="flex-shrink-0">{marker.label}</div>
          <div className="w-0.5 h-full flex-grow bg-black"></div>
        </div>
      ))}
    </div>
  )
}
