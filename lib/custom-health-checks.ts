/**
 * Custom Health Check Examples
 * 
 * This file demonstrates how to create and use custom health checks
 * for your specific application needs.
 */

import { HealthCheckPlugin, HealthCheckResult, addHealthCheck } from './system-status';

/**
 * Example 1: Simple file existence check
 */
export class FileExistenceHealthCheckPlugin implements HealthCheckPlugin {
  name = 'important-files';
  description = 'Check if important files exist';
  critical = false;
  timeout = 2000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Check if important files exist
      const importantFiles = [
        'package.json',
        'next.config.ts',
        'tsconfig.json'
      ];
      
      const results = await Promise.allSettled(
        importantFiles.map(file => fs.access(file))
      );
      
      const existingFiles = results.filter(
        result => result.status === 'fulfilled'
      ).length;
      
      const isHealthy = existingFiles === importantFiles.length;
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          totalFiles: importantFiles.length,
          existingFiles,
          missingFiles: importantFiles.length - existingFiles,
          files: importantFiles
        },
        error: isHealthy ? undefined : `${importantFiles.length - existingFiles} files missing`
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
 * Example 2: Process uptime check
 */
export class ProcessUptimeHealthCheckPlugin implements HealthCheckPlugin {
  name = 'process-uptime';
  description = 'Check process uptime';
  critical = false;
  timeout = 1000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const uptime = process.uptime();
      const uptimeHours = uptime / 3600;
      
      // Consider healthy if uptime is more than 1 hour
      const isHealthy = uptime > 3600;
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          uptimeSeconds: Math.round(uptime),
          uptimeHours: Math.round(uptimeHours * 100) / 100,
          thresholdHours: 1
        },
        error: isHealthy ? undefined : `Process uptime ${Math.round(uptimeHours * 100) / 100}h is less than 1h`
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
 * Example 3: Node.js version check
 */
export class NodeVersionHealthCheckPlugin implements HealthCheckPlugin {
  name = 'node-version';
  description = 'Check Node.js version compatibility';
  critical = false;
  timeout = 1000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const version = process.version;
      const majorVersion = parseInt(version.slice(1).split('.')[0]);
      
      // Check if Node.js version is 18 or higher
      const isHealthy = majorVersion >= 18;
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          version,
          majorVersion,
          requiredVersion: 18
        },
        error: isHealthy ? undefined : `Node.js version ${version} is below required version 18`
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
 * Example 4: Custom business logic check
 */
export class BusinessLogicHealthCheckPlugin implements HealthCheckPlugin {
  name = 'business-logic';
  description = 'Check business logic health';
  critical = false;
  timeout = 3000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simulate business logic check
      // In real application, this could be:
      // - Database query performance
      // - Cache hit rate
      // - API response times
      // - Business metrics
      
      const checks = await this.performBusinessChecks();
      const isHealthy = checks.every(check => check.healthy);
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          totalChecks: checks.length,
          passedChecks: checks.filter(c => c.healthy).length,
          failedChecks: checks.filter(c => !c.healthy).length,
          checks
        },
        error: isHealthy ? undefined : `${checks.filter(c => !c.healthy).length} business checks failed`
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

  private async performBusinessChecks(): Promise<Array<{name: string, healthy: boolean, details: any}>> {
    // Simulate various business checks
    return [
      {
        name: 'user-authentication',
        healthy: true,
        details: { responseTime: 150, successRate: 99.5 }
      },
      {
        name: 'data-processing',
        healthy: true,
        details: { queueSize: 0, processingTime: 200 }
      },
      {
        name: 'payment-processing',
        healthy: false, // Simulate failure
        details: { errorRate: 5.2, lastError: 'Gateway timeout' }
      }
    ];
  }
}

/**
 * Example 5: Configuration validation check
 */
export class ConfigurationHealthCheckPlugin implements HealthCheckPlugin {
  name = 'configuration';
  description = 'Validate application configuration';
  critical = true;
  timeout = 2000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const requiredConfig = [
        'NODE_ENV',
        'NEXT_PUBLIC_API_URL'
      ];
      
      const optionalConfig = [
        'DATABASE_URL',
        'REDIS_URL',
        'JWT_SECRET'
      ];
      
      const missingRequired = requiredConfig.filter(key => !process.env[key]);
      const missingOptional = optionalConfig.filter(key => !process.env[key]);
      
      const isHealthy = missingRequired.length === 0;
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          requiredConfig,
          optionalConfig,
          missingRequired,
          missingOptional,
          totalConfig: requiredConfig.length + optionalConfig.length
        },
        error: isHealthy ? undefined : `Missing required config: ${missingRequired.join(', ')}`
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
 * Initialize custom health checks
 */
export function initializeCustomHealthChecks(): void {
  // Add file existence check
  addHealthCheck(new FileExistenceHealthCheckPlugin());
  
  // Add process uptime check
  addHealthCheck(new ProcessUptimeHealthCheckPlugin());
  
  // Add Node.js version check
  addHealthCheck(new NodeVersionHealthCheckPlugin());
  
  // Add business logic check
  addHealthCheck(new BusinessLogicHealthCheckPlugin());
  
  // Add configuration check
  addHealthCheck(new ConfigurationHealthCheckPlugin());
}

/**
 * Usage example:
 * 
 * // In your app initialization
 * import { initializeCustomHealthChecks } from '@/lib/custom-health-checks';
 * 
 * if (typeof window === 'undefined') {
 *   initializeCustomHealthChecks();
 * }
 */ 