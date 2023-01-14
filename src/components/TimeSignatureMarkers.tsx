import { Timings, TimeSignature } from '../utils/parse'

type SignatureProps = {
  timeSignatures: TimeSignature[]
  timings: Timings
  width: number
}
export default function TimeSignatureMarkers({
  timings,
  timeSignatures,
  width,
}: SignatureProps) {
  const ticksPerPixel = timings.durationTicks / width
  const markers = timeSignatures.map((ts, idx) => {
    const x = ts.startTicks / ticksPerPixel
    return {
      key: `${ts.numerator}-${ts.denominator}-${idx}`,
      x,
      label: `${ts.numerator}/${ts.denominator}`,
    }
  })

  return (
    <div
      className="relative"
      style={{ width: `${width}px` }}
    >
      {markers.map(marker => (
        <div
          key={marker.key}
          className="absolute"
          style={{ left: `${marker.x}px` }}
        >
          <div>{marker.label}</div>
          <div>Mark Line</div>
        </div>
      ))}
    </div>
  )
}

// "timeSignatures": [
//     {
//       "startTicks": 0,
//       "startBeat": 0,
//       "beatsInSignature": 305,
//       "numerator": 5,
//       "denominator": 4
//     },
//     {
//       "startTicks": 146400,
//       "startBeat": 305,
//       "beatsInSignature": 9,
//       "numerator": 3,
//       "denominator": 4
//     },
//     {
//       "startTicks": 150720,
//       "startBeat": 314,
//       "beatsInSignature": 97,
//       "numerator": 5,
//       "denominator": 4
//     }
//   ],
