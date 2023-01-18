import type { Meta, StoryObj } from '@storybook/react'
import { analyzed } from './musicData'
import SongCanvas from '../components/SongCanvas'

const meta: Meta<typeof SongCanvas> = {
  title: 'Compound/SongCanvas',
  component: SongCanvas,
  args: {
    song: analyzed.chordTest,
    trackHeight: 64,
    zoom: 100,
    maxHeight: '300px',
    chordDetectUnit: 'beat',
  },
}

export default meta
type Story = StoryObj<typeof SongCanvas>

export const Basic: Story = {
  args: {
    song: analyzed.twoBar,
  },
  render: args => {
    return <SongCanvas {...args} />
  },
}

export const MultiTrack: Story = {
  args: {
    song: analyzed.ghostBusters,
    zoom: 10,
  },
  render: args => {
    return <SongCanvas {...args} />
  },
}

export const Complex: Story = {
  args: {},
  render: args => {
    return <SongCanvas {...args} />
  },
}

export const TallTracks: Story = {
  args: {
    song: analyzed.takeFive,
    trackHeight: 150,
    zoom: 10,
  },
  render: args => {
    return <SongCanvas {...args} />
  },
}

export const SmallTracks: Story = {
  args: {
    song: analyzed.takeFive,
    trackHeight: 40,
    zoom: 10,
  },
  render: args => {
    return <SongCanvas {...args} />
  },
}

export const TallCanvas: Story = {
  args: {
    song: analyzed.takeFive,
    trackHeight: 150,
    zoom: 10,
    maxHeight: '5000px',
  },
  render: args => {
    return <SongCanvas {...args} />
  },
}
