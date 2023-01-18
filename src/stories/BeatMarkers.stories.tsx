import type { Meta, StoryObj } from '@storybook/react'
import { analyzed } from './musicData'
import BeatMarkers from '../components/BeatMarkers'

const meta: Meta<typeof BeatMarkers> = {
  title: 'BeatMarkers',
  args: {
    song: analyzed.chordTest,
    songWidth: 1500,
    sidebarWidth: 100,
  },
  component: BeatMarkers,
}

export default meta
type Story = StoryObj<typeof BeatMarkers>

export const Basic: Story = {
  args: {
    song: analyzed.twoBar,
    songWidth: 500,
  },
  render: args => {
    return <BeatMarkers {...args} />
  },
}

export const MultipleTimeSignatures: Story = {
  args: {},
  render: args => {
    return <BeatMarkers {...args} />
  },
}

export const ZoomedIn: Story = {
  args: {
    songWidth: 4000,
  },
  render: args => {
    return <BeatMarkers {...args} />
  },
}

export const ZoomedOut: Story = {
  args: {
    songWidth: 600,
  },
  render: args => {
    return <BeatMarkers {...args} />
  },
}

export const LargeSidebar: Story = {
  args: {
    songWidth: 500,
    sidebarWidth: 200,
  },
  render: args => {
    return <BeatMarkers {...args} />
  },
}
