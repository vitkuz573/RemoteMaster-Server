# Toast Notifications in Setup Wizard

## Overview

The setup wizard now uses modern toast notifications from `sonner` instead of browser alerts for a better user experience.

## Implementation

### Toast Notifications
- **Success**: Green notifications for successful operations
- **Error**: Red notifications for errors and failures
- **Info**: Blue notifications for informational messages
- **Warning**: Yellow notifications for warnings

### Replaced Alerts
1. **OpenID Discovery**: 
   - Success: "OpenID Connect provider discovered successfully!"
   - Error: "Failed to discover OpenID Connect provider. Please check the issuer URL."

2. **Organization Setup**:
   - Success: "Organization setup completed successfully!"
   - Error: "Failed to complete organization setup. Please try again."

3. **Validation Errors**:
   - Issuer URL required: "Please enter an issuer URL first"

### Confirmation Dialog
- **Reset Confirmation**: Modern dialog for confirming wizard reset
- **Customizable**: Different variants (danger, success, warning)
- **Accessible**: Proper ARIA labels and keyboard navigation

## Benefits

### User Experience
- **Non-blocking**: Toasts don't interrupt user flow
- **Modern**: Professional appearance with animations
- **Consistent**: Matches the overall design system
- **Accessible**: Screen reader friendly

### Developer Experience
- **Type-safe**: Full TypeScript support
- **Customizable**: Easy to style and configure
- **Reliable**: No browser compatibility issues
- **Maintainable**: Centralized notification system

## Technical Details

### Dependencies
- `sonner`: Modern toast library
- `@/components/ui/sonner`: Custom Toaster component
- `@/components/ui/dialog`: Confirmation dialogs

### Usage
```typescript
import { toast } from 'sonner';

// Success notification
toast.success('Operation completed successfully!');

// Error notification
toast.error('Something went wrong');

// Info notification
toast.info('Please check your input');

// Warning notification
toast.warning('This action cannot be undone');
```

### Configuration
- **Theme**: Automatically adapts to light/dark mode
- **Position**: Top-right by default
- **Duration**: 4 seconds for success, 6 seconds for errors
- **Dismissible**: Users can manually dismiss notifications 