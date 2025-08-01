import { NextRequest, NextResponse } from 'next/server';

interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  tenantId: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

interface Organization {
  id: string;
  name: string;
  domain: string;
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
import { getOrganizations } from '../../organizations/route';

// In-memory storage for demo purposes
// In production, this would be a database
let users: User[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, domain } = body;

    // Validate required fields
    if (!email || !password || !domain) {
      return NextResponse.json(
        { error: 'Email, password, and domain are required' },
        { status: 400 }
      );
    }

    // Find organization by domain or ID
    const organizations = getOrganizations();
    const organization = organizations.find(org => 
      org.domain === domain || 
      org.id === domain || 
      org.domain.toLowerCase() === domain.toLowerCase() ||
      org.id.toLowerCase() === domain.toLowerCase()
    );
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if organization is active
    if (organization.status !== 'active') {
      return NextResponse.json(
        { error: 'Organization account is not active. Please contact support.' },
        { status: 403 }
      );
    }

    // Find user by email and organization
    const user = users.find(u => 
      u.email === email && u.organizationId === organization.id
    );

    if (!user) {
      // For demo purposes, create a new user if not exists
      // In production, this would require proper user registration
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: email.split('@')[0], // Use email prefix as name
        organizationId: organization.id,
        tenantId: organization.tenantId,
        role: 'admin', // First user is admin
        isActive: true
      };
      
      users.push(newUser);
      
      // Return success response
      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          organization: {
            id: organization.id,
            name: organization.name,
            domain: organization.domain,
            tenantId: organization.tenantId
          }
        },
        token: `demo_token_${newUser.id}_${Date.now()}`, // Demo token
        message: 'Login successful'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'User account is disabled' },
        { status: 403 }
      );
    }

    // For demo purposes, accept any password
    // In production, this would verify the password hash
    if (password.length < 1) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: {
          id: organization.id,
          name: organization.name,
          domain: organization.domain,
          tenantId: organization.tenantId
        }
      },
      token: `demo_token_${user.id}_${Date.now()}`, // Demo token
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get users (for testing)
export function getUsers() {
  return users;
} 