'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp,
  Settings,
  Activity,
  Calendar,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { appConfig } from '@/lib/app-config';
import { pricingPlans } from '@/lib/pricing-plans';

export default function TenantPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedPlan, setSelectedPlan] = React.useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedTenant, setSelectedTenant] = React.useState<any>(null);

  // Application configuration (imported from centralized config)

  // Mock tenant data for SaaS dashboard
  const tenants = [
    {
      id: 'tenant-001',
      name: 'Acme Corporation',
      domain: 'acme.corp',
      plan: 'Enterprise',
      status: 'active',
      users: 127,
      hosts: 45,
      lastActive: '2024-01-15',
      billing: 2599.99,
      usage: 78,
      contact: {
        name: 'John Smith',
        email: 'john@acme.corp',
        avatar: null
      }
    },
    {
      id: 'tenant-002', 
      name: 'TechStart Inc',
      domain: 'techstart.io',
      plan: 'Professional',
      status: 'active',
      users: 23,
      hosts: 12,
      lastActive: '2024-01-15',
      billing: 299.99,
      usage: 45,
      contact: {
        name: 'Sarah Johnson',
        email: 'sarah@techstart.io',
        avatar: null
      }
    },
    {
      id: 'tenant-003',
      name: 'DevOps Ltd',
      domain: 'devops.ltd',
      plan: 'Starter',
      status: 'trial',
      users: 8,
      hosts: 3,
      lastActive: '2024-01-14',
      billing: 0,
      usage: 23,
      contact: {
        name: 'Mike Wilson',
        email: 'mike@devops.ltd',
        avatar: null
      }
    },
    {
      id: 'tenant-004',
      name: 'Global Systems',
      domain: 'globalsys.com',
      plan: 'Enterprise',
      status: 'suspended',
      users: 89,
      hosts: 31,
      lastActive: '2024-01-10',
      billing: 2599.99,
      usage: 92,
      contact: {
        name: 'Lisa Brown',
        email: 'lisa@globalsys.com',
        avatar: null
      }
    }
  ];

  // Calculate dashboard statistics
  const stats = {
    totalTenants: tenants.length,
    activeTenants: tenants.filter(t => t.status === 'active').length,
    totalRevenue: tenants.reduce((sum, t) => sum + t.billing, 0),
    totalUsers: tenants.reduce((sum, t) => sum + t.users, 0)
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan === 'all' || tenant.plan.toLowerCase() === selectedPlan;
    return matchesSearch && matchesPlan;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      trial: { variant: "secondary" as const, icon: AlertCircle, color: "text-yellow-600" },
      suspended: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.active;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={12} className={config.color} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      'Starter': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'Professional': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'Enterprise': 'bg-gold-100 text-gold-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    };
    
    return (
      <Badge className={colors[plan as keyof typeof colors] || colors.Starter}>
        {plan}
      </Badge>
    );
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-semibold">Tenant Management</h1>
              <p className="text-sm text-muted-foreground">Manage your SaaS tenants and subscriptions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Tenant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Tenant</DialogTitle>
                  <DialogDescription>
                    Add a new tenant to your SaaS platform
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant-name">Tenant Name</Label>
                    <Input id="tenant-name" placeholder="Company Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant-domain">Domain</Label>
                    <Input id="tenant-domain" placeholder="company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant-plan">Subscription Plan</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {pricingPlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - {plan.price === 0 ? 'Free' : `$${plan.price}/user/month`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Primary Contact</Label>
                    <Input id="contact-name" placeholder="Contact Name" />
                  </div>
        <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input id="contact-email" type="email" placeholder="contact@company.com" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateModalOpen(false)}>
                    Create Tenant
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTenants}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeTenants} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12.3% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all tenants
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+23%</div>
                  <p className="text-xs text-muted-foreground">
                    Quarter over quarter
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest tenant activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Acme Corporation upgraded to Enterprise</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New tenant TechStart Inc registered</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">DevOps Ltd trial period ends in 3 days</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-6">
            {/* Filters and Search */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
          />
        </div>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tenants Table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Hosts</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={tenant.contact.avatar || ''} />
                            <AvatarFallback>
                              {tenant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{tenant.name}</div>
                            <div className="text-sm text-muted-foreground">{tenant.domain}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell>{tenant.users}</TableCell>
                      <TableCell>{tenant.hosts}</TableCell>
                      <TableCell>
                        <div className="w-16">
                          <Progress value={tenant.usage} className="h-2" />
                          <span className="text-xs text-muted-foreground">{tenant.usage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>${tenant.billing.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tenant.lastActive}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Overview</CardTitle>
                <CardDescription>Revenue and subscription management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Billing Dashboard</h3>
                  <p className="text-muted-foreground">
                    Comprehensive billing features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Usage metrics and performance insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Advanced analytics and reporting features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
