import { Song } from '../utils/song'

type SignatureProps = {
  song: Song
  songWidth: number
  sidebarWidth: number
}
export default function TimeSignatureMarkers({
  song,
  songWidth,
  sidebarWidth,
}: SignatureProps) {
  const { timings, timeSignatures } = song
  const ticksPerPixel = timings.durationTicks / songWidth
  const markers = timeSignatures.map((ts, idx) => {
    const x = ts.startTicks / ticksPerPixel + sidebarWidth
    return {
      key: `${ts.numerator}-${ts.denominator}-${idx}`,
      x,
      label: `${ts.numerator}/${ts.denominator}`,
    }
  })

  return (
    <div
      className="relative h-5 bg-slate-700 text-white"
      style={{ width: `${songWidth + sidebarWidth}px` }}
    >
      <div
        className="sticky left-0 z-50 h-full overflow-hidden bg-slate-700 shadow-right"
        style={{
          width: `${sidebarWidth}px`,
        }}
      >
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
