import { Song } from '../utils/analyze'
import { detectChords } from '../utils/chords'

type ChordMarkerProps = {
  song: Song
  width: number
  leftOffset: number
}
export default function ChordMarkers({
  song,
  width,
  leftOffset,
}: ChordMarkerProps) {
  const chords = detectChords(song, { unit: 'bar' })
  const ticksPerPixel = song.timings.durationTicks / width
  const markers = chords.map(chord => {
    const x = chord.startTicks / ticksPerPixel + leftOffset
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
      className="relative h-10 bg-slate-100"
      style={{ width: `${width + leftOffset}px` }}
    >
      <div className="sticky left-0 z-50 h-full w-[80px] overflow-hidden border-r border-slate-400 bg-slate-200 shadow-right">
        <div className="p-3 text-center text-xs">Chords</div>
      </div>
      {markers.map(marker => (
        <div
          key={marker.key}
          className="absolute top-0 grid h-full place-content-center overflow-hidden border-r border-slate-400"
          style={{ left: `${marker.x}px`, width: `${marker.w}px` }}
        >
          <div className="font-bold">{marker.label}</div>
        </div>
      ))}
    </div>
  )
}
