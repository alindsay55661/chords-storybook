import { useMemo, useRef, useEffect, memo } from 'react'
import { Timings, TimeSignature, Track } from '../utils/parse'
import TrackHeader from './TrackHeader'
import Clip from './Clip'
import BeatLines from './BeatLines'
import TimeSignatureMarkers from './TimeSignatureMarkers'
import ChordMarkers from './ChordMarkers'
import BeatMarkers from './BeatMarkers'
import { Stats } from '../utils/analyze'

export type MidiTracksProps = {
  tracks: Track[]
  timings: Timings
  timeSignatures: TimeSignature[]
  zoom?: number
  trackHeight?: number
  analyzed: Stats
}

export default function MidiTracks({
  trackHeight = 128,
  zoom = 50,
  tracks = [],
  timings,
  timeSignatures,
  analyzed,
}: MidiTracksProps) {
  const height = tracks.length * trackHeight
  const trackWidth = (timings.durationTicks / timings.ticksPerBeat) * zoom
  const topOffset = 70
  const leftOffset = 82

  return (
    <div
      className="bg-white relative overflow-y-scroll overflow-x-scroll"
      style={{ height: `400px` }}
    >
      <div className="sticky left-0 z-50">
        <div
          className="absolute bg-white top-0 w-[80px] text-white p-4"
          style={{ height: `${topOffset - 1}px` }}
        ></div>
        {tracks.map((track, idx) => (
          <div
            key={`header-${track.id}`}
            className="absolute z-10 left-"
            style={{ top: trackHeight * idx + topOffset }}
          >
            <TrackHeader
              height={trackHeight}
              name={track.name}
            />
          </div>
        ))}
      </div>

      <div
        className="sticky top-0 z-40 bg-white"
        style={{
          height: `${topOffset}px`,
          width: `${trackWidth + leftOffset}px`,
        }}
      >
        <div
          className="absolute"
          style={{ left: `${leftOffset}px` }}
        >
          <TimeSignatureMarkers
            timings={timings}
            timeSignatures={timeSignatures}
            width={trackWidth}
          />
          <ChordMarkers
            analyzed={analyzed}
            timings={timings}
            width={trackWidth}
          />
          {/* <BeatMarkers
            analyzed={analyzed}
            timings={timings}
            width={trackWidth}
          /> */}
        </div>
      </div>

      <div className="pl-[82px] relative">
        <div className="absolute z-0 h-full">
          <BeatLines
            timings={timings}
            width={`${trackWidth}px`}
          />
        </div>
        <div className="">
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
    </div>
  )
}
