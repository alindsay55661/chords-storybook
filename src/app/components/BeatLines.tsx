import { memo } from 'react'
import { Timings, Bar } from '../utils/parse'

type BeatLinesProps = {
  timings: Timings
  bars: Bar[]
  width: number
}
function BeatLines({ timings, bars, width }: BeatLinesProps) {
  const markerWidth = timings.ticksPerBeat / 200
  const markers = bars.reduce((result: any[], bar) => {
    let firstBeat = true
    bar.beats.forEach(beat => {
      result.push({
        key: `beat-marker-${beat.index}`,
        x: beat.startTicks,
        label: firstBeat ? bar.index + 1 : '',
      })
      firstBeat = false
    })
    return result
  }, [])

  return (
    <svg
      viewBox={`-${markerWidth} 0 ${timings.durationTicks} 100`}
      preserveAspectRatio="none"
      width={width}
      height="100%"
    >
      {markers.map(beat => {
        return (
          <rect
            key={beat.key}
            width={markerWidth}
            height="100"
            x={beat.x}
            y={0}
            className="fill-black/30"
          />
        )
      })}
    </svg>
  )
}

export default memo(BeatLines)
