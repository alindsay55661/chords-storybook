import { useState } from 'react'
import './App.css'
import MidiTracks from './components/MidiTracks'
import { analyzed as data } from './stories/musicData'

function App() {
  const [zoom, setZoom] = useState(20)
  const song = data.takeFive
  // const song = data.ghostBusters
  // const song = data.timeSigs

  return (
    <div>
      <h1>Perf test</h1>
      <input
        type="range"
        min="1"
        max="100"
        value={zoom}
        onChange={e => {
          setZoom(Number(e.target.value))
        }}
      ></input>
      <MidiTracks
        song={song}
        zoom={zoom}
        trackHeight={84}
        maxHeight="400px"
      />
    </div>
  )
}

export default App
