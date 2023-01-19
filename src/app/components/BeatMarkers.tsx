import { Song } from '../utils/song'

type BeatMarkerProps = {
  song: Song
  songWidth: number
  sidebarWidth: number
}
export default function BeatMarkers({
  song,
  songWidth,
  sidebarWidth,
}: BeatMarkerProps) {
  const ticksPerPixel = song.timings.durationTicks / songWidth
  const markers = song.notes.byBar.reduce((result: any[], bar) => {
    let firstBeat = true
    bar.beats.forEach(beat => {
      result.push({
        key: `beat-${beat.index}`,
        x: beat.startTicks / ticksPerPixel + sidebarWidth,
        label: firstBeat ? bar.index + 1 : '',
        w: beat.durationTicks / ticksPerPixel,
      })
      firstBeat = false
    })
    return result
  }, [])

  return (
    <div
      className="relative h-4 bg-slate-800 text-xs text-white"
      style={{ width: `${songWidth + sidebarWidth}px` }}
    >
      <div
        className="sticky left-0 z-50 h-full bg-slate-800 px-2 shadow-right"
        style={{
          width: `${sidebarWidth}px`,
        }}
      >
        Measure #
      </div>
      {markers.map(marker => (
        <div
          key={marker.key}
          className="absolute top-0 h-full border-l border-slate-500"
          style={{ left: `${marker.x}px`, width: `${marker.w - 1}px` }}
        >
          <div className="px-1 text-xs italic text-slate-400">
            {marker.label}
          </div>
        </div>
      ))}
    </div>
  )
}
