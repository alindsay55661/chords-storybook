import { Dispatch } from 'react'
import Dropzone from 'react-dropzone'
import { analyze, Song } from '../utils/analyze'
import { parseMidi } from '../utils/parse'

type FileSelectorProps = {
  setSong: Dispatch<Song>
}

export default function FileSelector({ setSong }: FileSelectorProps) {
  function handleDroppedFiles(files: File[]) {
    files.forEach(file => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
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
    <>
      <h1 className="mb-5 text-xl">
        Try out midi files from{' '}
        <a
          className="text-sky-800 underline"
          target="_blank"
          href="https://www.midis101.com/search/Coldplay"
        >
          https://www.midis101.com/
        </a>
      </h1>
      <Dropzone
        onDrop={handleDroppedFiles}
        maxFiles={1}
        accept={{
          'audio/midi': ['.mid', '.midi'],
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <section>
            <div
              className="cursor-pointer rounded border-2 border-dashed border-slate-300 bg-slate-100 p-8"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <p>
                Drag 'n' drop a <span className="font-bold">".mid"</span> file
                here, or click to select files
              </p>
            </div>
          </section>
        )}
      </Dropzone>
    </>
  )
}
