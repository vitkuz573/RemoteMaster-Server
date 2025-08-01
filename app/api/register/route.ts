import { NextRequest, NextResponse } from 'next/server';

interface OrganizationRegistration {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  description: string;
  expectedUsers: number;
  selectedPlan: string;
  registrationTimestamp: string;
  status: 'pending' | 'active' | 'suspended';
  tenantId: string;
  idpConfig?: {
    provider: string;
    clientId?: string;
    clientSecret?: string;
    domain?: string;
  };
}

// Import shared storage
import { addOrganization } from '../organizations/route';

// In-memory storage for demo purposes
// In production, this would be a database
let organizations: OrganizationRegistration[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'name', 'domain', 'industry', 'size', 
      'contactName', 'contactEmail', 'contactPhone', 'address'
    ];
    
    for (const field of requiredFields) {
      if (!body[field] || !body[field].trim()) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contactEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(body.domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Check if organization already exists
    const existingOrg = organizations.find(org => 
      org.domain === body.domain || org.contactEmail === body.contactEmail
    );
    
    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization with this domain or email already exists' },
        { status: 409 }
      );
    }

    // Generate unique IDs
    const organizationId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create organization record
    const organization: OrganizationRegistration = {
      id: organizationId,
      tenantId,
      name: body.name.trim(),
      domain: body.domain.trim(),
      industry: body.industry,
      size: body.size,
      contactName: body.contactName.trim(),
      contactEmail: body.contactEmail.trim(),
      contactPhone: body.contactPhone.trim(),
      address: body.address.trim(),
      description: body.description?.trim() || '',
      expectedUsers: body.expectedUsers || 10,
      selectedPlan: body.selectedPlan || 'free',
      registrationTimestamp: new Date().toISOString(),
      status: 'pending',
      idpConfig: {
        provider: 'internal', // Default to internal authentication
        domain: body.domain.trim()
      }
    };

    // Add to storage
    organizations.push(organization);
    addOrganization(organization);

    // Simulate IdP setup for free plans
    if (organization.selectedPlan === 'free') {
      // For free plans, automatically activate
      organization.status = 'active';
      
      // Create basic IdP configuration
      organization.idpConfig = {
        provider: 'internal',
        domain: organization.domain,
        clientId: `client_${organization.tenantId}`,
        clientSecret: `secret_${Math.random().toString(36).substr(2, 16)}`
      };
    }

    // Return success response
    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        tenantId: organization.tenantId,
        name: organization.name,
        domain: organization.domain,
        status: organization.status,
        plan: organization.selectedPlan,
        idpConfig: organization.idpConfig
      },
      message: organization.selectedPlan === 'free' 
        ? 'Organization registered successfully! You can now log in.'
        : 'Organization registered successfully! Please complete payment to activate your account.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return list of organizations (for admin purposes)
  return NextResponse.json({
    organizations: organizations.map(org => ({
      id: org.id,
      name: org.name,
      domain: org.domain,
      status: org.status,
      plan: org.selectedPlan,
      registeredAt: org.registrationTimestamp
    }))
  });
} 