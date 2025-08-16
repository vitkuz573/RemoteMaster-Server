export type FeatureMeta = {
  title: string
  description?: string
}

// Map flag keys without NEXT_PUBLIC_FEATURE_ prefix to metadata
export const featureMeta: Record<string, FeatureMeta> = {
  DEV_CREDENTIALS: {
    title: 'Dev credentials',
    description: 'Enable mock/dev login helpers in non‑prod environments.'
  },
  DEBUG_TOASTS: {
    title: 'Debug toasts',
    description: 'Show additional UI toasts for debugging.'
  },
  EXPERIMENTAL_UI: {
    title: 'Experimental UI',
    description: 'Enable experimental user interface features.'
  },
}

