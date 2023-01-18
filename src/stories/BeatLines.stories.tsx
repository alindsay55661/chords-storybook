import type { Meta, StoryObj } from '@storybook/react'
import { analyzed } from './musicData'
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
    timings: analyzed.twoBar.timings,
    bars: analyzed.twoBar.notes.byBar,
    width: analyzed.twoBar.timings.durationTicks / 10,
  },
  render: args => {
    return <BeatLines {...args} />
  },
}

export const MultiTrack: Story = {
  args: {
    timings: analyzed.ghostBusters.timings,
    bars: analyzed.ghostBusters.notes.byBar,
    width: analyzed.ghostBusters.timings.durationTicks / 10,
  },
  render: args => {
    return <BeatLines {...args} />
  },
}

export const MultipleTimeSignatures: Story = {
  args: {
    timings: analyzed.chordTest.timings,
    bars: analyzed.chordTest.notes.byBar,
    width: analyzed.chordTest.timings.durationTicks / 10,
  },
  render: args => {
    return <BeatLines {...args} />
  },
}
