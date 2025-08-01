/**
 * System status monitoring utilities
 * Provides real-time system health and status information with extensible health checks
 */

export interface SystemStatus {
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  message: string;
  timestamp: number;
  uptime?: number;
  responseTime?: number;
  services?: {
    [key: string]: {
      status: 'healthy' | 'unhealthy' | 'degraded';
      responseTime: number;
      lastCheck: number;
      details?: any;
    };
  };
  // Enhanced interface for detailed check results
  checkResults?: {
    [key: string]: {
      name: string;
      description: string;
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      critical: boolean;
      error?: string;
      details?: any;
    };
  };
}

export interface HealthCheckResult {
  healthy: boolean;
  responseTime: number;
  error?: string;
  details?: any;
}

export interface HealthCheckPlugin {
  name: string;
  description: string;
  critical: boolean; // If true, failure makes system offline instead of degraded
  check: () => Promise<HealthCheckResult>;
  timeout?: number; // Default 5000ms
}

/**
 * Base HTTP health check plugin
 */
export class HttpHealthCheckPlugin implements HealthCheckPlugin {
  constructor(
    public name: string,
    public url: string,
    public critical: boolean = false,
    public timeout: number = 5000,
    public description: string = `HTTP health check for ${url}`
  ) {}

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(this.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RemoteMaster-HealthCheck/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          healthy: true,
          responseTime,
          details: {
            statusCode: response.status,
            statusText: response.statusText
          }
        };
      } else {
        return {
          healthy: false,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: {
            statusCode: response.status,
            statusText: response.statusText
          }
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          error: error instanceof Error ? error.name : 'Unknown'
        }
      };
    }
  }
}

/**
 * Memory usage health check plugin
 */
export class MemoryHealthCheckPlugin implements HealthCheckPlugin {
  name = 'memory';
  description = 'System memory usage check';
  critical = false;
  timeout = 1000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const externalMB = Math.round(memUsage.external / 1024 / 1024);
      
      // Consider memory usage healthy if heap usage is less than 90% of total (more realistic for dev)
      const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      const isHealthy = heapUsagePercent < 90;
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          heapUsed: heapUsedMB,
          heapTotal: heapTotalMB,
          external: externalMB,
          heapUsagePercent: Math.round(heapUsagePercent * 100) / 100,
          threshold: 90
        },
        error: isHealthy ? undefined : `Memory usage ${Math.round(heapUsagePercent)}% exceeds 90% threshold`
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Database health check plugin (placeholder)
 */
export class DatabaseHealthCheckPlugin implements HealthCheckPlugin {
  name = 'database';
  description = 'Database connection check';
  critical = true;
  timeout = 3000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // TODO: Implement actual database check
      // For now, return healthy status
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: true,
        responseTime,
        details: {
          connected: true,
          type: 'placeholder'
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * File system health check plugin
 */
export class FileSystemHealthCheckPlugin implements HealthCheckPlugin {
  name = 'filesystem';
  description = 'File system accessibility check';
  critical = false;
  timeout = 2000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const fs = await import('fs/promises');
      
      // Check if we can read and write to temp directory
      const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
      const testFile = `${tempDir}/health-check-${Date.now()}.tmp`;
      
      // Test write
      await fs.writeFile(testFile, 'health-check');
      
      // Test read
      const content = await fs.readFile(testFile, 'utf-8');
      
      // Clean up
      await fs.unlink(testFile);
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: true,
        responseTime,
        details: {
          tempDir,
          writeTest: 'passed',
          readTest: 'passed',
          cleanupTest: 'passed'
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Environment health check plugin
 */
export class EnvironmentHealthCheckPlugin implements HealthCheckPlugin {
  name = 'environment';
  description = 'Environment configuration check';
  critical = false;
  timeout = 1000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const requiredEnvVars = [
        'NODE_ENV'
        // 'NEXT_PUBLIC_API_URL' // Optional for development
      ];
      
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      const isHealthy = missingVars.length === 0;
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          nodeEnv: process.env.NODE_ENV,
          missingVars,
          totalChecked: requiredEnvVars.length
        },
        error: isHealthy ? undefined : `Missing required environment variables: ${missingVars.join(', ')}`
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Health check registry for managing plugins
 */
export class HealthCheckRegistry {
  private plugins: Map<string, HealthCheckPlugin> = new Map();

  /**
   * Register a health check plugin
   */
  register(plugin: HealthCheckPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Unregister a health check plugin
   */
  unregister(name: string): boolean {
    return this.plugins.delete(name);
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): HealthCheckPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a specific plugin
   */
  getPlugin(name: string): HealthCheckPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();
    
    const checkPromises = Array.from(this.plugins.values()).map(async (plugin) => {
      try {
        const result = await Promise.race([
          plugin.check(),
          new Promise<HealthCheckResult>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), plugin.timeout || 5000)
          )
        ]);
        results.set(plugin.name, result);
      } catch (error) {
        results.set(plugin.name, {
          healthy: false,
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
    await Promise.all(checkPromises);
    return results;
  }
}

// Global registry instance
export const healthCheckRegistry = new HealthCheckRegistry();

/**
 * Initialize default health checks
 */
export function initializeDefaultHealthChecks(): void {
  const { appConfig } = require('./app-config');
  
  // Register HTTP health checks
  healthCheckRegistry.register(new HttpHealthCheckPlugin(
    'api',
    appConfig.endpoints.api,
    false, // not critical in development
    5000,
    'Main API endpoint health check'
  ));
  
  healthCheckRegistry.register(new HttpHealthCheckPlugin(
    'health',
    appConfig.endpoints.health,
    false, // not critical
    3000,
    'Health endpoint check'
  ));
  
  // Register system health checks
  healthCheckRegistry.register(new MemoryHealthCheckPlugin());
  healthCheckRegistry.register(new DatabaseHealthCheckPlugin());
  healthCheckRegistry.register(new FileSystemHealthCheckPlugin());
  healthCheckRegistry.register(new EnvironmentHealthCheckPlugin());
}

/**
 * Get overall system status by running all registered health checks
 */
export async function getSystemStatus(): Promise<SystemStatus> {
  const results = await healthCheckRegistry.runAllChecks();
  const services: SystemStatus['services'] = {};
  const checkResults: SystemStatus['checkResults'] = {};
  let overallStatus: SystemStatus['status'] = 'online';
  let errorCount = 0;
  let totalResponseTime = 0;
  let criticalFailures = 0;
  
  // Process results
  for (const [name, result] of results) {
    const plugin = healthCheckRegistry.getPlugin(name);
    if (!plugin) continue;
    
    services[name] = {
      status: result.healthy ? 'healthy' : 'unhealthy',
      responseTime: result.responseTime,
      lastCheck: Date.now(),
      details: result.details
    };

    // Enhanced check results for detailed display
    checkResults[name] = {
      name: plugin.name,
      description: plugin.description,
      status: result.healthy ? 'healthy' : 'unhealthy',
      responseTime: result.responseTime,
      critical: plugin.critical,
      error: result.error,
      details: result.details
    };
    
    totalResponseTime += result.responseTime;
    
    if (!result.healthy) {
      errorCount++;
      if (plugin.critical) {
        criticalFailures++;
        overallStatus = 'offline';
      } else if (overallStatus === 'online') {
        overallStatus = 'degraded';
      }
    }
  }
  
  // Determine status message
  let message: string;
  const avgResponseTime = Math.round(totalResponseTime / Object.keys(services).length);
  
  switch (overallStatus) {
    case 'online':
      message = `All systems operational (${avgResponseTime}ms)`;
      break;
    case 'degraded':
      message = `System degraded - ${errorCount} service(s) unavailable`;
      break;
    case 'offline':
      message = `System offline - ${criticalFailures} critical service(s) unavailable`;
      break;
    default:
      message = 'System status unknown';
  }
  
  return {
    status: overallStatus,
    message,
    timestamp: Date.now(),
    responseTime: avgResponseTime,
    services,
    checkResults
  };
}

/**
 * Check if a service is healthy by making a health check request
 * @deprecated Use HttpHealthCheckPlugin instead
 */
export async function checkServiceHealth(url: string, timeout = 5000): Promise<HealthCheckResult> {
  const plugin = new HttpHealthCheckPlugin('legacy', url, false, timeout);
  return plugin.check();
}

/**
 * Get cached system status (for performance)
 * This can be used to avoid making requests on every render
 */
let cachedStatus: SystemStatus | null = null;
let lastCheck = 0;
const CACHE_DURATION = 30000; // 30 seconds

export async function getCachedSystemStatus(): Promise<SystemStatus> {
  const now = Date.now();
  
  // Return cached status if it's still fresh
  if (cachedStatus && (now - lastCheck) < CACHE_DURATION) {
    return cachedStatus;
  }
  
  // Get fresh status
  try {
    cachedStatus = await getSystemStatus();
    lastCheck = now;
    return cachedStatus;
  } catch (error) {
    // Return cached status if available, otherwise return offline status
    if (cachedStatus) {
      return cachedStatus;
    }
    
    return {
      status: 'offline',
      message: 'Unable to check system status',
      timestamp: now,
      services: {},
      checkResults: {}
    };
  }
}

/**
 * Force refresh system status (bypass cache)
 */
export async function refreshSystemStatus(): Promise<SystemStatus> {
  cachedStatus = null;
  lastCheck = 0;
  return getCachedSystemStatus();
}

/**
 * Add a custom health check
 */
export function addHealthCheck(plugin: HealthCheckPlugin): void {
  healthCheckRegistry.register(plugin);
}

/**
 * Remove a health check
 */
export function removeHealthCheck(name: string): boolean {
  return healthCheckRegistry.unregister(name);
}

/**
 * Get list of all health checks
 */
export function getHealthChecks(): HealthCheckPlugin[] {
  return healthCheckRegistry.getPlugins();
} 