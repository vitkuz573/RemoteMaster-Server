'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiStatus } from '@/components/ui/api-status';
import { DynamicData, DataRenderers } from '@/components/ui/dynamic-data';
import { useApiContext } from '@/contexts/api-context';
import { dynamicApiClient } from '@/lib/dynamic-api-client';
import { appConfig } from '@/lib/app-config';
import { 
  Activity, 
  Server, 
  Users, 
  Database, 
  Settings,
  Play,
  Pause,
  RefreshCw,
  Globe,
  Link
} from 'lucide-react';

export default function ApiDemoPage() {
  const { state, setConnected, setConnecting, setApiUrl, clearErrors } = useApiContext();
  const [apiUrlInput, setApiUrlInput] = React.useState(state.apiUrl || '');
  const [testingConnection, setTestingConnection] = React.useState(false);
  
  // Get the effective API URL (user input or default config)
  const effectiveApiUrl = state.apiUrl || appConfig.endpoints.api;

  // Example API configurations with mock data for demo
  const apiConfigs = [
    {
      endpoint: '/api/system/status',
      title: 'System Status',
      refreshInterval: 30000, // 30 seconds
      render: DataRenderers.status,
      transform: () => ({ status: 'online', message: 'All systems operational' })
    },
    {
      endpoint: '/api/metrics/performance',
      title: 'Performance Metrics',
      refreshInterval: 10000, // 10 seconds
      render: DataRenderers.metric,
      transform: () => ({ value: 85, trend: 5.2, unit: '%' })
    },
    {
      endpoint: '/api/hosts/list',
      title: 'Active Hosts',
      refreshInterval: 15000, // 15 seconds
      render: DataRenderers.list,
      transform: () => [
        { id: '1', name: 'Web Server 01', status: 'online' },
        { id: '2', name: 'Database Server', status: 'online' },
        { id: '3', name: 'Load Balancer', status: 'online' },
        { id: '4', name: 'Backup Server', status: 'offline' }
      ]
    },
    {
      endpoint: '/api/activity/feed',
      title: 'Activity Feed',
      refreshInterval: 20000, // 20 seconds
      render: DataRenderers.activity,
      transform: () => [
        {
          id: '1',
          action: 'User login',
          timestamp: new Date().toISOString(),
          user: 'john.doe'
        },
        {
          id: '2',
          action: 'Configuration updated',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          user: 'admin'
        },
        {
          id: '3',
          action: 'Backup completed',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          user: 'system'
        }
      ]
    },
    {
      endpoint: '/api/system/info',
      title: 'System Information',
      refreshInterval: 60000, // 1 minute
      render: DataRenderers.keyValue,
      transform: () => ({
        version: '2.1.4',
        uptime: '15 days',
        cpu: '45%',
        memory: '2.1GB',
        disk: '75%',
        activeConnections: '127'
      })
    }
  ];

  const handleTestConnection = async () => {
    if (!effectiveApiUrl) {
      console.error('No API URL configured');
      return;
    }

    // Start connecting state
    setConnecting(true);
    setTestingConnection(true);
    
    try {
      // Test connection to the configured API
      const response = await dynamicApiClient.testConnection(effectiveApiUrl, '/health');
      
      if (response.success) {
        // Connection successful
        setConnected(true);
        console.log('Connection test successful:', response.data);
      } else {
        // Connection failed
        setConnected(false);
        console.error('Connection test failed:', response.error);
      }
    } catch (error) {
      // Network error
      setConnected(false);
      console.error('Connection test failed:', error);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleUpdateApiUrl = () => {
    setApiUrl(apiUrlInput);
  };

  const handleToggleConnection = () => {
    if (state.isConnecting) {
      // If connecting, stop the connection attempt
      setConnecting(false);
      setConnected(false);
    } else if (state.isConnected) {
      // If connected, disconnect
      setConnected(false);
    } else {
      // If disconnected, start connecting
      handleTestConnection();
    }
  };

  const handleClearErrors = () => {
    clearErrors();
  };

  // Test with unavailable endpoint for demo purposes
  const handleTestUnavailable = async () => {
    if (!effectiveApiUrl) {
      console.error('No API URL configured');
      return;
    }

    setConnecting(true);
    
    try {
      const response = await dynamicApiClient.get(effectiveApiUrl, '/non-existent-endpoint');
      setConnected(false);
    } catch (error) {
      setConnected(false);
      console.error('Unavailable endpoint test failed:', error);
    }
  };

  // Auto-test connection on page load
  React.useEffect(() => {
    if (!state.isConnected && !state.isConnecting && effectiveApiUrl) {
      handleTestConnection();
    }
  }, [effectiveApiUrl]); // Run when effective API URL changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">API Demo Dashboard</h1>
              <p className="text-muted-foreground">Real-time data from API endpoints</p>
            </div>
            <div className="flex items-center gap-4">
              <ApiStatus compact />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testingConnection}
              >
                {testingConnection ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Server className="w-4 h-4 mr-2" />
                )}
                Test Connection
              </Button>
            </div>
          </div>
        </div>
      </header>

             <div className="container mx-auto px-6 py-8">
         {/* API Configuration */}
         <Card className="mb-8">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Globe className="w-5 h-5" />
               API Configuration
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               <div className="flex gap-4">
                 <div className="flex-1">
                   <Label htmlFor="api-url" className="text-sm font-medium">
                     External API URL
                   </Label>
                   <div className="flex gap-2 mt-1">
                                           <Input
                        id="api-url"
                        type="url"
                        placeholder={appConfig.endpoints.api}
                        value={apiUrlInput}
                        onChange={(e) => setApiUrlInput(e.target.value)}
                      />
                     <Button
                       onClick={handleUpdateApiUrl}
                       disabled={!apiUrlInput.trim()}
                       variant={apiUrlInput.trim() ? "default" : "outline"}
                     >
                       <Link className="w-4 h-4 mr-2" />
                       Update URL
                     </Button>
                   </div>
                   <p className="text-xs text-muted-foreground mt-1">
                     Enter the base URL of your external API (e.g., https://api.example.com)
                   </p>
                 </div>
               </div>
               
                                               <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Current API URL:</span>
                  {effectiveApiUrl ? (
                    <Badge variant="outline" className="font-mono text-xs">
                      {effectiveApiUrl}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not configured</span>
                  )}
                </div>
             </div>
           </CardContent>
         </Card>

         {/* Connection Controls */}
         <Card className="mb-8">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Settings className="w-5 h-5" />
               Connection Controls
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex items-center gap-4">
                               <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">API Connection:</span>
                  <Badge variant={
                    state.isConnecting ? 'secondary' :
                    state.isConnected ? 'default' : 'destructive'
                  }>
                    {state.isConnecting ? 'Connecting...' :
                     state.isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleConnection}
                  disabled={state.isConnecting || !effectiveApiUrl}
                >
                 {state.isConnecting ? (
                   <>
                     <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                     Connecting...
                   </>
                 ) : state.isConnected ? (
                   <>
                     <Pause className="w-4 h-4 mr-2" />
                     Disconnect
                   </>
                 ) : (
                   <>
                     <Play className="w-4 h-4 mr-2" />
                     Connect
                   </>
                 )}
               </Button>
               {state.errors.length > 0 && (
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={handleClearErrors}
                 >
                   Clear Errors ({state.errors.length})
                 </Button>
               )}
                               <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestUnavailable}
                  disabled={state.isConnecting || !effectiveApiUrl}
                >
                 Test Unavailable
               </Button>
             </div>
           </CardContent>
         </Card>

        {/* API Status Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ApiStatus showDetails />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Connection Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                             <div className="flex justify-between">
                 <span className="text-sm text-muted-foreground">Status</span>
                 <Badge variant={
                   state.isConnecting ? 'secondary' :
                   state.isConnected ? 'default' : 'secondary'
                 }>
                   {state.isConnecting ? 'Connecting' :
                    state.isConnected ? 'Active' : 'Inactive'}
                 </Badge>
               </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending Requests</span>
                <span className="text-sm font-medium">{state.pendingRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="text-sm">
                  {state.lastSync ? state.lastSync.toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Error Count</span>
                <span className="text-sm font-medium">{state.errors.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {apiConfigs.map((config) => (
                  <div key={config.endpoint} className="flex items-center justify-between">
                    <span className="text-sm">{config.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {config.refreshInterval ? `${config.refreshInterval / 1000}s` : 'Manual'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

                 {/* Dynamic Data Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   {apiConfigs.map((config) => (
              <DynamicData
                key={config.endpoint}
                config={config}
                baseUrl={effectiveApiUrl}
                showRefreshButton={true}
              />
            ))}
         </div>

        {/* Error Display */}
        {state.errors.length > 0 && (
          <Card className="mt-8 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent API Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {state.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 