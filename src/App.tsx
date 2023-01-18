import { useState } from 'react'
import './App.css'
import FileSelector from './components/FileSelector'
import SongCanvas from './components/SongCanvas'
import { analyzed as data } from './stories/musicData'
import { Song, DetectUnit } from './utils/analyze'

function App() {
  const [zoom, setZoom] = useState(130)
  const [trackHeight, setTrackHeight] = useState(128)
  const [unit, setUnit] = useState<DetectUnit>('beat')
  const [song, setSong] = useState<Song>(data.chordTest)

  return (
    <div>
      <FileSelector setSong={setSong} />

      <label className="inline-block p-4">
        <span className="pr-2">Track Width</span>
        <input
          type="range"
          min="2"
          max="200"
          value={zoom}
          onChange={e => {
            setZoom(Number(e.target.value))
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
            setTrackHeight(Number(e.target.value))
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
            checked={unit === 'bar'}
            onChange={() => setUnit('bar')}
          />{' '}
          bar
        </label>
        <label>
          <input
            type="radio"
            name="unit"
            value="beat"
            checked={unit === 'beat'}
            onChange={() => setUnit('beat')}
          />{' '}
          beat
        </label>
      </span>

      <SongCanvas
        song={song}
        chordDetectUnit={unit}
        zoom={zoom}
        trackHeight={trackHeight}
        maxHeight="500px"
      />
    </div>
  )
}

export default App
