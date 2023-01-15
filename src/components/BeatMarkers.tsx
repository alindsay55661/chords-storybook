import { Stats } from '../utils/analyze'
import { Timings, TimeSignature } from '../utils/parse'
import { detectChords } from '../utils/chords'

type BeatMarkerProps = {
  analyzed: Stats
  timings: Timings
  width: number
}
export default function BeatMarkers({
  analyzed,
  timings,
  width,
}: BeatMarkerProps) {
  const beats = Array(timings.totalBeats)
    .fill(0)
    .map((_, idx) => {
      return idx * timings.ticksPerBeat
    })
  // const chords = detectChords(analyzed, { unit: 'bar' })
  const ticksPerPixel = timings.durationTicks / width
  const beatWidth = timings.ticksPerBeat / ticksPerPixel
  const markers = beats.map((beat, idx) => {
    const x = idx * beatWidth
    const label = idx + 1
    return {
      key: `${idx}`,
      x,
      label,
      w: beatWidth,
    }
  })

  return (
    <div
      className="relative h-4"
      style={{ width: `${width}px` }}
    >
      {markers.map(marker => (
        <div
          key={marker.key}
          className="absolute h-full bg-slate-800"
          style={{ left: `${marker.x}px`, width: `${marker.w - 2}px` }}
        >
          <div className="text-white px-[1px] text-xs">{marker.label}</div>
        </div>
      ))}
    </div>
  )
}
