'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen, ArrowLeftRight, Bell, BellOff, ChevronDown, ChevronRight, LogOut, User, Settings, Building2 } from 'lucide-react';
import { appConfig } from '@/lib/app-config';

export default function Home() {
  const router = useRouter();
  const [sidebarPosition, setSidebarPosition] = React.useState<'left' | 'right'>('left');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [notificationCount, setNotificationCount] = React.useState(3);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  const [selectedOrganizationalUnit, setSelectedOrganizationalUnit] = React.useState<string | null>(null);
  const [selectedHosts, setSelectedHosts] = React.useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = React.useState<{ x: number; y: number } | null>(null);
  const [containerRect, setContainerRect] = React.useState<DOMRect | null>(null);
  const [notificationButtonRect, setNotificationButtonRect] = React.useState<DOMRect | null>(null);

  
  // Application configuration (imported from centralized config)
  // Note: Import moved to top of file

  // Mock user data - replace with actual user data
  const currentUser = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Administrator',
    avatar: null
  };

  // Mock data structure
  const organizations = {
    'acme-corp': {
      name: 'Acme Corp',
      organizationalUnits: {
        'production': {
          name: 'Production',
          hosts: [
            { id: 'web-server-01', name: 'web-server-01', status: 'online', type: 'web' },
            { id: 'db-server-01', name: 'db-server-01', status: 'online', type: 'database' },
            { id: 'app-server-01', name: 'app-server-01', status: 'offline', type: 'application' }
          ]
        },
        'development': {
          name: 'Development',
          hosts: [
            { id: 'dev-server-01', name: 'dev-server-01', status: 'online', type: 'development' },
            { id: 'dev-server-02', name: 'dev-server-02', status: 'offline', type: 'development' }
          ]
        },
        'testing': {
          name: 'Testing',
          hosts: [
            { id: 'test-server-01', name: 'test-server-01', status: 'online', type: 'testing' },
            { id: 'test-server-02', name: 'test-server-02', status: 'online', type: 'testing' },
            { id: 'test-server-03', name: 'test-server-03', status: 'offline', type: 'testing' }
          ]
        }
      }
    }
  };

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

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setNotificationsOpen(false);
    };

    if (notificationsOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [notificationsOpen]);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStart) {
        setDragEnd({ x: e.clientX, y: e.clientY });
        updateSelection(dragStart, { x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
        setContainerRect(null);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Check authentication on component mount
  React.useEffect(() => {
    const checkAuth = () => {
      setIsCheckingAuth(true);
      try {
        const authToken = localStorage.getItem('authToken');
        const organizationData = localStorage.getItem('organizationRegistration');
        
        if (authToken && organizationData) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          // Redirect to login if not authenticated
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        router.push('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const toggleSidebar = () => {
    setSidebarPosition(prev => prev === 'left' ? 'right' : 'left');
  };

  const toggleSidebarOpen = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleNotifications = (button?: HTMLElement) => {
    if (button && !notificationsOpen) {
      setNotificationButtonRect(button.getBoundingClientRect());
    }
    setNotificationsOpen(prev => !prev);

  };



  const handleLogout = () => {
    setLogoutModalOpen(false);
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('organizationRegistration');
    // Redirect to login
    router.push('/login');
  };

  const handleOrganizationalUnitClick = (unitId: string) => {
    setSelectedOrganizationalUnit(unitId);
    setSelectedHosts(new Set());
    setNotificationsOpen(false);
  };

  const getSelectedOrganizationalUnit = () => {
    if (!selectedOrganizationalUnit) return null;
    return (organizations as any)['acme-corp'].organizationalUnits[selectedOrganizationalUnit];
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContainerRect(rect);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragEnd({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const updateSelection = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const hostCards = document.querySelectorAll('[data-host-id]');
    const newSelectedHosts = new Set<string>();

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    hostCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      if (cardCenterX >= minX && cardCenterX <= maxX && 
          cardCenterY >= minY && cardCenterY <= maxY) {
        const hostId = card.getAttribute('data-host-id');
        if (hostId) {
          newSelectedHosts.add(hostId);
        }
      }
    });

    setSelectedHosts(newSelectedHosts);
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
    const unit = getSelectedOrganizationalUnit();
    if (unit?.hosts) {
      setSelectedHosts(new Set(unit.hosts.map((host: any) => host.id)));
    }
  };

  const clearSelection = () => {
    setSelectedHosts(new Set());
  };

  const Portal = ({ children }: { children: React.ReactNode }) => {
    if (typeof window === 'undefined') return null;
    return createPortal(children, document.body);
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="bg-background flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null; // Router will handle redirect
  }

  return (
    <div className="bg-background flex flex-col">
      {/* Header / App Bar */}
      <header className="border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 sticky top-0 z-50">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-4">
            {/* Left sidebar toggle button positioned to the left of title */}
            {sidebarPosition === 'left' && (
              <Button size="sm" variant="outline" onClick={toggleSidebarOpen}>
                {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
              </Button>
            )}
            <h1 className="text-xl font-semibold">{appConfig.name}</h1>
          </div>
          
          <div className="flex-1"></div>
            
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNotifications(e.currentTarget);
                }}
              >
                {notificationsEnabled ? <Bell /> : <BellOff />}
                {notificationsEnabled && notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>
            </div>
            
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
                  ) : (
                    <User size={14} className="text-primary" />
                  )}
                </div>
                <span className="text-sm font-medium">{currentUser.name}</span>
              </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                    ) : (
                      <User size={20} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{currentUser.name}</h3>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    <p className="text-xs text-primary font-medium">{currentUser.role}</p>
                  </div>
            </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/login')}>
                  <Building2 size={16} className="mr-2" />
                  Switch Organization
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setLogoutModalOpen(true)}
                  className="text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button size="sm" variant="outline" onClick={toggleSidebar}>
              <ArrowLeftRight />
            </Button>
            
            {sidebarPosition === 'right' && (
              <Button size="sm" variant="outline" onClick={toggleSidebarOpen}>
                {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - positioned at true left edge */}
        {sidebarPosition === 'left' && (
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? 'w-64' : 'w-0'}`}>
            {sidebarOpen && <Sidebar onLogoutClick={() => setLogoutModalOpen(true)} />}
          </div>
        )}

        {/* Fixed Tree Panel */}
        <div className="w-64 border-r bg-accent/5 p-4 overflow-y-auto flex-shrink-0">
          <h2 className="text-lg font-semibold mb-4">Organizational Units</h2>
          <div className="space-y-2">
            <TreeItem
              title="Production"
              hosts={3}
              onClick={() => handleOrganizationalUnitClick('production')}
              isSelected={selectedOrganizationalUnit === 'production'}
            />
            <TreeItem
              title="Development"
              hosts={2}
              onClick={() => handleOrganizationalUnitClick('development')}
              isSelected={selectedOrganizationalUnit === 'development'}
            />
            <TreeItem
              title="Testing"
              hosts={3}
              onClick={() => handleOrganizationalUnitClick('testing')}
              isSelected={selectedOrganizationalUnit === 'testing'}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <div 
            className="flex-1 overflow-auto p-6 select-none"
            onMouseDown={handleMouseDown}
          >
            {selectedOrganizationalUnit ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">
                    {getSelectedOrganizationalUnit()?.name} Hosts
                  </h2>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={selectAllHosts}
                      disabled={!getSelectedOrganizationalUnit()?.hosts?.length}
                    >
                      Select All ({getSelectedOrganizationalUnit()?.hosts?.length || 0})
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={clearSelection}
                      disabled={selectedHosts.size === 0}
                    >
                      Clear Selection ({selectedHosts.size})
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {getSelectedOrganizationalUnit()?.hosts?.map((host: any) => (
                    <HostCard
                      key={host.id}
                      host={host}
                      isSelected={selectedHosts.has(host.id)}
                      onToggle={() => handleHostToggle(host.id)}
                    />
                  ))}
                </div>
                
                {/* Selection Rectangle */}
                {isDragging && dragStart && dragEnd && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-200/20 pointer-events-none"
                    style={{
                      position: 'fixed',
                      left: Math.min(dragStart.x, dragEnd.x),
                      top: Math.min(dragStart.y, dragEnd.y),
                      width: Math.abs(dragEnd.x - dragStart.x),
                      height: Math.abs(dragEnd.y - dragStart.y),
                      zIndex: 1000
                    }}
                  />
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
                <p className="text-muted-foreground">Select an organizational unit to view hosts.</p>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - positioned at true right edge */}
        {sidebarPosition === 'right' && (
          <div className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${sidebarOpen ? 'w-64' : 'w-0'}`}>
            {sidebarOpen && <Sidebar onLogoutClick={() => setLogoutModalOpen(true)} />}
          </div>
        )}
      </div>



      {/* Logout Dialog */}
      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to login again to access the application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setLogoutModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
              >
                Logout
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Portals for panels */}
      {notificationsOpen && notificationButtonRect && (
        <Portal>
          <div 
            className="fixed w-80 rounded-md border bg-background shadow-lg"
            style={{
              top: notificationButtonRect.bottom + 8,
              right: window.innerWidth - notificationButtonRect.right,
              zIndex: 999999
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Notifications</h3>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsEnabled(prev => !prev);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  {notificationsEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notificationsEnabled ? (
                  <>
                    <NotificationItem 
                      title="System Update" 
                      message="New version available" 
                      time="2 min ago"
                      type="info"
                    />
                    <NotificationItem 
                      title="Connection Lost" 
                      message="Server connection interrupted" 
                      time="5 min ago"
                      type="warning"
                    />
                    <NotificationItem 
                      title="Task Completed" 
                      message="Background task finished successfully" 
                      time="10 min ago"
                      type="success"
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Notifications are disabled
                  </p>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}


    </div>
  );
}

function Sidebar({ onLogoutClick }: { onLogoutClick: () => void }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-2 border-r bg-accent/10 p-4 dark:bg-accent/20 lg:gap-4 lg:p-6">
      <nav className="flex flex-col gap-2 flex-1">
        <SidebarLink href="/admin">Tenant Management</SidebarLink>
        <SidebarLink href="/example">Footer Demo</SidebarLink>
        <SidebarLink href="/api-demo">API Demo</SidebarLink>
        {/* Add more links here */}
      </nav>
      
      {/* Logout section */}
      <div className="border-t pt-4">
        <button
          onClick={onLogoutClick}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
    >
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
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </Button>
        <Button
          variant="ghost"
          onClick={onClick}
          className={`flex-1 justify-start h-8 px-2 text-sm font-normal ${
            isSelected ? 'bg-primary/10 text-primary font-medium hover:bg-primary/15' : ''
          }`}
        >
          📁 {title} ({hosts} hosts)
        </Button>
      </div>
      {isExpanded && (
        <div className="ml-6 space-y-1">
          <div className="text-xs text-muted-foreground px-2 py-1">
            🖥️ {hosts} hosts available
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ title, message, time, type }: {
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
}) {
  const getTypeStyles = () => {
    switch (type) {
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20';
    }
  };

  return (
    <div className={`p-3 rounded-md border ${getTypeStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{message}</p>
        </div>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}

function HostCard({ host, isSelected, onToggle }: {
  host: { id: string; name: string; status: string; type: string };
  isSelected: boolean;
  onToggle: () => void;
}) {
  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-red-500';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return '🌐';
      case 'database': return '🗄️';
      case 'application': return '📱';
      case 'development': return '💻';
      case 'testing': return '🧪';
      default: return '🖥️';
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
      }`}
      data-host-id={host.id}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(host.type)}</span>
          <div>
            <h3 className="font-medium text-sm">{host.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{host.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(host.status)}`} />
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="text-xs">
        <span className={`px-2 py-1 rounded-full ${host.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
          {host.status}
        </span>
      </div>
    </div>
  );
}