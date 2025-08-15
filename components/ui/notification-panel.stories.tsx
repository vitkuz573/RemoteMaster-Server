import type { Meta, StoryObj } from '@storybook/react'
import { NotificationPanel } from './notification-panel'

const sample = [
  { id: '1', title: 'Backup completed', message: 'Nightly backup finished successfully', time: '09:15', type: 'success' as const },
  { id: '2', title: 'High load', message: 'Server cpu-01 is under high load', time: '09:20', type: 'warning' as const },
  { id: '3', title: 'New version', message: 'A new release is available', time: '09:30', type: 'info' as const },
]

const meta = {
  title: 'UI/NotificationPanel',
  component: NotificationPanel,
  args: {
    notifications: sample,
    enabled: true,
    count: sample.length,
    onToggleEnabled: () => void 0,
  },
} satisfies Meta<typeof NotificationPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Enabled: Story = {}
export const Disabled: Story = { args: { enabled: false } }

