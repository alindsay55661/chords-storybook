import { useState } from 'react'
import './App.css'
import FileSelector from './components/FileSelector'
import SongCanvas, { SongCanvasOptions } from './components/SongCanvas'
import SongCanvasControls from './components/SongCanvasControls'
import { analyzed as data } from './stories/musicData'
import { Song } from './utils/analyze'

function App() {
  const [song, setSong] = useState<Song>(data.chordTest)
  const [options, setOptions] = useState<SongCanvasOptions>({
    zoom: 130,
    trackHeight: 128,
    chordDetectUnit: 'beat',
  })

  return (
    <div>
      <FileSelector setSong={setSong} />

      <SongCanvasControls
        options={options}
        setOptions={setOptions}
      />

      <SongCanvas
        song={song}
        chordDetectUnit={options.chordDetectUnit}
        zoom={options.zoom}
        trackHeight={options.trackHeight}
        maxHeight="500px"
      />
    </div>
  )
}

export default App
