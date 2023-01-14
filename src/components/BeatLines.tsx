import { memo } from 'react'
import { Timings } from '../utils/parse'

type BeatLinesProps = {
  timings: Timings
  width?: string
}
function BeatLines({ timings, width = '100%' }: BeatLinesProps) {
  const beatMarkers = new Array(timings.totalBeats)
    .fill(0)
    .map((_, idx) => idx * timings.ticksPerBeat)
  const markerWidth = timings.ticksPerBeat / 200

  return (
    <svg
      viewBox={`-${markerWidth} 0 ${timings.durationTicks} 100`}
      preserveAspectRatio="none"
      width={width}
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
}

export default memo(BeatLines)
