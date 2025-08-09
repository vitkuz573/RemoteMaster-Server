'use client';

import React, { Suspense, useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/auth-gate';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeftRight, Building2 } from 'lucide-react';
import { 
  HomePageDataProvider, 
  HomePageDataLoading 
} from '@/components/data-providers';
import { useAppStore } from '@/lib/stores';
import { useHostSelectionStore } from '@/lib/stores';
import { useDragSelection } from '@/hooks/use-drag-selection';
import { useAuth } from '@/hooks/use-auth';
import { EnhancedHeader } from '@/components/ui/enhanced-header';
import { Footer } from '@/components/ui/footer';
import {
  TreeItem,
  HostCard,
  SelectionRectangle,
  Toolbar,
  EmptyState,
} from '@/components/ui/optimized-components';
import { HostContextMenu } from '@/components/ui/host-context-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Memoized notification data
const useNotifications = () => {
  return useMemo(() => [
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
};

// Main page component
export default function Home() {
  // Custom hooks for state management
  const appState = useAppStore();
  // Combine drag selection behavior with host selection store
  useDragSelection();
  const hostSelection = useHostSelectionStore();

  // Keep container rect in sync for drag selection calculations
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Make sure logout modal is closed when landing on Home
  useEffect(() => {
    appState.setLogoutModalOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateRect = () => hostSelection.setContainerRect(el.getBoundingClientRect());
    updateRect();

    // Observe size changes of the container
    let observer: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      observer = new ResizeObserver(() => updateRect());
      observer.observe(el);
    }

    // Also listen to viewport changes that affect bounding rect
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect, true);

    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect, true);
      observer?.disconnect();
      hostSelection.setContainerRect(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current]);
  const authState = useAuth();
  
  // Memoized data
  const notifications = useNotifications();

  // Handle logout
  const handleLogout = () => {
    // Ensure the modal is closed and state is clean before navigation
    appState.setLogoutModalOpen(false);
    authState.logout();
  };

  return (
    <AuthGate
      fallback={(
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      )}
    >
    <div className="h-screen bg-background overflow-hidden flex flex-col select-none">
        <EnhancedHeader
          showNotifications={true}
          showProfile={true}
          sidebarOpen={appState.sidebarOpen}
          onToggleSidebar={appState.toggleSidebarOpen}
          notifications={notifications}
          notificationCount={appState.notificationCount}
          notificationsEnabled={appState.notificationsEnabled}
          onToggleNotifications={() => appState.setNotificationsEnabled(!appState.notificationsEnabled)}
          onLogoutClick={() => appState.setLogoutModalOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className={`
            ${appState.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${appState.sidebarPosition === 'right' ? 'lg:order-last' : ''}
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:transform-none
          `}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Units</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={appState.toggleSidebar}
                  className="hidden lg:flex"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <Suspense fallback={<HomePageDataLoading />}>
                  <HomePageDataProvider>
                    {({ organizations }) => (
                      <div className="space-y-1">
                        {(() => {
                          const unitsArray = Object.entries(organizations).flatMap(([, org]: any) =>
                            Object.entries(org.organizationalUnits)
                          );
                          if (unitsArray.length === 0) {
                            return <p className="text-sm text-muted-foreground">No units available</p>;
                          }
                          return unitsArray.map(([unitId, unit]: any) => (
                            <TreeItem
                              key={unitId}
                              title={unit.name}
                              hosts={unit.hosts.length}
                              onClick={() => hostSelection.setSelectedOrganizationalUnit(unitId)}
                              isSelected={hostSelection.selectedOrganizationalUnit === unitId}
                            />
                          ));
                        })()}
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
              <Toolbar
                selectedUnit={hostSelection.selectedOrganizationalUnit}
                selectedHostsCount={hostSelection.selectedHosts.size}
                onSelectAll={hostSelection.selectAllHosts}
                onClear={hostSelection.clearSelection}
              />

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4">
                <Suspense fallback={<HomePageDataLoading />}>
                  <HomePageDataProvider>
                    {({ organizations }) => {
                      const selectedUnit = hostSelection.selectedOrganizationalUnit;
                      const currentOrg = Object.values(organizations).find(org => 
                        Object.keys(org.organizationalUnits).includes(selectedUnit || '')
                      );
                      const currentUnit = selectedUnit && currentOrg ? currentOrg.organizationalUnits[selectedUnit] : null;

                                             if (!selectedUnit || !currentUnit) {
                         return (
                           <EmptyState
                             title="No Organizational Unit Selected"
                             description="Please select an organizational unit from the sidebar to view its hosts."
                             icon={<Building2 className="h-12 w-12" />}
                           />
                         );
                       }

                      return (
                        <div 
                          className="relative"
                          onMouseDownCapture={hostSelection.handleMouseDown}
                          ref={containerRef}
                        >
                          <SelectionRectangle
                            isDragging={hostSelection.dragState.isDragging}
                            dragStart={hostSelection.dragState.dragStart}
                            dragEnd={hostSelection.dragState.dragEnd}
                          />

                          {/* Host Grid */}
                          <HostGridWithContext
                            hosts={currentUnit.hosts}
                          />
                        </div>
                      );
                    }}
                  </HomePageDataProvider>
                </Suspense>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <Footer />

        {/* Logout Confirmation Dialog */}
        <Dialog open={appState.logoutModalOpen} onOpenChange={appState.setLogoutModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to logout? You will need to log in again to access the system.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => appState.setLogoutModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLogout}>
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGate>
  );
}

// Host grid with context menu logic
function HostGridWithContext({ hosts }: { hosts: Array<{ id: string; name: string; status: string; type: string; ip?: string; ipAddress?: string; mac?: string; internetId?: string }> }) {
  const hostSelection = useHostSelectionStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextHostId, setContextHostId] = useState<string | null>(null);
  const [propertiesHostId, setPropertiesHostId] = useState<string | null>(null);
  const router = useRouter();

  const selectedCount = hostSelection.selectedHosts.size;
  const canShowProperties = selectedCount === 1;

  const handleContextMenu = useCallback((e: React.MouseEvent, host: { id: string }) => {
    e.preventDefault();
    // If the clicked host is not in the selection, select only it
    if (!hostSelection.selectedHosts.has(host.id)) {
      hostSelection.clearSelection();
      hostSelection.handleHostToggle(host.id);
    }
    hostSelection.setJustDragged(false);
    setContextHostId(host.id);
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }, [hostSelection]);

  const getPrimaryHost = useCallback(() => {
    const ids = hostSelection.selectedHosts.size > 0
      ? Array.from(hostSelection.selectedHosts)
      : (contextHostId ? [contextHostId] : []);
    if (ids.length === 0) return null;

    const firstId = ids[0] as string | undefined;
    const host = firstId ? hosts.find(h => h.id === firstId) : undefined;
    return host ?? null;
  }, [hostSelection.selectedHosts, contextHostId, hosts]);

  const handleConnectIp = useCallback(() => {
    const host = getPrimaryHost();
    if (!host) return;
    const ip = host.ip || (host as any).ipAddress;
    if (!ip) {
      toast.error('No IP address available for this host');
      return;
    }
    const url = `/device/ip/${encodeURIComponent(ip)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      router.push(url);
    }
  }, [getPrimaryHost, router]);

  const handleConnectInternetId = useCallback(() => {
    const host = getPrimaryHost();
    if (!host) return;
    const internetId = (host as any).internetId as string | undefined;
    if (!internetId) {
      toast.error('No Internet ID available for this host');
      return;
    }
    const url = `/device/internetid/${encodeURIComponent(internetId)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      router.push(url);
    }
  }, [getPrimaryHost, router]);

  const handleProperties = useCallback(() => {
    if (hostSelection.selectedHosts.size !== 1) return;
    const onlyId = Array.from(hostSelection.selectedHosts)[0] as string | undefined;
    if (onlyId) setPropertiesHostId(onlyId);
  }, [hostSelection.selectedHosts]);

  const currentHost = propertiesHostId ? hosts.find(h => h.id === propertiesHostId) : null;

  return (
    <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hosts.map((host) => (
          <HostCard
            key={host.id}
            host={host}
            isSelected={hostSelection.selectedHosts.has(host.id)}
            onToggle={() => {
              if (hostSelection.justDragged) {
                hostSelection.setJustDragged(false);
                return;
              }
              hostSelection.handleHostToggle(host.id);
            }}
            onContextMenu={(e) => handleContextMenu(e, host)}
          />
        ))}
      </div>
      <HostContextMenu
        open={menuOpen}
        x={menuPos.x}
        y={menuPos.y}
        onClose={() => setMenuOpen(false)}
        onConnectIp={handleConnectIp}
        onConnectInternetId={handleConnectInternetId}
        onProperties={handleProperties}
        canShowProperties={canShowProperties}
        hasIp={(() => { const h = getPrimaryHost(); return !!(h && (h.ip || (h as any).ipAddress)); })()}
        hasInternetId={(() => { const h = getPrimaryHost(); return !!(h && (h as any).internetId); })()}
      />
      {/* Properties Dialog */}
      <Dialog open={!!currentHost} onOpenChange={(open) => { if (!open) setPropertiesHostId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Host Properties</DialogTitle>
            <DialogDescription>Basic network identity</DialogDescription>
          </DialogHeader>
          {currentHost && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="host-name">Name</Label>
                <Input id="host-name" value={currentHost.name} readOnly className="select-text" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="host-ip">IP</Label>
                <Input id="host-ip" value={(currentHost.ip || (currentHost as any).ipAddress) ?? ''} placeholder="N/A" readOnly className="select-text" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="host-mac">MAC</Label>
                <Input id="host-mac" value={currentHost.mac ?? ''} placeholder="N/A" readOnly className="select-text" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="host-id">Internet ID</Label>
                <Input id="host-id" value={(currentHost as any).internetId ?? ''} placeholder="N/A" readOnly className="select-text" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPropertiesHostId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
