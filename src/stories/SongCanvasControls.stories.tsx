import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fireEvent, userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { SongCanvasOptions } from '../components/SongCanvas'
import SongCanvasControls from '../components/SongCanvasControls'

const meta: Meta<typeof SongCanvasControls> = {
  title: 'SongCanvasControls',
  args: {
    options: {
      zoom: 130,
      trackHeight: 128,
      chordDetectUnit: 'beat',
    },
  },
  decorators: [
    (Story, context) => {
      const [options, setOptions] = useState(
        context.args.options as SongCanvasOptions,
      )

      context.args = { ...context.args, options, setOptions }
      return (
        <>
          <Story />
          <div className="mt-8 bg-slate-100 p-4">
            <h1 className="font-bold">Output values</h1>
            <div data-testid="zoom-output">{options.zoom}</div>
            <div data-testid="trackheight-output">{options.trackHeight}</div>
            <div data-testid="chorddetectunit-output">
              {options.chordDetectUnit}
            </div>
          </div>
        </>
      )
    },
  ],
  component: SongCanvasControls,
}

export default meta
type Story = StoryObj<typeof SongCanvasControls>

export const Basic: Story = {
  args: {},
  render: args => {
    return <SongCanvasControls {...args} />
  },
}

export const OnChange: Story = {
  args: {},
  render: args => {
    return <SongCanvasControls {...args} />
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement)
    const [zoomEl, trackHeightEl] = canvas.getAllByRole('slider')
    // From the component
    const zoomRange = [2, 200]

    await step(
      'Ensure zoom range control works and conforms to range boundaries',
      async () => {
        expect(canvas.getByTestId('zoom-output')).toHaveTextContent(
          `${args.options.zoom}`,
        )
        await fireEvent.change(zoomEl, { target: { value: 20 } })
        expect(canvas.getByTestId('zoom-output')).toHaveTextContent('20')

        await fireEvent.change(zoomEl, { target: { value: -10 } })
        expect(canvas.getByTestId('zoom-output')).toHaveTextContent(
          `${zoomRange[0]}`,
        )
        await fireEvent.change(zoomEl, { target: { value: 600 } })
        expect(canvas.getByTestId('zoom-output')).toHaveTextContent(
          `${zoomRange[1]}`,
        )
      },
    )

    // From the component
    const trackHeightRange = [48, 256]

    await step(
      'Ensure zoom range control works and conforms to range boundaries',
      async () => {
        expect(canvas.getByTestId('trackheight-output')).toHaveTextContent(
          `${args.options.trackHeight}`,
        )

        await fireEvent.change(trackHeightEl, { target: { value: 200 } })
        expect(canvas.getByTestId('trackheight-output')).toHaveTextContent(
          '200',
        )
        await fireEvent.change(trackHeightEl, { target: { value: -10 } })
        expect(canvas.getByTestId('trackheight-output')).toHaveTextContent(
          `${trackHeightRange[0]}`,
        )
        await fireEvent.change(trackHeightEl, { target: { value: 600 } })
        expect(canvas.getByTestId('trackheight-output')).toHaveTextContent(
          `${trackHeightRange[1]}`,
        )
      },
    )

    const [barEl, beatEl] = canvas.getAllByRole('radio')

    await step('Ensure chord detection option works', async () => {
      expect(canvas.getByTestId('chorddetectunit-output')).toHaveTextContent(
        `${args.options.chordDetectUnit}`,
      )
      await userEvent.click(barEl)
      expect(canvas.getByTestId('chorddetectunit-output')).toHaveTextContent(
        'bar',
      )
      await userEvent.click(beatEl)
      expect(canvas.getByTestId('chorddetectunit-output')).toHaveTextContent(
        'beat',
      )
    })
  },
}
