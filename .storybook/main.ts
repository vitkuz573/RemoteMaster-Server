import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  framework: '@storybook/nextjs',
  stories: [
    '../components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  typescript: { reactDocgen: 'react-docgen-typescript' },
}

export default config

