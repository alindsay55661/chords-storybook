import type { Meta, StoryObj } from '@storybook/react'

import Clip, { ClipProps } from '../components/Clip'
import * as data from '../test/midi/2bar.mid.json'
import { analyze } from '../utils/analyze'

const analyzed = analyze(data)

const meta: Meta<typeof Clip> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/7.0/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Clip',
  component: Clip,
}

export default meta
type Story = StoryObj<typeof Clip>

export const Sample: Story = {
  args: {
    ...analyzed.tracks[0],
    startTicks: 0,
    onNoteClick: note => {
      console.log('NOTE FOUND!')
      console.log(note)
    },
  },
  render: args => {
    return <Clip {...args} />
  },
}
