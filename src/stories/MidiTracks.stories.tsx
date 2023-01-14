import type { Meta, StoryObj } from '@storybook/react'
import { analyzed } from './musicData'
import MidiTracks from '../components/MidiTracks'

const meta: Meta<typeof MidiTracks> = {
  title: 'MidiTracks',
  component: MidiTracks,
  args: {
    trackHeight: 64,
    zoom: 10,
  },
}

export default meta
type Story = StoryObj<typeof MidiTracks>

export const SingleTrack: Story = {
  args: {
    tracks: analyzed.twoBar.tracks,
    timings: analyzed.twoBar.timings,
    zoom: 100,
  },
  render: args => {
    return <MidiTracks {...args} />
  },
}

export const MultiTrack: Story = {
  args: {
    tracks: analyzed.ghostBusters.tracks,
    timings: analyzed.ghostBusters.timings,
  },
  render: args => {
    return <MidiTracks {...args} />
  },
}

export const Complex: Story = {
  args: {
    tracks: analyzed.takeFive.tracks,
    timings: analyzed.takeFive.timings,
  },
  render: args => {
    return <MidiTracks {...args} />
  },
}
