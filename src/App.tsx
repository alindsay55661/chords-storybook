import { useState } from 'react'
import Dropzone from 'react-dropzone'
import './App.css'
import MidiTracks from './components/MidiTracks'
import { analyzed as data } from './stories/musicData'
import { analyze } from './utils/analyze'
import { parseMidi } from './utils/parse'

function App() {
  const [zoom, setZoom] = useState(20)
  const [trackHeight, setTrackHeight] = useState(128)
  const [song, setSong] = useState(data.chordTest)

  function handleDroppedFiles(files: File[]) {
    files.forEach(file => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        // Do whatever you want with the file contents
        if (reader.result) {
          const result = reader.result as ArrayBufferLike
          const song = analyze(parseMidi(new Uint8Array(result)))
          setSong(song)
        }
      }
      reader.readAsArrayBuffer(file)
    })
  }

  return (
    <div>
      <Dropzone
        onDrop={handleDroppedFiles}
        maxFiles={1}
      >
        {({ getRootProps, getInputProps }) => (
          <section>
            <div
              className="bg-slate-200 p-8"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <p>
                Drag 'n' drop a <span className="font-bold">".mid"</span> files
                here, or click to select files
              </p>
            </div>
          </section>
        )}
      </Dropzone>
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
