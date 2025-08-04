'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { NotificationPanel } from '@/components/ui/notification-panel';
import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen, ArrowLeftRight, ChevronDown, ChevronRight, LogOut, User, Settings, Building2 } from 'lucide-react';
import { appConfig } from '@/lib/app-config';
import { useHeader } from '@/contexts/header-context';
import { mockApiService } from '@/lib/api-service-mock';
import { apiService } from '@/lib/api-service';
import { API_CONFIG } from '@/lib/api-config';
import { 
  ApiProvider, 
  HomePageDataProvider, 
  HomePageDataLoading 
} from '@/components/data-providers';

export default function Home() {
  const router = useRouter();
  const [sidebarPosition, setSidebarPosition] = React.useState<'left' | 'right'>('left');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [notificationCount, setNotificationCount] = React.useState(3);
  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const { hideHeader } = useHeader();

  const [selectedOrganizationalUnit, setSelectedOrganizationalUnit] = React.useState<string | null>(null);
  const [selectedHosts, setSelectedHosts] = React.useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = React.useState<{ x: number; y: number } | null>(null);
  const [containerRect, setContainerRect] = React.useState<DOMRect | null>(null);

  // API service instance based on configuration
  const api = API_CONFIG.USE_MOCK_API ? mockApiService : apiService;

  React.useEffect(() => {
    // Load sidebar position from localStorage
    const savedPosition = localStorage.getItem('sidebarPosition');
    if (savedPosition === 'left' || savedPosition === 'right') {
      setSidebarPosition(savedPosition);
    }
  }, []);

  React.useEffect(() => {
    // Save sidebar position to localStorage
    localStorage.setItem('sidebarPosition', sidebarPosition);
  }, [sidebarPosition]);

  // Notification data
  const notifications = React.useMemo(() => [
    {
      id: '1',
      title: 'System Update',
      message: 'New version available',
      time: '2 min ago',
      type: 'info' as const
    },
    {
      id: '2',
      title: 'Connection Lost',
      message: 'Server connection interrupted',
      time: '5 min ago',
      type: 'warning' as const
    },
    {
      id: '3',
      title: 'Task Completed',
      message: 'Background task finished successfully',
      time: '10 min ago',
      type: 'success' as const
    }
  ], []);

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && dragStart && containerRect) {
      const currentX = e.clientX - containerRect.left;
      const currentY = e.clientY - containerRect.top;
      setDragEnd({ x: currentX, y: currentY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      updateSelection(dragStart, dragEnd);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, containerRect]);

  const checkAuth = () => {
    // Simulate authentication check
    setTimeout(() => {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        setIsAuthenticated(true);
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
      setIsCheckingAuth(false);
    }, 1000);
  };

  React.useEffect(() => {
    checkAuth();
  }, [router]);

  const toggleSidebar = () => {
    setSidebarPosition(prev => prev === 'left' ? 'right' : 'left');
  };

  const toggleSidebarOpen = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const handleOrganizationalUnitClick = (unitId: string) => {
    setSelectedOrganizationalUnit(unitId);
  };

  const getSelectedOrganizationalUnit = () => {
    return selectedOrganizationalUnit;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRect) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragStart({ x, y });
    setDragEnd({ x, y });
    setIsDragging(true);
  };

  const updateSelection = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    if (!containerRect) return;

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    // Find hosts within the selection rectangle
    const hostElements = document.querySelectorAll('[data-host-id]');
    const newSelection = new Set<string>();

    hostElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementX = rect.left - containerRect.left;
      const elementY = rect.top - containerRect.top;

      if (
        elementX >= minX &&
        elementX + rect.width <= maxX &&
        elementY >= minY &&
        elementY + rect.height <= maxY
      ) {
        const hostId = element.getAttribute('data-host-id');
        if (hostId) {
          newSelection.add(hostId);
        }
      }
    });

    setSelectedHosts(newSelection);
  };

  const handleHostToggle = (hostId: string) => {
    setSelectedHosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hostId)) {
        newSet.delete(hostId);
      } else {
        newSet.add(hostId);
      }
      return newSet;
    });
  };

  const selectAllHosts = () => {
    const hostElements = document.querySelectorAll('[data-host-id]');
    const allHostIds = Array.from(hostElements).map(el => el.getAttribute('data-host-id')).filter(Boolean) as string[];
    setSelectedHosts(new Set(allHostIds));
  };

  const clearSelection = () => {
    setSelectedHosts(new Set());
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <ApiProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebarOpen}
                className="lg:hidden"
              >
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-primary" />
                                 <h1 className="text-xl font-semibold">{appConfig.name}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Panel */}
                             <NotificationPanel
                 notifications={notifications}
                 count={notificationCount}
                 enabled={notificationsEnabled}
                 onToggleEnabled={() => setNotificationsEnabled(!notificationsEnabled)}
               />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>User</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLogoutModalOpen(true)}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <aside className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarPosition === 'right' ? 'lg:order-last' : ''}
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:transform-none
          `}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Organizations</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="hidden lg:flex"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <Suspense fallback={<HomePageDataLoading />}>
                  <HomePageDataProvider>
                    {({ organizations }) => (
                      <div className="space-y-2">
                        {Object.entries(organizations).map(([orgId, org]) => (
                          <div key={orgId} className="space-y-2">
                            <h3 className="font-medium text-sm text-muted-foreground">{org.name}</h3>
                            <div className="space-y-1">
                              {Object.entries(org.organizationalUnits).map(([unitId, unit]) => (
                                <TreeItem
                                  key={unitId}
                                  title={unit.name}
                                  hosts={unit.hosts.length}
                                  onClick={() => handleOrganizationalUnitClick(unitId)}
                                  isSelected={selectedOrganizationalUnit === unitId}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </HomePageDataProvider>
                </Suspense>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Toolbar */}
              <div className="border-b bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold">
                      {getSelectedOrganizationalUnit() ? 'Host Management' : 'Select an Organizational Unit'}
                    </h2>
                    {selectedHosts.size > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {selectedHosts.size} host{selectedHosts.size !== 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={selectAllHosts}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-auto p-4">
                <Suspense fallback={<HomePageDataLoading />}>
                  <HomePageDataProvider>
                    {({ organizations }) => {
                      const selectedUnit = getSelectedOrganizationalUnit();
                      const currentOrg = Object.values(organizations).find(org => 
                        Object.keys(org.organizationalUnits).includes(selectedUnit || '')
                      );
                      const currentUnit = selectedUnit && currentOrg ? currentOrg.organizationalUnits[selectedUnit] : null;

                      if (!selectedUnit || !currentUnit) {
                        return (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">No Organizational Unit Selected</h3>
                              <p className="text-muted-foreground">
                                Please select an organizational unit from the sidebar to view its hosts.
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div 
                          className="relative min-h-full"
                          onMouseDown={handleMouseDown}
                          ref={(el) => {
                            if (el && !containerRect) {
                              setContainerRect(el.getBoundingClientRect());
                            }
                          }}
                        >
                          {/* Selection Rectangle */}
                          {isDragging && dragStart && dragEnd && (
                            <div
                              className="absolute border-2 border-primary bg-primary/10 pointer-events-none z-10"
                              style={{
                                left: Math.min(dragStart.x, dragEnd.x),
                                top: Math.min(dragStart.y, dragEnd.y),
                                width: Math.abs(dragEnd.x - dragStart.x),
                                height: Math.abs(dragEnd.y - dragStart.y),
                              }}
                            />
                          )}

                          {/* Host Grid */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {currentUnit.hosts.map((host) => (
                              <HostCard
                                key={host.id}
                                host={host}
                                isSelected={selectedHosts.has(host.id)}
                                onToggle={() => handleHostToggle(host.id)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    }}
                  </HomePageDataProvider>
                </Suspense>
              </div>
            </div>
          </main>
        </div>

        {/* Logout Confirmation Dialog */}
        <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to logout? You will need to log in again to access the system.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLogoutModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLogout}>
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ApiProvider>
  );
}

function Sidebar({ onLogoutClick }: { onLogoutClick: () => void }) {
  return (
    <div className="w-64 bg-card border-r h-full">
      <div className="p-4">
        <h2 className="font-semibold mb-4">Navigation</h2>
        <nav className="space-y-2">
          <SidebarLink href="/">Dashboard</SidebarLink>
          <SidebarLink href="/admin">Admin</SidebarLink>
          <SidebarLink href="/setup">Setup</SidebarLink>
        </nav>
      </div>
    </div>
  );
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
      {children}
    </Link>
  );
}

function TreeItem({ title, hosts, onClick, isSelected }: { 
  title: string; 
  hosts: number; 
  onClick: () => void; 
  isSelected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors
        ${isSelected 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }
      `}
    >
      <span className="flex items-center">
        <ChevronRight className="h-3 w-3 mr-2" />
        {title}
      </span>
      <span className="text-xs bg-muted px-2 py-1 rounded">
        {hosts}
      </span>
    </button>
  );
}

function HostCard({ host, isSelected, onToggle }: {
  host: { id: string; name: string; status: string; type: string };
  isSelected: boolean;
  onToggle: () => void;
}) {
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'web':
        return <Building2 className="h-4 w-4" />;
      case 'database':
        return <Building2 className="h-4 w-4" />;
      case 'application':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  return (
    <div
      data-host-id={host.id}
      className={`
        relative p-4 border rounded-lg cursor-pointer transition-all
        ${isSelected 
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50'
        }
      `}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox checked={isSelected} onChange={onToggle} />
          <div>
            <h3 className="font-medium">{host.name}</h3>
            <p className="text-sm text-muted-foreground">{host.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getTypeIcon(host.type)}
          <StatusIndicator status={host.status} />
        </div>
      </div>
    </div>
  );
}