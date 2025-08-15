import type { Meta, StoryObj } from '@storybook/react'
import { LoadingSpinner } from './loading-spinner'

const meta = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  args: { size: 'md', text: 'Loading...' },
} satisfies Meta<typeof LoadingSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Large: Story = { args: { size: 'lg' } }
export const WithText: Story = { args: { text: 'Fetching data…' } }

