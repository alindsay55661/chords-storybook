import type { Meta, StoryObj } from '@storybook/react'
import { songs } from './musicData'
import Track from '../components/Track'

const meta: Meta<typeof Track> = {
  title: 'Track',
  args: {
    track: songs.chordTest.tracks[0],
    songWidth: 1500,
    sidebarWidth: 100,
  },
  component: Track,
}

export default meta
type Story = StoryObj<typeof Track>

export const Basic: Story = {
  args: {
    track: songs.twoBar.tracks[0],
    songWidth: 500,
  },
  render: args => {
    return <Track {...args} />
  },
}

export const MultipleTimeSignatures: Story = {
  args: {},
  render: args => {
    return <Track {...args} />
  },
}

export const ZoomedIn: Story = {
  args: {
    songWidth: 4000,
  },
  render: args => {
    return <Track {...args} />
  },
}

export const ZoomedOut: Story = {
  args: {
    songWidth: 600,
  },
  render: args => {
    return <Track {...args} />
  },
}

export const LargeSidebar: Story = {
  args: {
    songWidth: 500,
    sidebarWidth: 200,
  },
  render: args => {
    return <Track {...args} />
  },
}
