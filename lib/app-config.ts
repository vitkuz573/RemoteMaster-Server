/**
 * Application configuration
 * Centralized configuration for app name, version, and other settings
 */
import { env } from './env';

// Derive short name from capital letters of the name (Unicode-aware).
// Fallback: first two characters uppercased if no uppercase letters found.
const deriveShortName = (fullName: string) => {
  const caps = fullName.match(/\p{Lu}/gu);
  if (caps && caps.length > 0) return caps.join('');
  return fullName.slice(0, 2).toUpperCase();
};

export const appConfig = {
  name: 'RemoteMaster',
  // Optional explicit short name; if not provided, computed from `name`.
  _shortName: undefined as string | undefined,
  description: 'Remote Server Management Platform',
  developer: 'RemoteMaster Software',
  version: '2.1.4',
  buildDate: env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0],
  buildTime: env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
  buildHash: env.NEXT_PUBLIC_BUILD_HASH || 'dev',
  buildBranch: env.NEXT_PUBLIC_BUILD_BRANCH || 'unknown',
  buildTimestamp: env.NEXT_PUBLIC_BUILD_TIMESTAMP || Date.now().toString(),
  environment: process.env['NODE_ENV'] || 'development',
  copyrightStartYear: 2023,
  
  // Support configuration
  support: {
    availability: env.NEXT_PUBLIC_SUPPORT_AVAILABILITY,
    responseTime: env.NEXT_PUBLIC_SUPPORT_RESPONSE_TIME,
    email: env.NEXT_PUBLIC_SUPPORT_EMAIL,
    phone: env.NEXT_PUBLIC_SUPPORT_PHONE,
    website: env.NEXT_PUBLIC_SUPPORT_WEBSITE,
    documentation: env.NEXT_PUBLIC_DOCS_URL,
    community: env.NEXT_PUBLIC_COMMUNITY_URL
  },
  
  // Repository settings for commit links
  repository: {
    url: env.NEXT_PUBLIC_REPO_URL,
    type: env.NEXT_PUBLIC_REPO_TYPE,
    branch: env.NEXT_PUBLIC_REPO_BRANCH
  },
  
  // System endpoints for health checks
  endpoints: {
    api: env.NEXT_PUBLIC_API_URL,
    health: env.NEXT_PUBLIC_HEALTH_URL,
    status: env.NEXT_PUBLIC_STATUS_URL
  },
  
  // Computed properties
  get buildVersion() {
    return `${this.version}${this.environment === 'development' ? '-dev' : ''}`;
  },
  
  // Short name: explicit override or derived from capital letters in `name`.
  get shortName() {
    return this._shortName ?? deriveShortName(this.name);
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
