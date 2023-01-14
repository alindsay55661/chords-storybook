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
    <div style={{ width: `${width}px` }}>
      {markers.map(marker => (
        <div
          key={marker.key}
          className="absolute flex flex-col h-full"
          style={{ left: `${marker.x}px` }}
        >
          <div className="flex-shrink-0">{marker.label}</div>
          <div className="w-0.5 h-full flex-grow bg-black"></div>
        </div>
      ))}
    </div>
  )
}
