import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { songs } from './musicData'
import { Song } from '../utils/song'
import SongCanvas, { SongCanvasOptions } from '../components/SongCanvas'
import SongCanvasControls from '../components/SongCanvasControls'
import FileSelector from '../components/FileSelector'

type SampleAppProps = {
  appSong: Song
  maxHeight: string
}

function SampleApp({ appSong, maxHeight }: SampleAppProps) {
  const [song, setSong] = useState<Song>(appSong)
  const [options, setOptions] = useState<SongCanvasOptions>({
    zoom: 30,
    trackHeight: 48,
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
        maxHeight={maxHeight}
      />
    </div>
  )
}

const meta: Meta<typeof SampleApp> = {
  title: 'Pages/App',
  component: SampleApp,
  args: {
    appSong: songs.chordTest,
    maxHeight: '300px',
  },
}

export default meta
type Story = StoryObj<typeof SampleApp>

export const Basic: Story = {
  args: {
    appSong: songs.twoBar,
  },
  render: args => {
    return <SampleApp {...args} />
  },
}

export const Complex: Story = {
  args: {
    appSong: songs.takeFive,
  },
  render: args => {
    return <SampleApp {...args} />
  },
}
