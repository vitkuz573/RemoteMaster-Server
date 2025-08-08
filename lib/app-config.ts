/**
 * Application configuration
 * Centralized configuration for app name, version, and other settings
 */
export const appConfig = {
  name: 'RemoteMaster',
  shortName: 'RM',
  description: 'Remote Server Management Platform',
  developer: 'RemoteMaster Software',
  version: '2.1.4',
  buildDate: process.env['NEXT_PUBLIC_BUILD_DATE'] || new Date().toISOString().split('T')[0],
  buildTime: process.env['NEXT_PUBLIC_BUILD_TIME'] || new Date().toISOString(),
  buildHash: process.env['NEXT_PUBLIC_BUILD_HASH'] || 'dev',
  buildBranch: process.env['NEXT_PUBLIC_BUILD_BRANCH'] || 'unknown',
  buildTimestamp: process.env['NEXT_PUBLIC_BUILD_TIMESTAMP'] || Date.now().toString(),
  environment: process.env['NODE_ENV'] || 'development',
  copyrightStartYear: 2023,
  
  // Support configuration
  support: {
    availability: process.env['NEXT_PUBLIC_SUPPORT_AVAILABILITY'],
    responseTime: process.env['NEXT_PUBLIC_SUPPORT_RESPONSE_TIME'],
    email: process.env['NEXT_PUBLIC_SUPPORT_EMAIL'],
    phone: process.env['NEXT_PUBLIC_SUPPORT_PHONE'],
    website: process.env['NEXT_PUBLIC_SUPPORT_WEBSITE'],
    documentation: process.env['NEXT_PUBLIC_DOCS_URL'],
    community: process.env['NEXT_PUBLIC_COMMUNITY_URL']
  },
  
  // Repository settings for commit links
  repository: {
    url: process.env['NEXT_PUBLIC_REPO_URL'] || 'https://github.com/vitkuz573/RemoteMaster-Server',
    type: (process.env['NEXT_PUBLIC_REPO_TYPE'] as 'github' | 'gitlab' | 'bitbucket') || 'github',
    branch: process.env['NEXT_PUBLIC_REPO_BRANCH'] || 'main'
  },
  
  // System endpoints for health checks
  endpoints: {
    api: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001',
    health: process.env['NEXT_PUBLIC_HEALTH_URL'] || 'http://localhost:3001/health',
    status: process.env['NEXT_PUBLIC_STATUS_URL'] || 'http://localhost:3001/status'
  },
  
  // Computed properties
  get buildVersion() {
    return `${this.version}${this.environment === 'development' ? '-dev' : ''}`;
  },
  
  get buildInfo() {
    return `${this.buildHash}${this.buildBranch !== 'main' ? `@${this.buildBranch}` : ''}`;
  },
  
  get commitUrl() {
    if (!this.buildHash || this.buildHash === 'dev') return null;
    
    switch (this.repository.type) {
      case 'github':
        return `${this.repository.url}/commit/${this.buildHash}`;
      case 'gitlab':
        return `${this.repository.url}/-/commit/${this.buildHash}`;
      case 'bitbucket':
        return `${this.repository.url}/commits/${this.buildHash}`;
      default:
        return null;
    }
  },
  
  get branchUrl() {
    if (!this.buildBranch || this.buildBranch === 'unknown') return null;
    
    switch (this.repository.type) {
      case 'github':
        return `${this.repository.url}/tree/${this.buildBranch}`;
      case 'gitlab':
        return `${this.repository.url}/-/tree/${this.buildBranch}`;
      case 'bitbucket':
        return `${this.repository.url}/src/${this.buildBranch}`;
      default:
        return null;
    }
  },
  
  get versionUrl() {
    if (!this.version) return null;
    
    switch (this.repository.type) {
      case 'github':
        return `${this.repository.url}/releases/tag/v${this.version}`;
      case 'gitlab':
        return `${this.repository.url}/-/tags/v${this.version}`;
      case 'bitbucket':
        return `${this.repository.url}/src/v${this.version}`;
      default:
        return null;
    }
  }
} as const;