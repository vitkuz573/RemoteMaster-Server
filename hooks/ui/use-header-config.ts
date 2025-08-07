import { useHeaderStore } from '@/lib/stores';
import { headerPresets, HeaderPreset } from '@/lib/config/header-presets';
import { useCallback } from 'react';

export function useHeaderConfig() {
  const { updateConfig, resetConfig, config } = useHeaderStore();

  const applyPreset = useCallback((preset: keyof typeof headerPresets) => {
    updateConfig(headerPresets[preset]);
  }, [updateConfig]);

  const applyCustomConfig = useCallback((customConfig: Partial<HeaderPreset>) => {
    updateConfig(customConfig);
  }, [updateConfig]);

  return {
    config,
    applyPreset,
    applyCustomConfig,
    resetConfig,
    presets: headerPresets,
  };
}
