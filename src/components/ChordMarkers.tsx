import { DetectUnit, Song } from '../utils/analyze'
import { detectChords } from '../utils/chords'
import ChordName from './ChordName'

type ChordMarkerProps = {
  song: Song
  songWidth: number
  sidebarWidth: number
  detectUnit?: DetectUnit
}

export default function ChordMarkers({
  song,
  songWidth,
  sidebarWidth,
  detectUnit = 'bar',
}: ChordMarkerProps) {
  const chords = detectChords(song, { unit: detectUnit })
  const ticksPerPixel = song.timings.durationTicks / songWidth
  const markers = chords.map(chord => {
    const x = chord.startTicks / ticksPerPixel + sidebarWidth
    const label = chord.chordsInclusive.length
      ? chord.chordsInclusive[0]
      : chord.chords[0]

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
      style={{ width: `${songWidth + sidebarWidth}px` }}
    >
      <div
        className="sticky left-0 z-50 h-full overflow-hidden border-r border-slate-400 bg-slate-200 shadow-right"
        style={{
          width: `${sidebarWidth}px`,
        }}
      >
        <div className="p-3 text-center text-xs">Chords</div>
      </div>
      {markers.map(marker => (
        <div
          key={marker.key}
          className="absolute top-0 grid h-full place-content-center overflow-hidden border-r border-slate-400"
          style={{ left: `${marker.x}px`, width: `${marker.w}px` }}
        >
          <div className="font-bold">
            <ChordName chordText={marker.label} />
          </div>
        </div>
      ))}
    </div>
  )
}
