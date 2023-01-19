import type { Meta, StoryObj } from '@storybook/react'
import { songs } from './musicData'
import TimeSignatureMarkers from '../components/TimeSignatureMarkers'

const meta: Meta<typeof TimeSignatureMarkers> = {
  title: 'TimeSignatureMarkers',
  args: {
    song: songs.chordTest,
    songWidth: 1500,
    sidebarWidth: 100,
  },
  component: TimeSignatureMarkers,
}

export default meta
type Story = StoryObj<typeof TimeSignatureMarkers>

export const Basic: Story = {
  args: {
    song: songs.twoBar,
    songWidth: 500,
  },
  render: args => {
    return <TimeSignatureMarkers {...args} />
  },
}

export const MultipleTimeSignatures: Story = {
  args: {},
  render: args => {
    return <TimeSignatureMarkers {...args} />
  },
}

export const ZoomedIn: Story = {
  args: {
    songWidth: 4000,
  },
  render: args => {
    return <TimeSignatureMarkers {...args} />
  },
}

export const ZoomedOut: Story = {
  args: {
    songWidth: 600,
  },
  render: args => {
    return <TimeSignatureMarkers {...args} />
  },
}

export const LargeSidebar: Story = {
  args: {
    songWidth: 500,
    sidebarWidth: 200,
  },
  render: args => {
    return <TimeSignatureMarkers {...args} />
  },
}
