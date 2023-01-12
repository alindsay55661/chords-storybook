import type { Note } from '../utils/parse'

type ClipNote = Pick<
  Note,
  'noteNumber' | 'startTicks' | 'durationTicks' | 'uuid'
>
export type ClipProps = {
  startTicks: number
  durationTicks: number
  lowestNote?: number
  highestNote?: number
  notes?: Note[]
  name?: string
  onNoteClick?: (note: Note) => void
}

export default function Clip({
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
    console.log(e)
    const id = e.target.dataset.noteid
    if (id && onNoteClick)
      onNoteClick(notes.find(note => note.uuid === id) as Note)
  }

  return (
    <div className="clip bg-sky-800 rounded border-2 border-sky-600">
      <div className="clip-title bg-sky-600 py-0.5 px-1 text-white">{name}</div>
      <div className="clip-notes h-36 py-4">
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
                data-noteid={note.uuid}
                key={note.uuid}
                width={note.durationTicks}
                height="1"
                fill="hsla(0, 100%, 100%, 0.7)"
                x={note.startTicks}
                y={highestNote - note.noteNumber}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}
