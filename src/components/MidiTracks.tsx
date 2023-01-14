import { useMemo, useRef, useEffect, memo } from 'react'
import { Timings, TimeSignature, Track } from '../utils/parse'
import TrackHeader from './TrackHeader'
import Clip from './Clip'
import BeatLines from './BeatLines'
import TimeSignatureMarkers from './TimeSignatureMarkers'

export type MidiTracksProps = {
  tracks: Track[]
  timings: Timings
  timeSignatures: TimeSignature[]
  zoom?: number
  trackHeight?: number
}

export default function MidiTracks({
  trackHeight = 128,
  zoom = 50,
  tracks = [],
  timings,
  timeSignatures,
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
          style={{ top: trackHeight * idx + 100 }}
        >
          <TrackHeader
            height={trackHeight}
            name={track.name}
          />
        </div>
      ))}

      <div className="pl-[82px] w-full overflow-x-scroll overflow-y-hidden relative">
        <div style={{ height: '100px' }}>
          <TimeSignatureMarkers
            timings={timings}
            timeSignatures={timeSignatures}
            width={trackWidth}
          />
        </div>
        <div className="absolute z-0 h-full">
          <BeatLines
            timings={timings}
            width={`${trackWidth}px`}
          />
        </div>
        {tracks.map(track => {
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
