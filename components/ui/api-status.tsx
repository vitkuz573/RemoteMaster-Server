/**
 * API Status Component
 * Displays real-time API connection status and information
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useApiContext } from '@/contexts/api-context';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw 
} from 'lucide-react';

interface ApiStatusProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function ApiStatus({ 
  className = "", 
  showDetails = false, 
  compact = false 
}: ApiStatusProps) {
  const { state } = useApiContext();

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (compact) {
    const getStatusColor = () => {
      if (state.isConnecting) return 'bg-yellow-500';
      if (state.isConnected) return 'bg-green-500';
      return 'bg-red-500';
    };

    const getStatusText = () => {
      if (state.isConnecting) return 'API Connecting...';
      if (state.isConnected) return 'API Connected';
      return 'API Disconnected';
    };

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-xs text-muted-foreground">
              {getStatusText()}
            </span>
            {(state.pendingRequests > 0 || state.isConnecting) && (
              <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={
                state.isConnecting ? 'secondary' :
                state.isConnected ? 'default' : 'destructive'
              }>
                {state.isConnecting ? 'Connecting...' :
                 state.isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Last sync:</span>
              <span className="text-xs">{formatLastSync(state.lastSync)}</span>
            </div>
            {state.pendingRequests > 0 && (
              <div className="flex items-center gap-2">
                <span>Pending:</span>
                <span className="text-xs">{state.pendingRequests}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {state.isConnecting ? (
            <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
          ) : state.isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          API Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connection</span>
          <Badge variant={
            state.isConnecting ? 'secondary' :
            state.isConnected ? 'default' : 'destructive'
          }>
            {state.isConnecting ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Connecting...
              </>
            ) : state.isConnected ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Sync</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm">{formatLastSync(state.lastSync)}</span>
          </div>
        </div>

        {/* Pending Requests */}
        {state.pendingRequests > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pending</span>
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
              <span className="text-sm">{state.pendingRequests}</span>
            </div>
          </div>
        )}

        {/* Recent Errors */}
        {showDetails && state.errors.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Recent Errors</span>
            <div className="space-y-1">
              {state.errors.slice(-3).map((error, index) => (
                <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 