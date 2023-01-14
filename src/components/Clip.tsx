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
  name = 'clip',
  onNoteClick,
}: ClipProps) {
  const height = highestNote - lowestNote + 1

  function handleNotesClick(e: any) {
    const id = e.target.dataset.noteid
    if (id && onNoteClick)
      onNoteClick(notes.find(note => note.id === id) as Note)
  }

  return (
    <div className="clip bg-sky-50 rounded border-2 border-sky-100 flex flex-col h-full">
      <div className="clip-title bg-sky-100 py-0.5 px-1 text-sky-800 flex-shrink-0"></div>
      <div className="clip-notes py-4 flex-grow">
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
                className="fill-sky-800 hover:outline-4 hover:outline-sky-900 hover:fill-slate-100 hover:drop-shadow"
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default memo(Clip)
