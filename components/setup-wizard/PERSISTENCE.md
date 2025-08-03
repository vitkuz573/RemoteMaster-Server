# Setup Wizard State Persistence

## Overview

The setup wizard now automatically saves and restores its state across page refreshes using localStorage. This ensures that users don't lose their progress if they accidentally refresh the page or navigate away.

## Features

### Automatic State Persistence
- **Current Step**: Saves which step the user is currently on
- **Form Data**: Persists all organization and BYOID form data
- **UI State**: Saves loading states, submission states, and calculated values
- **Cross-Session**: State persists even after browser restart

### State Management
- **Custom Hook**: `useSetupWizardState` manages all persistence logic
- **Automatic Sync**: State is automatically saved whenever it changes
- **Error Handling**: Graceful fallback if localStorage is unavailable
- **Type Safety**: Full TypeScript support for all persisted data

### User Controls
- **Reset Button**: Users can reset the wizard to start over
- **Auto-Clear**: State is automatically cleared after successful completion
- **Manual Reset**: Developers can programmatically reset state

## Implementation Details

### Storage Keys
All setup wizard data is stored with the following keys:
- `setup-wizard-current-step`: Current wizard step
- `setup-wizard-org-form`: Organization form data
- `setup-wizard-byoid-form`: BYOID configuration data
- `setup-wizard-total-monthly`: Calculated monthly cost
- `setup-wizard-is-submitting`: Submission state
- `setup-wizard-is-discovering`: Discovery state

### Custom Hook Usage
```typescript
const {
  currentStep,
  setCurrentStep,
  orgForm,
  setOrgForm,
  byoidForm,
  setByoidForm,
  totalMonthly,
  setTotalMonthly,
  isSubmitting,
  setIsSubmitting,
  isDiscovering,
  setIsDiscovering,
  clearSetupWizardState,
  resetSetupWizardState
} = useSetupWizardState();
```

### State Lifecycle
1. **Initialization**: State is loaded from localStorage on component mount
2. **Updates**: Any state change automatically triggers localStorage save
3. **Completion**: State is cleared after successful organization registration
4. **Reset**: Users can manually reset to start over

## Development Tools

### Debug Panel
In development mode, a debug panel is available to:
- View current localStorage state
- Clear all setup wizard data
- Monitor state changes in real-time

### Reset Functionality
- **User Reset**: Button in navigation to reset wizard
- **Programmatic Reset**: `resetSetupWizardState()` function
- **Clear Storage**: `clearSetupWizardState()` function

## Error Handling

The persistence system includes robust error handling:
- **localStorage Unavailable**: Graceful fallback to default values
- **Corrupted Data**: Automatic reset to safe defaults
- **Storage Quota**: Warning messages for storage issues
- **JSON Parsing**: Safe parsing with error recovery

## Browser Compatibility

- **Modern Browsers**: Full support for localStorage
- **Private Mode**: Limited support (data may not persist)
- **Mobile Browsers**: Full support with automatic cleanup
- **Legacy Browsers**: Graceful degradation

## Best Practices

1. **Always use the custom hook** for state management
2. **Don't manually manipulate localStorage** keys
3. **Test persistence** across page refreshes
4. **Handle edge cases** like private browsing
5. **Clear state** after successful completion

## Troubleshooting

### Common Issues
- **State not persisting**: Check if localStorage is available
- **Corrupted data**: Use reset functionality
- **Storage quota exceeded**: Clear old data manually

### Debug Steps
1. Open browser dev tools
2. Check localStorage in Application tab
3. Look for setup-wizard-* keys
4. Verify data format and content
5. Use debug panel if available 