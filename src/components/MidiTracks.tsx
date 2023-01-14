import { useMemo, useRef, useEffect, memo } from 'react'
import { Timings, Track } from '../utils/parse'
import TrackHeader from './TrackHeader'
import Clip from './Clip'

export type MidiTracksProps = {
  tracks: Track[]
  timings: Timings
  zoom?: number
  trackHeight?: number
}

type BeatLinesProps = {
  timings: Timings
  width: number
}
const BeatLines = memo(({ timings, width }: BeatLinesProps) => {
  const beatMarkers = useMemo(() => {
    return new Array(timings.totalBeats)
      .fill(0)
      .map((_, idx) => idx * timings.ticksPerBeat)
  }, [timings])

  const markerWidth = timings.ticksPerBeat / 200

  return (
    <svg
      viewBox={`-${markerWidth} 0 ${timings.durationTicks} 100`}
      preserveAspectRatio="none"
      width={`${width}px`}
      height="100%"
    >
      {beatMarkers.map(beat => {
        return (
          <rect
            key={beat}
            width={markerWidth}
            height="100"
            x={beat}
            y={0}
            className="fill-black/30"
          />
        )
      })}
    </svg>
  )
})

export default function MidiTracks({
  trackHeight = 128,
  zoom = 50,
  tracks = [],
  timings,
}: MidiTracksProps) {
  const height = tracks.length * trackHeight
  const trackWidth = timings.totalBeats * zoom

  return (
    <div
      className="bg-white relative"
      style={{ height: `${height}px` }}
    >
      {tracks.map((track, idx) => (
        <div
          key={`header-${track.id}`}
          className="absolute z-10"
          style={{ top: trackHeight * idx }}
        >
          <TrackHeader
            height={trackHeight}
            name={track.name}
          />
        </div>
      ))}

      <div className="pl-[82px] w-full overflow-x-scroll relative">
        <div className="absolute z-0 h-full">
          <BeatLines
            timings={timings}
            width={trackWidth}
          />
        </div>
        {tracks.map((track, idx) => {
          return (
            <div key={`track-${track.id}`}>
              <div
                className="track border-b border-slate-200 py-0.5 z-0"
                style={{
                  height: `${trackHeight}px`,
                  width: `${trackWidth}px`,
                }}
              >
                <Clip
                  startTicks={0}
                  durationTicks={track.durationTicks}
                  notes={track.notes}
                  lowestNote={track.lowestNote}
                  highestNote={track.highestNote}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
