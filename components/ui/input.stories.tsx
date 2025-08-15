import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  args: { placeholder: 'Type here...' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {}
export const Password: Story = { args: { type: 'password', placeholder: '••••••••' } }
export const Disabled: Story = { args: { disabled: true, placeholder: 'Disabled' } }

