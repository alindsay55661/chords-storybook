import { memo } from 'react'
import { DetectUnit, Song } from '../utils/song'
import ChordMarkers from './ChordMarkers'
import TimeSignatureMarkers from './TimeSignatureMarkers'
import BeatMarkers from './BeatMarkers'

export type SongHeadersProps = {
  song: Song
  songWidth: number
  sidebarWidth: number
  visible?: boolean
  chordDetectUnit?: DetectUnit
}

function SongHeaders({
  song,
  songWidth,
  sidebarWidth,
  visible = true,
  chordDetectUnit = 'bar',
}: SongHeadersProps) {
  return (
    <div
      className="sticky top-0 z-50 bg-white"
      style={{
        width: `${songWidth + sidebarWidth}px`,
        minWidth: `100%`,
      }}
    >
      {!visible && (
        <div className="absolute top-0 z-50 h-full w-full bg-white opacity-70"></div>
      )}

      <ChordMarkers
        song={song}
        detectUnit={chordDetectUnit}
        songWidth={songWidth}
        sidebarWidth={sidebarWidth}
      />
      <div className="border-b border-slate-400" />
      <TimeSignatureMarkers
        song={song}
        songWidth={songWidth}
        sidebarWidth={sidebarWidth}
      />
      <div className="border-b border-slate-600" />
      <BeatMarkers
        song={song}
        songWidth={songWidth}
        sidebarWidth={sidebarWidth}
      />
      <div className="border-b border-slate-400" />
    </div>
  )
}

export default memo(SongHeaders)
