import type { Meta, StoryObj } from '@storybook/react'
import { Toggle } from './toggle'

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  args: { children: 'Toggle' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline'] },
    size: { control: 'radio', options: ['sm', 'default', 'lg'] },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Off: Story = { args: { pressed: false } }
export const On: Story = { args: { pressed: true } }

