import Clip from './Clip'
import { Track as TrackType } from '../utils/parse'

export type TrackProps = {
  songWidth: number
  sidebarWidth: number
  track: TrackType
  trackHeight?: number
}

export default function Track({
  track,
  songWidth,
  sidebarWidth,
  trackHeight = 128,
}: TrackProps) {
  return (
    <div
      className="relative bg-slate-100"
      style={{
        width: `${songWidth + sidebarWidth}px`,
        height: `${trackHeight}px`,
      }}
    >
      <div
        className="sticky left-0 z-40 h-full overflow-hidden border-b border-sky-300 bg-sky-600 shadow-right"
        style={{
          width: `${sidebarWidth}px`,
        }}
      >
        <div className="p-3 text-xs text-white">{track.name}</div>
      </div>

      <div
        className="absolute top-0 z-0 border-b border-slate-200 py-0.5"
        style={{
          height: `${trackHeight}px`,
          width: `${songWidth}px`,
          left: `${sidebarWidth}px`,
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
}
