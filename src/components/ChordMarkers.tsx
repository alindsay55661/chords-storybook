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
  const ticksPerPixel = timings.durationTicks / width
  const chordWidth = timings.ticksPerBeat / ticksPerPixel
  const markers = chords.map((chord, idx) => {
    const x = chord.startTicks / ticksPerPixel
    const label = chord.chords.length ? chord.chords[0] : ''
    return {
      key: `${chord.startTicks}`,
      x,
      label,
      w: chord.durationTicks / ticksPerPixel,
    }
  })

  return (
    <div
      className="relative h-8"
      style={{ width: `${width}px` }}
    >
      {markers.map(marker => (
        <div
          key={marker.key}
          className="absolute h-full bg-slate-100"
          style={{ left: `${marker.x}px`, width: `${marker.w - 2}px` }}
        >
          <div className="text-center p-1 text-xs">{marker.label}</div>
        </div>
      ))}
    </div>
  )
}
