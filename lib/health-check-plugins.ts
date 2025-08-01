/**
 * Example health check plugins
 * This file demonstrates how to create custom health check plugins
 */

import { HealthCheckPlugin, HealthCheckResult } from './system-status';

/**
 * CPU usage health check plugin
 */
export class CpuHealthCheckPlugin implements HealthCheckPlugin {
  name = 'cpu';
  description = 'CPU usage monitoring';
  critical = false;
  timeout = 2000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simple CPU check - in production you might want to use a more sophisticated approach
      const cpuUsage = process.cpuUsage();
      const totalCpuTime = cpuUsage.user + cpuUsage.system;
      
      // Consider CPU usage healthy if total time is reasonable
      const isHealthy = totalCpuTime < 1000000; // 1 second in microseconds
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          user: cpuUsage.user,
          system: cpuUsage.system,
          total: totalCpuTime,
          threshold: 1000000
        },
        error: isHealthy ? undefined : `CPU usage ${totalCpuTime} exceeds threshold`
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
 * Disk space health check plugin
 */
export class DiskSpaceHealthCheckPlugin implements HealthCheckPlugin {
  name = 'diskspace';
  description = 'Available disk space check';
  critical = false;
  timeout = 3000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Check current directory disk space
      const currentDir = process.cwd();
      const stats = await fs.statfs(currentDir);
      
      const totalBytes = stats.blocks * stats.bsize;
      const availableBytes = stats.bavail * stats.bsize;
      const usedBytes = totalBytes - availableBytes;
      const usagePercent = (usedBytes / totalBytes) * 100;
      
      // Consider disk usage healthy if less than 90%
      const isHealthy = usagePercent < 90;
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          totalGB: Math.round(totalBytes / 1024 / 1024 / 1024 * 100) / 100,
          availableGB: Math.round(availableBytes / 1024 / 1024 / 1024 * 100) / 100,
          usedGB: Math.round(usedBytes / 1024 / 1024 / 1024 * 100) / 100,
          usagePercent: Math.round(usagePercent * 100) / 100,
          threshold: 90,
          path: currentDir
        },
        error: isHealthy ? undefined : `Disk usage ${Math.round(usagePercent)}% exceeds 90% threshold`
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
 * Network connectivity health check plugin
 */
export class NetworkHealthCheckPlugin implements HealthCheckPlugin {
  name = 'network';
  description = 'Network connectivity check';
  critical = false;
  timeout = 5000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check connectivity to external services
      const testUrls = [
        'https://www.google.com',
        'https://www.cloudflare.com',
        'https://httpbin.org/status/200'
      ];
      
      const results = await Promise.allSettled(
        testUrls.map(url => 
          fetch(url, { 
            method: 'HEAD', 
            signal: AbortSignal.timeout(3000) 
          })
        )
      );
      
      const successfulChecks = results.filter(
        result => result.status === 'fulfilled' && result.value.ok
      ).length;
      
      const isHealthy = successfulChecks >= 2; // At least 2 out of 3 should work
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          totalChecks: testUrls.length,
          successfulChecks,
          successRate: Math.round((successfulChecks / testUrls.length) * 100),
          testUrls
        },
        error: isHealthy ? undefined : `Only ${successfulChecks}/${testUrls.length} network checks passed`
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
 * Custom external API health check plugin
 */
export class ExternalApiHealthCheckPlugin implements HealthCheckPlugin {
  constructor(
    public name: string,
    public url: string,
    public critical: boolean = false,
    public timeout: number = 5000,
    public description: string = `External API health check for ${url}`,
    public expectedStatus?: number
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
      
      const expectedStatus = this.expectedStatus || 200;
      const isHealthy = response.status === expectedStatus;
      
      return {
        healthy: isHealthy,
        responseTime,
        details: {
          statusCode: response.status,
          statusText: response.statusText,
          expectedStatus,
          url: this.url
        },
        error: isHealthy ? undefined : `Expected status ${expectedStatus}, got ${response.status}`
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          url: this.url,
          error: error instanceof Error ? error.name : 'Unknown'
        }
      };
    }
  }
}

/**
 * Database connection pool health check plugin (example for PostgreSQL)
 */
export class PostgresHealthCheckPlugin implements HealthCheckPlugin {
  name = 'postgres';
  description = 'PostgreSQL database connection check';
  critical = true;
  timeout = 3000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // This is a placeholder - in real implementation you would:
      // 1. Import your database client (e.g., pg, prisma, etc.)
      // 2. Execute a simple query like "SELECT 1"
      // 3. Check connection pool status
      
      // Example with pg:
      // const { Client } = require('pg');
      // const client = new Client(process.env.DATABASE_URL);
      // await client.connect();
      // const result = await client.query('SELECT 1');
      // await client.end();
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: true, // Placeholder - replace with actual check
        responseTime,
        details: {
          connected: true,
          type: 'postgresql',
          poolSize: 10, // Example
          activeConnections: 2 // Example
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          type: 'postgresql',
          connected: false
        }
      };
    }
  }
}

/**
 * Redis health check plugin
 */
export class RedisHealthCheckPlugin implements HealthCheckPlugin {
  name = 'redis';
  description = 'Redis cache connection check';
  critical = false;
  timeout = 2000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // This is a placeholder - in real implementation you would:
      // 1. Import your Redis client
      // 2. Execute a simple command like PING
      // 3. Check connection status
      
      // Example with redis:
      // const redis = require('redis');
      // const client = redis.createClient(process.env.REDIS_URL);
      // const result = await client.ping();
      // await client.quit();
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: true, // Placeholder - replace with actual check
        responseTime,
        details: {
          connected: true,
          type: 'redis',
          version: '6.2.0', // Example
          memoryUsage: '1.2MB' // Example
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          type: 'redis',
          connected: false
        }
      };
    }
  }
}

/**
 * SSL certificate health check plugin
 */
export class SslCertificateHealthCheckPlugin implements HealthCheckPlugin {
  name = 'ssl';
  description = 'SSL certificate validity check';
  critical = false;
  timeout = 5000;

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const https = await import('https');
      const url = await import('url');
      
      const testUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3001';
      const parsedUrl = url.parse(testUrl);
      
      return new Promise((resolve) => {
        const req = https.request({
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.path,
          method: 'HEAD',
          rejectUnauthorized: false // Allow self-signed certificates in dev
        }, (res) => {
          const responseTime = Date.now() - startTime;
          
          // Check if we got a valid HTTPS response
          const isHealthy = !!(res.statusCode && res.statusCode >= 200 && res.statusCode < 400);
          
          resolve({
            healthy: isHealthy,
            responseTime,
            details: {
              statusCode: res.statusCode,
              protocol: 'HTTPS', // Assuming HTTPS since we're using https.request
              url: testUrl
            },
            error: isHealthy ? undefined : `SSL check failed with status ${res.statusCode}`
          });
        });
        
        req.on('error', (error) => {
          const responseTime = Date.now() - startTime;
          resolve({
            healthy: false,
            responseTime,
            error: error.message,
            details: {
              url: testUrl,
              error: error.name
            }
          });
        });
        
        req.setTimeout(this.timeout, () => {
          req.destroy();
          const responseTime = Date.now() - startTime;
          resolve({
            healthy: false,
            responseTime,
            error: 'SSL check timeout',
            details: {
              url: testUrl,
              timeout: this.timeout
            }
          });
        });
        
        req.end();
      });
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