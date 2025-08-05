'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedHeader } from '@/components/ui/enhanced-header';
import { useHeaderConfig } from '@/hooks/use-header-config';
import { ArrowLeft, Bell, User, Settings } from 'lucide-react';
import Link from 'next/link';

export default function HeaderDemo() {
  const { applyPreset, applyCustomConfig, resetConfig } = useHeaderConfig();

  const demoNotifications = [
    {
      id: '1',
      title: 'Demo Notification',
      message: 'This is a demo notification',
      time: '2 min ago',
      type: 'info' as const
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <EnhancedHeader
        customTitle="Header Demo"
        customSubtitle="Showcasing different header configurations"
        showNotifications={true}
        showProfile={true}
        showSidebarToggle={false}
        notifications={demoNotifications}
        notificationCount={1}
        notificationsEnabled={true}
      />

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Header Configuration Demo</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                     {/* Default Header */}
           <Card>
             <CardHeader>
               <CardTitle>Default Header</CardTitle>
               <CardDescription>Minimal header (no notifications, no profile)</CardDescription>
             </CardHeader>
             <CardContent>
               <Button 
                 onClick={() => applyPreset('default')}
                 className="w-full"
               >
                 Apply Default
               </Button>
             </CardContent>
           </Card>

          {/* Minimal Header */}
          <Card>
            <CardHeader>
              <CardTitle>Minimal Header</CardTitle>
              <CardDescription>Only title and logo</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => applyPreset('minimal')}
                className="w-full"
                variant="outline"
              >
                Apply Minimal
              </Button>
            </CardContent>
          </Card>

          {/* Notifications Only */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications Only</CardTitle>
              <CardDescription>Header with notifications but no profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => applyPreset('notificationsOnly')}
                className="w-full"
                variant="outline"
              >
                Apply Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Profile Only */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Only</CardTitle>
              <CardDescription>Header with profile but no notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => applyPreset('profileOnly')}
                className="w-full"
                variant="outline"
              >
                Apply Profile
              </Button>
            </CardContent>
          </Card>

                     {/* Dashboard Header */}
           <Card>
             <CardHeader>
               <CardTitle>Dashboard Header</CardTitle>
               <CardDescription>Full header with notifications and profile</CardDescription>
             </CardHeader>
             <CardContent>
               <Button 
                 onClick={() => applyPreset('dashboard')}
                 className="w-full"
                 variant="outline"
               >
                 Apply Dashboard
               </Button>
             </CardContent>
           </Card>

           {/* Custom Title */}
           <Card>
             <CardHeader>
               <CardTitle>Custom Title</CardTitle>
               <CardDescription>Header with custom branding</CardDescription>
             </CardHeader>
             <CardContent>
               <Button 
                 onClick={() => applyCustomConfig({
                   showNotifications: true,
                   showProfile: true,
                   showSidebarToggle: true,
                   customTitle: 'Custom Brand',
                   customSubtitle: 'Your company name here',
                 })}
                 className="w-full"
                 variant="outline"
               >
                 Apply Custom
               </Button>
             </CardContent>
           </Card>

          {/* Reset */}
          <Card>
            <CardHeader>
              <CardTitle>Reset Configuration</CardTitle>
              <CardDescription>Restore default settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={resetConfig}
                className="w-full"
                variant="destructive"
              >
                Reset to Default
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
              <CardDescription>How to use the EnhancedHeader component</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Usage:</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<EnhancedHeader />`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Minimal Header:</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<EnhancedHeader
  showNotifications={false}
  showProfile={false}
  showSidebarToggle={false}
  customTitle="My App"
  customSubtitle="Simple and clean"
/>`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">With Custom Data:</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<EnhancedHeader
  notifications={myNotifications}
  notificationCount={5}
  notificationsEnabled={true}
  onToggleNotifications={handleToggle}
  onLogoutClick={handleLogout}
/>`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 