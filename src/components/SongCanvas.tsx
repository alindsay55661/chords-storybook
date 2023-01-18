import { useEffect, useState } from 'react'
import SongHeaders from './SongHeaders'
import Track from './Track'
import BeatLines from './BeatLines'
import { DetectUnit, Song } from '../utils/analyze'

export type SongCanvasOptions = Pick<
  SongCanvasProps,
  'zoom' | 'trackHeight' | 'chordDetectUnit'
>

export type SongCanvasProps = {
  song: Song
  zoom?: number
  trackHeight?: number
  maxHeight?: string
  chordDetectUnit?: DetectUnit
}

export default function SongCanvas({
  trackHeight = 128,
  maxHeight = '100%',
  zoom = 50,
  chordDetectUnit = 'bar',
  song,
}: SongCanvasProps) {
  const { tracks, timings } = song
  const sidebarWidth = 82
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
      <SongHeaders
        song={song}
        chordDetectUnit={chordDetectUnit}
        songWidth={headerWidth}
        sidebarWidth={sidebarWidth}
        visible={headerVisible}
      />

      <div className="relative">
        <div className="absolute z-0 h-full">
          <BeatLines
            bars={song.notes.byBar}
            timings={timings}
            width={songWidth}
          />
        </div>
        {tracks.map(track => {
          return (
            <Track
              key={track.id}
              track={track}
              trackHeight={trackHeight}
              songWidth={songWidth}
              sidebarWidth={sidebarWidth}
            />
          )
        })}
      </div>
    </div>
  )
}
