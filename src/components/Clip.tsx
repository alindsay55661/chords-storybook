import type { Note } from '../utils/parse'

type ClipNote = Pick<
  Note,
  'noteNumber' | 'startTicks' | 'durationTicks' | 'uuid'
>
type ClipProps = {
  startTicks: number
  durationTicks: number
  lowestNote?: number
  highestNote?: number
  notes?: ClipNote[]
}

export default function Clip({
  notes = [],
  startTicks = 0,
  durationTicks = 0,
  lowestNote = 0,
  highestNote = 127,
}: ClipProps) {
  const height = 175
  const titleHeight = 30
  const verticalMargin = 20
  const verticalNoteRange = highestNote - lowestNote
  const verticalNoteArea = height - verticalMargin * 2 - titleHeight
  const noteHeight = verticalNoteArea / verticalNoteRange

  return (
    <svg
      viewBox={`0 0 ${durationTicks} 100`}
      preserveAspectRatio="none"
      style={{ borderRadius: '6px' }}
      width="100%"
      height={height}
    >
      <rect
        width="100%"
        height="100%"
        fill="hsla(326, 100%, 16%, 0.8)"
        rx={6}
      />
      <rect
        width="100%"
        height="100%"
        fill="none"
        stroke="hsla(326, 100%, 30%, 1)"
        strokeWidth={5}
        rx={6}
      />
      <rect
        width="100%"
        height={titleHeight}
        fill="hsla(326, 100%, 30%, 1)"
        rx={6}
        className="drag-handle"
      />
      <rect
        width="100%"
        height="10"
        y={titleHeight - 10}
        fill="hsla(326, 100%, 30%, 1)"
        className="drag-handle"
      />

      {notes.map(note => {
        return (
          <rect
            key={note.uuid}
            width={durationTicks}
            height={noteHeight}
            fill="hsla(326, 100%, 90%, 0.7)"
            x={note.startTicks - startTicks}
            y={
              (highestNote - note.noteNumber) * noteHeight +
              verticalMargin +
              titleHeight
            }
          />
        )
      })}
    </svg>
  )
}
