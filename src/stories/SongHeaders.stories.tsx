import type { Meta, StoryObj } from '@storybook/react'
import { analyzed } from './musicData'
import SongHeaders from '../components/SongHeaders'

const meta: Meta<typeof SongHeaders> = {
  title: 'Compound/SongHeaders',
  args: {
    song: analyzed.chordTest,
    songWidth: 1500,
    sidebarWidth: 100,
    visible: true,
    chordDetectUnit: 'bar',
  },
  component: SongHeaders,
}

export default meta
type Story = StoryObj<typeof SongHeaders>

export const Basic: Story = {
  args: {
    song: analyzed.twoBar,
    songWidth: 500,
  },
  render: args => {
    return <SongHeaders {...args} />
  },
}

export const MultipleTimeSignatures: Story = {
  args: {},
  render: args => {
    return <SongHeaders {...args} />
  },
}

export const ZoomedIn: Story = {
  args: {
    songWidth: 4000,
  },
  render: args => {
    return <SongHeaders {...args} />
  },
}

export const ZoomedOut: Story = {
  args: {
    songWidth: 500,
  },
  render: args => {
    return <SongHeaders {...args} />
  },
}

export const LargeSidebar: Story = {
  args: {
    songWidth: 500,
    sidebarWidth: 200,
  },
  render: args => {
    return <SongHeaders {...args} />
  },
}

export const BarDetection: Story = {
  args: {
    songWidth: 2000,
    chordDetectUnit: 'bar',
  },
  render: args => {
    return <SongHeaders {...args} />
  },
}

export const BeatDetection: Story = {
  args: {
    songWidth: 2000,
    chordDetectUnit: 'beat',
  },
  render: args => {
    return <SongHeaders {...args} />
  },
}

export const Invisible: Story = {
  args: {
    visible: false,
  },
  render: args => {
    return <SongHeaders {...args} />
  },
}
