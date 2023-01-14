import { useState } from 'react'
import './App.css'
import MidiTracks from './components/MidiTracks'
import { analyzed } from './stories/musicData'

function App() {
  const [zoom, setZoom] = useState(10)
  const { timings, timeSignatures, tracks } = analyzed.takeFive

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
        tracks={tracks}
        timings={timings}
        timeSignatures={timeSignatures}
        zoom={zoom}
        trackHeight={64}
      />
    </div>
  )
}

export default App
