import { useState } from 'react'
import { detectChords } from './utils/chords'
import './App.css'
import MidiTracks from './components/MidiTracks'
import { analyzed as data } from './stories/musicData'

function App() {
  const [zoom, setZoom] = useState(20)
  const [trackHeight, setTrackHeight] = useState(128)
  // const song = data.takeFive
  // const song = data.ghostBusters
  const song = data.chordTest

  return (
    <div>
      <label className="inline-block p-4">
        <span className="pr-2">Track Width</span>
        <input
          type="range"
          min="1"
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
      <MidiTracks
        song={song}
        chordDetectUnit="beat"
        zoom={zoom}
        trackHeight={trackHeight}
        maxHeight="400px"
      />
    </div>
  )
}

export default App
