import { memo } from 'react'

export type TrackProps = {
  height: number
  zoom?: number
  name?: string
}

function TrackHeader({ height = 128, zoom = 0.5, name }: TrackProps) {
  return (
    <div
      className="track-header w-20 border-b border-sky-300 bg-sky-600 p-2 text-xs text-white"
      style={{ height: `${height}px` }}
    >
      {name}
    </div>
  )
}

export default memo(TrackHeader)
