'use client';

import React, { Suspense, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeftRight, Building2 } from 'lucide-react';
import { 
  HomePageDataProvider, 
  HomePageDataLoading 
} from '@/components/data-providers';
import { useAppStore } from '@/lib/stores';
import { useHostSelection } from '@/hooks/use-host-selection';
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
  const hostSelection = useHostSelection();
  const authState = useAuth();
  
  // Memoized data
  const notifications = useNotifications();

  // Handle logout
  const handleLogout = () => {
    authState.logout();
  };

  // Show loading state while checking auth
  if (authState.isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!authState.isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
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
                          onMouseDown={hostSelection.handleMouseDown}
                          ref={(el) => {
                            if (el && !hostSelection.containerRect) {
                            }
                          }}
                        >
                          <SelectionRectangle
                            isDragging={hostSelection.dragState.isDragging}
                            dragStart={hostSelection.dragState.dragStart}
                            dragEnd={hostSelection.dragState.dragEnd}
                          />

                          {/* Host Grid */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {currentUnit.hosts.map((host) => (
                              <HostCard
                                key={host.id}
                                host={host}
                                isSelected={hostSelection.selectedHosts.has(host.id)}
                                onToggle={() => hostSelection.handleHostToggle(host.id)}
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
  );
}