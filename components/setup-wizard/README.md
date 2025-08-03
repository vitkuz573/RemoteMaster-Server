# Setup Wizard Components

This directory contains the modular setup wizard components that were extracted from the original large `setup-wizard.tsx` file.

## Structure

The setup wizard has been broken down into the following components:

### Core Components

- **`setup-wizard.tsx`** - Main orchestrator component that manages state and coordinates all steps
- **`types.ts`** - TypeScript interfaces and types used across all components

### Step Components

- **`organization-step.tsx`** - Organization details form (name, domain, industry, size, description)
- **`contact-step.tsx`** - Contact information form (name, email, phone, address, expected users)
- **`pricing-step.tsx`** - Pricing plan selection with cost calculation
- **`byoid-step.tsx`** - OpenID Connect configuration (optional step)
- **`complete-step.tsx`** - Setup completion screen with login credentials

### UI Components

- **`progress-indicator.tsx`** - Progress bar and step indicators
- **`navigation-buttons.tsx`** - Back/Next navigation buttons
- **`loading-error-states.tsx`** - Loading and error state handling

### Exports

- **`index.ts`** - Barrel export file for easy importing

## Usage

```tsx
import { SetupWizard } from '@/components/setup-wizard';

export default function SetupPage() {
  return <SetupWizard />;
}
```

## Benefits of This Structure

1. **Maintainability** - Each component has a single responsibility
2. **Reusability** - Individual step components can be reused elsewhere
3. **Testability** - Each component can be tested in isolation
4. **Readability** - Much easier to understand and navigate the code
5. **Performance** - Better code splitting and lazy loading opportunities

## File Sizes

- Original file: ~50KB (1098 lines)
- New structure: 11 files, each focused on a specific concern
  - Largest file: `setup-wizard.tsx` (~13KB) - Main orchestrator
  - Smallest files: ~1-2KB each for focused components

## State Management

The main `SetupWizard` component manages all state and passes it down to child components via props. This keeps the state centralized while allowing components to be pure and focused.

## Future Improvements

- Consider extracting form validation logic into custom hooks
- Add unit tests for each component
- Implement proper error boundaries
- Add accessibility improvements
- Consider using React Context for deeper state sharing if needed 