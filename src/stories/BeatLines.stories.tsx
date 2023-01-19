import type { Meta, StoryObj } from '@storybook/react'
import { songs } from './musicData'
import BeatLines from '../components/BeatLines'

const meta: Meta<typeof BeatLines> = {
  title: 'BeatLines',
  component: BeatLines,
  args: {},
  decorators: [
    Story => (
      <div style={{ height: '200px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof BeatLines>

export const Basic: Story = {
  args: {
    timings: songs.twoBar.timings,
    bars: songs.twoBar.notes.byBar,
    width: songs.twoBar.timings.durationTicks / 10,
  },
  render: args => {
    return <BeatLines {...args} />
  },
}

export const MultiTrack: Story = {
  args: {
    timings: songs.ghostBusters.timings,
    bars: songs.ghostBusters.notes.byBar,
    width: songs.ghostBusters.timings.durationTicks / 10,
  },
  render: args => {
    return <BeatLines {...args} />
  },
}

export const MultipleTimeSignatures: Story = {
  args: {
    timings: songs.chordTest.timings,
    bars: songs.chordTest.notes.byBar,
    width: songs.chordTest.timings.durationTicks / 10,
  },
  render: args => {
    return <BeatLines {...args} />
  },
}
