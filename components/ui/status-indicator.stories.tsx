import type { Meta, StoryObj } from '@storybook/react'
import { StatusIndicator } from './status-indicator'

const meta = {
  title: 'UI/StatusIndicator',
  component: StatusIndicator,
  args: { status: 'online', showText: true, size: 'md' },
  argTypes: {
    status: { control: 'radio', options: ['online', 'offline', 'warning', 'error', 'unknown'] },
  },
} satisfies Meta<typeof StatusIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Online: Story = { args: { status: 'online' } }
export const Offline: Story = { args: { status: 'offline' } }
export const Warning: Story = { args: { status: 'warning' } }
export const Error: Story = { args: { status: 'error' } }
export const Unknown: Story = { args: { status: 'unknown' } }

