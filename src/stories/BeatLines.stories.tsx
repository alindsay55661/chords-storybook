import type { Meta, StoryObj } from '@storybook/react'
import { analyzed } from './musicData'
// import BeatLines from '../components/BeatLines'
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

export const SingleTrack: Story = {
  args: {
    timings: analyzed.twoBar.timings,
    width: analyzed.twoBar.timings.durationTicks / 10 + 'px',
  },
  render: args => {
    return <BeatLines {...args} />
  },
}

export const MultiTrack: Story = {
  args: {
    timings: analyzed.ghostBusters.timings,
    width: analyzed.ghostBusters.timings.durationTicks / 10 + 'px',
  },
  render: args => {
    return <BeatLines {...args} />
  },
}

export const Complex: Story = {
  args: {
    timings: analyzed.takeFive.timings,
    width: analyzed.takeFive.timings.durationTicks / 10 + 'px',
  },
  render: args => {
    return <BeatLines {...args} />
  },
}
