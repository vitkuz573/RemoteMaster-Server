import { NextRequest, NextResponse } from 'next/server';
import { getOrganizations, addOrganization } from '../organizations/route';

interface BYOIDSetupRequest {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
  organizationId: string;
  organizationName: string;
  organizationDomain: string;
  id?: string;
  status?: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  notes?: string | null;
}

// In-memory storage for demo purposes
// In production, this would be stored in a database
let byoidRequests: BYOIDSetupRequest[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: BYOIDSetupRequest = await request.json();

         // Validate required fields
     const requiredFields = [
       'issuerUrl', 'clientId', 'clientSecret', 'organizationId'
     ];

    for (const field of requiredFields) {
      if (!body[field as keyof BYOIDSetupRequest]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate URLs
    try {
      new URL(body.issuerUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format for Issuer URL' },
        { status: 400 }
      );
    }

    

    // Add timestamp and status
    const byoidRequest: BYOIDSetupRequest = {
      ...body,
      id: `byoid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      approvedAt: null,
      notes: null
    };

    // Store the request
    byoidRequests.push(byoidRequest);

    // Update the organization with BYOID configuration
    const organizations = getOrganizations();
    const orgIndex = organizations.findIndex(org => org.id === body.organizationId);
    
    if (orgIndex !== -1) {
      organizations[orgIndex].byoidConfig = {
        issuerUrl: body.issuerUrl,
        clientId: body.clientId,
        status: 'active'
      };
    }

    // In a real implementation, you would:
    // 1. Send notification to your support team
    // 2. Create a ticket in your support system
    // 3. Send confirmation email to the customer
    // 4. Update the organization's IdP configuration

         console.log('BYOID Setup Request:', {
       organization: byoidRequest.organizationName,
       issuerUrl: byoidRequest.issuerUrl,
       submittedAt: byoidRequest.submittedAt
     });

         return NextResponse.json({
       success: true,
       message: 'OpenID Connect setup request submitted successfully',
       requestId: byoidRequest.id,
       estimatedReviewTime: '24-48 hours'
     });

  } catch (error) {
    console.error('BYOID setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (organizationId) {
      const request = byoidRequests.find(req => req.organizationId === organizationId);
      if (!request) {
        return NextResponse.json(
          { error: 'BYOID setup request not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ request });
    }

         // Return all requests (for admin purposes)
     return NextResponse.json({ 
       requests: byoidRequests.map(req => ({
         id: req.id,
         organizationName: req.organizationName,
         organizationDomain: req.organizationDomain,
         issuerUrl: req.issuerUrl,
         status: req.status,
         submittedAt: req.submittedAt
       }))
     });

  } catch (error) {
    console.error('Get BYOID requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get BYOID requests (for testing)
export function getBYOIDRequests() {
  return byoidRequests;
}

// Helper function to update BYOID request status (for admin use)
export function updateBYOIDRequestStatus(requestId: string, status: 'pending' | 'approved' | 'rejected', notes?: string) {
  const request = byoidRequests.find(req => req.id === requestId);
  if (request) {
    request.status = status;
    request.notes = notes;
    if (status === 'approved') {
      request.approvedAt = new Date().toISOString();
    }
    request.reviewedAt = new Date().toISOString();
  }
} 