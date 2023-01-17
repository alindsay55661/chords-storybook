import { Timings, TimeSignature } from '../utils/parse'

type SignatureProps = {
  timeSignatures: TimeSignature[]
  timings: Timings
  width: number
  leftOffset: number
}
export default function TimeSignatureMarkers({
  timings,
  timeSignatures,
  width,
  leftOffset,
}: SignatureProps) {
  const ticksPerPixel = timings.durationTicks / width
  const markers = timeSignatures.map((ts, idx) => {
    const x = ts.startTicks / ticksPerPixel + leftOffset
    return {
      key: `${ts.numerator}-${ts.denominator}-${idx}`,
      x,
      label: `${ts.numerator}/${ts.denominator}`,
    }
  })

  return (
    <div
      className="relative h-5 bg-slate-700 text-white"
      style={{ width: `${width + leftOffset}px` }}
    >
      <div className="sticky left-0 z-50 h-full w-[80px] overflow-hidden bg-slate-700 shadow-right">
        <div className="py-0.5 px-2  text-xs">Time Sig.</div>
      </div>
      {markers.map(marker => (
        <div
          key={marker.key}
          className="absolute top-0 flex h-full flex-col border-l border-slate-500"
          style={{ left: `${marker.x}px` }}
        >
          <div className="flex-shrink-0 pt-0.5 pl-1 text-xs">
            {marker.label}
          </div>
        </div>
      ))}
    </div>
  )
}
