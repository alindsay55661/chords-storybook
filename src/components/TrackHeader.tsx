import { memo } from 'react'

export type TrackProps = {
  height: number
  zoom?: number
  name?: string
}

function TrackHeader({ height = 128, zoom = 0.5, name }: TrackProps) {
  return (
    <div
      className="track-header bg-sky-600 text-white text-xs w-20 p-2 border-b border-sky-300"
      style={{ height: `${height}px` }}
    >
      {name}
    </div>
  )
}

export default memo(TrackHeader)
