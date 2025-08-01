/**
 * Health Check System Usage Examples
 * 
 * This file demonstrates how to use the extensible health check system
 * to add custom health checks to your application.
 */

import { 
  addHealthCheck, 
  removeHealthCheck, 
  getHealthChecks,
  initializeDefaultHealthChecks,
  HttpHealthCheckPlugin 
} from './system-status';

import {
  CpuHealthCheckPlugin,
  DiskSpaceHealthCheckPlugin,
  NetworkHealthCheckPlugin,
  ExternalApiHealthCheckPlugin,
  PostgresHealthCheckPlugin,
  RedisHealthCheckPlugin,
  SslCertificateHealthCheckPlugin
} from './health-check-plugins';

/**
 * Example 1: Adding a simple HTTP health check
 */
export function addSimpleHttpCheck() {
  const httpCheck = new HttpHealthCheckPlugin(
    'my-api',
    'https://api.example.com/health',
    false, // not critical
    3000,  // 3 second timeout
    'My external API health check'
  );
  
  addHealthCheck(httpCheck);
}

/**
 * Example 2: Adding system resource checks
 */
export function addSystemResourceChecks() {
  // Add CPU monitoring
  addHealthCheck(new CpuHealthCheckPlugin());
  
  // Add disk space monitoring
  addHealthCheck(new DiskSpaceHealthCheckPlugin());
  
  // Add network connectivity check
  addHealthCheck(new NetworkHealthCheckPlugin());
}

/**
 * Example 3: Adding database and cache checks
 */
export function addDatabaseChecks() {
  // Add PostgreSQL health check
  addHealthCheck(new PostgresHealthCheckPlugin());
  
  // Add Redis health check
  addHealthCheck(new RedisHealthCheckPlugin());
}

/**
 * Example 4: Adding external service checks
 */
export function addExternalServiceChecks() {
  // Check payment service
  addHealthCheck(new ExternalApiHealthCheckPlugin(
    'payment-service',
    'https://api.stripe.com/health',
    true, // critical
    5000,
    'Stripe payment service health check'
  ));
  
  // Check email service
  addHealthCheck(new ExternalApiHealthCheckPlugin(
    'email-service',
    'https://api.sendgrid.com/health',
    false, // not critical
    3000,
    'SendGrid email service health check'
  ));
  
  // Check storage service
  addHealthCheck(new ExternalApiHealthCheckPlugin(
    'storage-service',
    'https://storage.googleapis.com/storage/v1/b',
    false, // not critical
    4000,
    'Google Cloud Storage health check'
  ));
}

/**
 * Example 5: Adding SSL certificate check
 */
export function addSslCheck() {
  addHealthCheck(new SslCertificateHealthCheckPlugin());
}

/**
 * Example 6: Custom health check implementation
 */
export class CustomHealthCheckPlugin {
  name = 'custom-service';
  description = 'Custom service health check';
  critical = false;
  timeout = 2000;

  async check() {
    const startTime = Date.now();
    
    try {
      // Your custom health check logic here
      // For example, check if a specific file exists
      const fs = await import('fs/promises');
      await fs.access('/path/to/important/file');
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: true,
        responseTime,
        details: {
          fileExists: true,
          path: '/path/to/important/file'
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
 * Example 7: Initialize all health checks
 */
export function initializeAllHealthChecks() {
  // Initialize default checks (API, memory, filesystem, environment)
  initializeDefaultHealthChecks();
  
  // Add system resource checks
  addSystemResourceChecks();
  
  // Add database checks
  addDatabaseChecks();
  
  // Add external service checks
  addExternalServiceChecks();
  
  // Add SSL check
  addSslCheck();
  
  // Add custom checks
  addHealthCheck(new CustomHealthCheckPlugin());
}

/**
 * Example 8: Dynamic health check management
 */
export function manageHealthChecks() {
  // Get all registered health checks
  const checks = getHealthChecks();
  console.log('Registered health checks:', checks.map(c => c.name));
  
  // Remove a specific check
  removeHealthCheck('cpu');
  
  // Add a new check dynamically
  const dynamicCheck = new HttpHealthCheckPlugin(
    'dynamic-api',
    'https://dynamic-api.example.com/health',
    false,
    2000,
    'Dynamically added API check'
  );
  addHealthCheck(dynamicCheck);
}

/**
 * Example 9: Environment-specific health checks
 */
export function addEnvironmentSpecificChecks() {
  const environment = process.env.NODE_ENV || 'development';
  
  if (environment === 'production') {
    // Add production-specific checks
    addHealthCheck(new SslCertificateHealthCheckPlugin());
    addHealthCheck(new NetworkHealthCheckPlugin());
    
    // Add production external services
    addHealthCheck(new ExternalApiHealthCheckPlugin(
      'production-api',
      'https://api.production.com/health',
      true, // critical in production
      5000,
      'Production API health check'
    ));
  } else if (environment === 'development') {
    // Add development-specific checks
    addHealthCheck(new HttpHealthCheckPlugin(
      'dev-api',
      'http://localhost:3001/health',
      false, // not critical in dev
      2000,
      'Development API health check'
    ));
  }
}

/**
 * Example 10: Health check with custom validation
 */
export class ValidatedHealthCheckPlugin {
  name = 'validated-service';
  description = 'Health check with custom validation';
  critical = true;
  timeout = 3000;

  async check() {
    const startTime = Date.now();
    
    try {
      // Make the health check request
      const response = await fetch('https://api.example.com/health', {
        method: 'GET',
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Parse response and validate
      const data = await response.json();
      
      // Custom validation logic
      const isValid = this.validateResponse(data);
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: isValid,
        responseTime,
        details: {
          statusCode: response.status,
          data: data,
          validation: isValid ? 'passed' : 'failed'
        },
        error: isValid ? undefined : 'Response validation failed'
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

  private validateResponse(data: any): boolean {
    // Your custom validation logic here
    return data.status === 'healthy' && 
           data.version && 
           data.timestamp &&
           typeof data.uptime === 'number';
  }
}

/**
 * Usage in your application:
 * 
 * 1. In your main application file (e.g., app/layout.tsx or pages/_app.tsx):
 * 
 * ```typescript
 * import { initializeAllHealthChecks } from '@/lib/health-check-examples';
 * 
 * // Initialize health checks when app starts
 * if (typeof window === 'undefined') {
 *   initializeAllHealthChecks();
 * }
 * ```
 * 
 * 2. Or add specific checks as needed:
 * 
 * ```typescript
 * import { addHealthCheck } from '@/lib/system-status';
 * import { CustomHealthCheckPlugin } from './health-check-examples';
 * 
 * // Add a custom check
 * addHealthCheck(new CustomHealthCheckPlugin());
 * ```
 * 
 * 3. The health checks will automatically run when:
 *    - Someone calls getSystemStatus()
 *    - The footer component loads
 *    - The /api/health endpoint is called
 * 
 * 4. Results are cached for 30 seconds to avoid performance issues
 */ 