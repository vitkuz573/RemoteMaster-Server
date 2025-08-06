import { useHeaderStore } from '@/lib/stores';

export interface HeaderPreset {
  showNotifications: boolean;
  showProfile: boolean;
  showSidebarToggle: boolean;
  customTitle?: string;
  customSubtitle?: string;
}

export const headerPresets = {
  default: {
    showNotifications: false,
    showProfile: false,
    showSidebarToggle: true,
  },
  minimal: {
    showNotifications: false,
    showProfile: false,
    showSidebarToggle: false,
  },
  notificationsOnly: {
    showNotifications: true,
    showProfile: false,
    showSidebarToggle: true,
  },
  profileOnly: {
    showNotifications: false,
    showProfile: true,
    showSidebarToggle: true,
  },
  dashboard: {
    showNotifications: true,
    showProfile: true,
    showSidebarToggle: true,
    customTitle: 'Dashboard',
    customSubtitle: 'Manage your resources',
  },
  admin: {
    showNotifications: true,
    showProfile: true,
    showSidebarToggle: false,
    customTitle: 'Admin Panel',
    customSubtitle: 'System administration',
  },
  setup: {
    showNotifications: false,
    showProfile: true,
    showSidebarToggle: false,
    customTitle: 'Setup Wizard',
    customSubtitle: 'Configure your system',
  },
} as const;

export function useHeaderConfig() {
  const { updateConfig, resetConfig, config } = useHeaderStore();

  const applyPreset = (preset: keyof typeof headerPresets) => {
    updateConfig(headerPresets[preset]);
  };

  const applyCustomConfig = (customConfig: Partial<HeaderPreset>) => {
    updateConfig(customConfig);
  };

  return {
    config,
    applyPreset,
    applyCustomConfig,
    resetConfig,
    presets: headerPresets,
  };
} 