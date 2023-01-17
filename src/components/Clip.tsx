import { memo } from 'react'
import type { Note } from '../utils/parse'

export type ClipProps = {
  startTicks: number
  durationTicks: number
  notes: Note[]
  lowestNote?: number
  highestNote?: number
  name?: string
  onNoteClick?: (note: Note) => void
}

function Clip({
  notes = [],
  startTicks = 0,
  durationTicks = 0,
  lowestNote = 0,
  highestNote = 127,
  onNoteClick,
}: ClipProps) {
  const height = highestNote - lowestNote + 1

  function handleNotesClick(e: any) {
    const id = e.target.dataset.noteid
    if (id && onNoteClick)
      onNoteClick(notes.find(note => note.id === id) as Note)
  }

  return (
    <div className="clip flex h-full flex-col rounded border-2 border-sky-100 bg-sky-50">
      <div className="clip-title flex-shrink-0 bg-sky-100 py-0.5 px-1 text-sky-800"></div>
      <div className="clip-notes flex-grow py-2">
        <svg
          viewBox={`${startTicks} 0 ${durationTicks} ${height}`}
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          onClick={handleNotesClick}
        >
          {notes.map(note => {
            return (
              <rect
                data-noteid={note.id}
                data-testid={note.id}
                key={note.id}
                width={note.durationTicks}
                height="1"
                x={note.startTicks}
                y={highestNote - note.noteNumber}
                style={{
                  fill: `${
                    note.midiChannel === 9 || note.midiChannel === 10
                      ? 'hsla(200, 48%, 29%, 0.3)'
                      : 'hsla(200, 98%, 29%, 1)'
                  }`,
                }}
                className="fill-sky-800"
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default memo(Clip)
