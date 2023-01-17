import { useEffect, useState } from 'react'
import SongHeaders from './SongHeaders'
import TrackHeader from './TrackHeader'
import Clip from './Clip'
import BeatLines from './BeatLines'
import { DetectUnit, Song } from '../utils/analyze'

export type MidiTracksProps = {
  song: Song
  zoom?: number
  trackHeight?: number
  maxHeight?: string
  chordDetectUnit?: DetectUnit
}

export default function MidiTracks({
  trackHeight = 128,
  maxHeight = '100%',
  zoom = 50,
  chordDetectUnit = 'bar',
  song,
}: MidiTracksProps) {
  const { tracks, timings } = song
  const topOffset = 78
  const leftOffset = 82
  const songWidth = (timings.durationTicks / timings.ticksPerBeat) * zoom

  const [headerWidth, setHeaderWidth] = useState(songWidth)
  const [headerVisible, setHeaderVisible] = useState(true)

  // Debounce header rendering (expensive to resize)
  useEffect(() => {
    setHeaderVisible(false)
    const timeout = setTimeout(() => {
      setHeaderWidth(songWidth)
      setHeaderVisible(true)
    }, 300)
    return () => clearTimeout(timeout)
  }, [songWidth])

  return (
    <div
      className="relative overflow-x-scroll overflow-y-scroll bg-white"
      style={{ maxHeight }}
    >
      <div className="sticky left-0 z-40">
        {tracks.map((track, idx) => (
          <div
            key={`header-${track.id}`}
            className="left- absolute z-10 shadow-right"
            style={{ top: trackHeight * idx + topOffset }}
          >
            <TrackHeader
              height={trackHeight}
              name={track.name}
            />
          </div>
        ))}
      </div>

      <SongHeaders
        song={song}
        chordDetectUnit={chordDetectUnit}
        songWidth={headerWidth}
        leftOffset={leftOffset}
        topOffset={topOffset}
        visible={headerVisible}
      />

      <div className="relative pl-[82px]">
        <div className="absolute z-0 h-full">
          <BeatLines
            bars={song.notes.byBar}
            timings={timings}
            width={songWidth}
          />
        </div>
        <div className="">
          {tracks.map(track => {
            return (
              <div key={`track-${track.id}`}>
                <div
                  className="track z-0 border-b border-slate-200 py-0.5"
                  style={{
                    height: `${trackHeight}px`,
                    width: `${songWidth}px`,
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
