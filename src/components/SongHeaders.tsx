import { memo } from 'react'
import { DetectUnit, Song } from '../utils/analyze'
import ChordMarkers from './ChordMarkers'
import TimeSignatureMarkers from './TimeSignatureMarkers'
import BeatMarkers from './BeatMarkers'

export type SongHeadersProps = {
  song: Song
  songWidth: number
  topOffset: number
  leftOffset: number
  visible: boolean
  chordDetectUnit?: DetectUnit
}

function SongHeaders({
  song,
  songWidth,
  topOffset,
  leftOffset,
  visible = true,
  chordDetectUnit = 'bar',
}: SongHeadersProps) {
  const { timings, timeSignatures } = song

  return (
    <div
      className="sticky top-0 z-50 bg-white"
      style={{
        height: `${topOffset}px`,
        width: `${songWidth + leftOffset}px`,
        minWidth: `100%`,
      }}
    >
      {!visible && (
        <div className="absolute top-0 z-50 h-full w-full bg-white opacity-70"></div>
      )}

      <ChordMarkers
        song={song}
        detectUnit={chordDetectUnit}
        width={songWidth}
        leftOffset={leftOffset}
      />
      <div className="border-b border-slate-400" />
      <TimeSignatureMarkers
        timings={timings}
        timeSignatures={timeSignatures}
        width={songWidth}
        leftOffset={leftOffset}
      />
      <div className="border-b border-slate-600" />
      <BeatMarkers
        song={song}
        width={songWidth}
        leftOffset={leftOffset}
      />
      <div className="border-b border-slate-400" />
    </div>
  )
}

export default memo(SongHeaders)
