import Tonal from 'tonal'

export function detectScales(presence: Record<string, number>) {
  // order by prominence
  const notes = Object.entries(presence)
    .map(entry => {
      return { name: entry[0], presence: entry[1] }
    })
    .sort((a, b) => {
      if (a.presence > b.presence) return -1
      if (a.presence < b.presence) return 1
      return 0
    })

  const scaleNotes = Tonal.Scale.scaleNotes(notes.map(note => note.name))

  // Get distance from C
  const interval = Tonal.Interval.distance(scaleNotes[0], 'C')
  const transposed = scaleNotes.map(Tonal.Note.transposeBy(interval))
  const pcset = Tonal.Pcset.get(transposed)

  // Filter scales that include these intervals
  // https://github.com/tonaljs/tonal/blob/main/packages/chord/index.ts#L197
  const areNotesIncluded = Tonal.Pcset.isSupersetOf(pcset.chroma)
  const scales = Tonal.ScaleType.all().filter(scale =>
    areNotesIncluded(scale.chroma),
  )

  const keyScales = scales.map(scale => {
    return Tonal.Scale.get(`${scaleNotes[0]} ${scale.name}`)
  })

  return keyScales
}
