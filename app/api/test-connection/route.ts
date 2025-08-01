/**
 * Test Connection API Endpoint
 * Used to verify API connectivity and basic functionality
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate a small delay to test connection
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({
      success: true,
      message: 'API connection test successful',
      timestamp: new Date().toISOString(),
      status: 'online'
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'API connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
} 