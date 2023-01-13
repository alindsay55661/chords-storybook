import type { Note } from '../utils/parse'

type ClipNote = Pick<
  Note,
  'noteNumber' | 'startTicks' | 'durationTicks' | 'uuid'
>
export type ClipProps = {
  startTicks: number
  durationTicks: number
  notes: Note[]
  lowestNote?: number
  highestNote?: number
  name?: string
  onNoteClick?: (note: Note) => void
  className?: string
}

export default function Clip({
  notes = [],
  startTicks = 0,
  durationTicks = 0,
  lowestNote = 0,
  highestNote = 127,
  name = 'clip',
  onNoteClick,
  className,
}: ClipProps) {
  const height = highestNote - lowestNote + 1

  function handleNotesClick(e: any) {
    const id = e.target.dataset.noteid
    if (id && onNoteClick)
      onNoteClick(notes.find(note => note.uuid === id) as Note)
  }

  return (
    <div
      className={`clip bg-sky-800 rounded border-2 border-sky-600 flex flex-col ${className} h-full`}
    >
      <div className="clip-title bg-sky-600 py-0.5 px-1 text-white flex-shrink-0">
        {name}
      </div>
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
                data-noteid={note.uuid}
                data-testid={note.uuid}
                key={note.uuid}
                width={note.durationTicks}
                height="1"
                fill="hsla(0, 100%, 100%, 0.7)"
                x={note.startTicks}
                y={highestNote - note.noteNumber}
                className="hover:outline-4 hover:outline-sky-900 hover:fill-slate-100 hover:drop-shadow"
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}
