// Button.stories.ts|tsx

import type { Meta } from '@storybook/react'

import Clip from '../components/Clip'

const meta: Meta<typeof Clip> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/7.0/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Clip',
  component: Clip,
}

export default meta
