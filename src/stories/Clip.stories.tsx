import type { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { useState } from 'react'
import { songs } from './musicData'
import Clip from '../components/Clip'

const meta: Meta<typeof Clip> = {
  title: 'Clip',
  args: {
    ...songs.twoBar.tracks[0],
  },
  component: Clip,
  decorators: [
    Story => (
      <div style={{ height: '128px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Clip>

export const Basic: Story = {
  args: {
    startTicks: 0,
  },
  render: args => {
    return <Clip {...args} />
  },
}

export const Complex: Story = {
  args: {
    startTicks: 0,
    ...songs.chordTest.tracks[0],
  },
  render: args => {
    return <Clip {...args} />
  },
}

export const SmallContainer: Story = {
  args: {
    startTicks: 0,
  },
  decorators: [
    Story => (
      <div style={{ height: '48px', width: '200px' }}>
        <Story />
      </div>
    ),
  ],
  render: args => {
    return <Clip {...args} />
  },
}

export const onNoteClick: Story = {
  args: {
    startTicks: 0,
  },
  decorators: [
    (Story, context) => {
      const [note, setNote] = useState({ id: '' })
      const onNoteClick = (n: any) => {
        setNote(n)
      }
      context.args = { ...context.args, onNoteClick }
      return (
        <>
          <Story />
          <div
            data-testid="output"
            style={{ visibility: 'hidden' }}
          >
            {note.id}
          </div>
        </>
      )
    },
  ],
  render: args => {
    return <Clip {...args} />
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const note = args.notes[0]
    const noteEl = canvas.getByTestId(note.id)

    await step('Ensure the note is returned onClick', async () => {
      await userEvent.click(noteEl)
      expect(canvas.getByTestId('output')).toHaveTextContent(note.id)
    })
  },
}
