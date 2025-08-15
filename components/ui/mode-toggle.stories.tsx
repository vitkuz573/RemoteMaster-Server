import type { Meta, StoryObj } from '@storybook/react'
import { ModeToggle } from './mode-toggle'
import { useState } from 'react'

const modes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
]

function Demo() {
  const [value, setValue] = useState('light')
  return <ModeToggle modes={modes} value={value} onValueChange={setValue} />
}

const meta = {
  title: 'UI/ModeToggle',
  component: Demo,
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

