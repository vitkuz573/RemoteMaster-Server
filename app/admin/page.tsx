'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Users, Building2, Globe, Mail, Calendar, Lock, AlertTriangle } from 'lucide-react';
import { apiService } from '@/lib/api-service';

interface Organization {
  id: string;
  tenantId?: string;
  name: string;
  domain: string;
  industry?: string;
  size?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  plan: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt?: string;
  registeredAt?: string;
  idpConfig?: {
    provider: string;
    clientId: string;
    domain: string;
  };
  byoidConfig?: any;
}

export default function AdminPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const fetchOrganizations = async () => {
    try {
      const data = await apiService.getOrganizations();
      const orgs = (data.organizations || []).map((org: any) => ({
        ...org,
        status: org.status as 'pending' | 'active' | 'suspended',
        createdAt: org.registeredAt || org.createdAt
      }));
      setOrganizations(orgs);
      
      if (orgs.length === 0) {
        apiService.showInfo('No organizations found');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      // Error notification is already handled by apiService
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('adminAuthenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      fetchOrganizations();
    } else {
      setShowLogin(true);
      setLoading(false);
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Simple admin password check (in production, this would be more secure)
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true);
      setShowLogin(false);
      localStorage.setItem('adminAuthenticated', 'true');
      fetchOrganizations();
    } else {
      setLoginError('Invalid admin password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLogin(true);
    localStorage.removeItem('adminAuthenticated');
    setOrganizations([]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrganizations();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      active: 'default',
      suspended: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const variants = {
      free: 'secondary',
      basic: 'default',
      premium: 'destructive'
    } as const;

    return (
      <Badge variant={variants[plan as keyof typeof variants] || 'secondary'}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">System Administrator Access</CardTitle>
            <CardDescription>
              This area is restricted to system administrators only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Admin Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  {loginError}
                </div>
              )}
              <Button type="submit" className="w-full">
                Access Admin Panel
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="text-sm"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administrator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor registered organizations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleLogout} variant="outline" className="text-red-600 hover:text-red-700">
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => org.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Organizations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => org.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Plan Users</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => org.plan === 'free').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Organizations</CardTitle>
          <CardDescription>
            A list of all organizations that have registered with the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
              <p className="text-muted-foreground">
                Organizations will appear here once they register through the platform.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{org.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {org.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                          {org.domain}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{org.contactName}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {org.contactEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(org.plan)}</TableCell>
                      <TableCell>{getStatusBadge(org.status)}</TableCell>
                      <TableCell>{org.industry}</TableCell>
                      <TableCell>{org.size}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(org.createdAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
