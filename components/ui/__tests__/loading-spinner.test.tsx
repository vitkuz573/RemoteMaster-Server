import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders custom text when provided', () => {
    render(<LoadingSpinner text="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })
})
