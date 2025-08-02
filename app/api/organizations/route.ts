import { NextRequest, NextResponse } from 'next/server';

// Import the organizations from the registration endpoint
// In a real app, this would be a shared database service
let organizations: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const id = searchParams.get('id');

    if (domain) {
      const organization = organizations.find(org => org.domain === domain);
      if (!organization) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ organization });
    }

    if (id) {
      const organization = organizations.find(org => org.id === id);
      if (!organization) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ organization });
    }

    // Return all organizations (for admin purposes)
    return NextResponse.json({
      organizations: organizations.map(org => ({
        id: org.id,
        name: org.name,
        domain: org.domain,
        status: org.status,
        plan: org.selectedPlan,
        registeredAt: org.registrationTimestamp,
        byoidConfig: org.byoidConfig || null
      }))
    });

  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to add organization (used by registration endpoint)
export function addOrganization(org: any) {
  organizations.push(org);
}

// Helper function to get organizations (for testing)
export function getOrganizations() {
  return organizations;
} 