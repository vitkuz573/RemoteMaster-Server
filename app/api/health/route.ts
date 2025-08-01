import { NextRequest, NextResponse } from 'next/server';
import { 
  initializeDefaultHealthChecks, 
  getSystemStatus, 
  type SystemStatus 
} from '@/lib/system-status';

/**
 * Health check endpoint for system status monitoring
 * Returns system health information in a standardized format
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Initialize health checks if not already done
    initializeDefaultHealthChecks();
    
    // Get comprehensive system status
    const systemStatus: SystemStatus = await getSystemStatus();
    
    const responseTime = Date.now() - startTime;
    
    // Enhanced health data with detailed service information
    const healthData = {
      status: systemStatus.status === 'online' ? 'healthy' : 
              systemStatus.status === 'degraded' ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || 'unknown',
      responseTime: systemStatus.responseTime,
      message: systemStatus.message,
      services: systemStatus.services,
      checkResults: systemStatus.checkResults, // Include detailed check results
      checks: {
        memory: {
          status: systemStatus.services?.memory?.status || 'unknown',
          details: systemStatus.services?.memory?.details || {}
        },
        database: {
          status: systemStatus.services?.database?.status || 'unknown',
          details: systemStatus.services?.database?.details || {}
        },
        api: {
          status: systemStatus.services?.api?.status || 'unknown',
          details: systemStatus.services?.api?.details || {}
        },
        filesystem: {
          status: systemStatus.services?.filesystem?.status || 'unknown',
          details: systemStatus.services?.filesystem?.details || {}
        },
        environment: {
          status: systemStatus.services?.environment?.status || 'unknown',
          details: systemStatus.services?.environment?.details || {}
        }
      }
    };
    
    return NextResponse.json({
      ...healthData,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }, {
      status: systemStatus.status === 'online' ? 200 : 
              systemStatus.status === 'degraded' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
      message: 'Health check failed'
    }, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

/**
 * HEAD method for lightweight health checks
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
} 