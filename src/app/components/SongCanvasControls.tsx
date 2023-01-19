import { Dispatch, SetStateAction } from 'react'
import { SongCanvasOptions } from './SongCanvas'

type SongCanvasControlsProps = {
  options: SongCanvasOptions
  setOptions: Dispatch<SetStateAction<SongCanvasOptions>>
}

export default function SongCanvasControls({
  options,
  setOptions,
}: SongCanvasControlsProps) {
  let { zoom, trackHeight, chordDetectUnit } = options
  const zoomMin = 2
  const zoomMax = 200
  const trackHeightMin = 48
  const trackHeightMax = 256

  // Ensure ranges
  if (zoom && zoom < zoomMin) zoom = zoomMin
  if (zoom && zoom > zoomMax) zoom = zoomMax
  if (trackHeight && trackHeight < trackHeightMin) zoom = trackHeightMin
  if (trackHeight && trackHeight > trackHeightMax) zoom = trackHeightMax

  return (
    <div>
      <label className="inline-block p-4">
        <span className="pr-2">Track Width</span>
        <input
          type="range"
          min="2"
          max="200"
          value={zoom}
          onChange={e => {
            setOptions(opts => ({ ...opts, zoom: Number(e.target.value) }))
          }}
        />
      </label>
      <label className="inline-block p-4">
        <span className="pr-2">Track Height</span>
        <input
          type="range"
          min="48"
          max="256"
          value={trackHeight}
          onChange={e => {
            setOptions(opts => ({
              ...opts,
              trackHeight: Number(e.target.value),
            }))
          }}
        />
      </label>

      <span className="p4 inline-block">
        Detect chords by
        <label className="px-3">
          <input
            type="radio"
            name="unit"
            value="bar"
            checked={chordDetectUnit === 'bar'}
            onChange={() =>
              setOptions(opts => ({ ...opts, chordDetectUnit: 'bar' }))
            }
          />{' '}
          bar
        </label>
        <label>
          <input
            type="radio"
            name="unit"
            value="beat"
            checked={chordDetectUnit === 'beat'}
            onChange={() =>
              setOptions(opts => ({ ...opts, chordDetectUnit: 'beat' }))
            }
          />{' '}
          beat
        </label>
      </span>
    </div>
  )
}
