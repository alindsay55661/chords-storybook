import { Song } from '../utils/analyze'

type BeatMarkerProps = {
  song: Song
  width: number
  leftOffset: number
}
export default function BeatMarkers({
  song,
  width,
  leftOffset,
}: BeatMarkerProps) {
  const ticksPerPixel = song.timings.durationTicks / width
  const markers = song.notes.byBar.reduce((result: any[], bar) => {
    let firstBeat = true
    bar.beats.forEach(beat => {
      result.push({
        key: `beat-${beat.index}`,
        x: beat.startTicks / ticksPerPixel + leftOffset,
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
      style={{ width: `${width + leftOffset}px` }}
    >
      <div className="sticky left-0 z-50 h-full w-[80px] bg-slate-800 px-2 shadow-right">
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
