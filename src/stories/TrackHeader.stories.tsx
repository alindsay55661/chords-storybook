import type { Meta, StoryObj } from '@storybook/react'
import TrackHeader from '../components/TrackHeader'

const meta: Meta<typeof TrackHeader> = {
  title: 'TrackHeader',
  component: TrackHeader,
}

export default meta
type Story = StoryObj<typeof TrackHeader>

export const Small: Story = {
  args: {
    height: 64,
    name: 'Small Track',
  },
  render: args => {
    return <TrackHeader {...args} />
  },
}

export const Medium: Story = {
  args: {
    height: 128,
    name: 'Medium Track',
  },
  render: args => {
    return <TrackHeader {...args} />
  },
}

export const Large: Story = {
  args: {
    height: 256,
    name: 'Large Track',
  },
  render: args => {
    return <TrackHeader {...args} />
  },
}
