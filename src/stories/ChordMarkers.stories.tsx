import type { Meta, StoryObj } from '@storybook/react'
import { analyzed } from './musicData'
import ChordMarkers from '../components/ChordMarkers'

const meta: Meta<typeof ChordMarkers> = {
  title: 'ChordMarkers',
  args: {
    song: analyzed.chordTest,
    songWidth: 1500,
    sidebarWidth: 100,
    detectUnit: 'bar',
  },
  component: ChordMarkers,
}

export default meta
type Story = StoryObj<typeof ChordMarkers>

export const Basic: Story = {
  args: {
    song: analyzed.twoBar,
    songWidth: 500,
  },
  render: args => {
    return <ChordMarkers {...args} />
  },
}

export const MultipleTimeSignatures: Story = {
  args: {},
  render: args => {
    return <ChordMarkers {...args} />
  },
}

export const ZoomedIn: Story = {
  args: {
    songWidth: 4000,
  },
  render: args => {
    return <ChordMarkers {...args} />
  },
}

export const ZoomedOut: Story = {
  args: {
    songWidth: 600,
  },
  render: args => {
    return <ChordMarkers {...args} />
  },
}

export const LargeSidebar: Story = {
  args: {
    songWidth: 500,
    sidebarWidth: 200,
  },
  render: args => {
    return <ChordMarkers {...args} />
  },
}

export const BarDetection: Story = {
  args: {
    songWidth: 2000,
    detectUnit: 'bar',
  },
  render: args => {
    return <ChordMarkers {...args} />
  },
}

export const BeatDetection: Story = {
  args: {
    songWidth: 2000,
    detectUnit: 'beat',
  },
  render: args => {
    return <ChordMarkers {...args} />
  },
}
