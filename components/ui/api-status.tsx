/**
 * API Status Component
 * Displays real-time API connection status and information
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useApiAvailability } from '@/hooks/use-api-availability';
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
  const { 
    isApiAvailable: isConnected, 
    isCheckingApi: isConnecting, 
    lastCheckedAt, 
    error 
  } = useApiAvailability();

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
      if (isConnecting) return 'bg-yellow-500';
      if (isConnected) return 'bg-green-500';
      return 'bg-red-500';
    };

    const getStatusText = () => {
      if (isConnecting) return 'API Connecting...';
      if (isConnected) return 'API Connected';
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
            {(isConnecting) && (
              <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={
                isConnecting ? 'secondary' :
                isConnected ? 'default' : 'destructive'
              }>
                {isConnecting ? 'Connecting...' :
                 isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Last sync:</span>
              <span className="text-xs">{formatLastSync(lastSync)}</span>
            </div>
            {isConnecting && (
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <span className="text-xs">Checking…</span>
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
          {isConnecting ? (
            <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
          ) : isConnected ? (
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
            isConnecting ? 'secondary' :
            isConnected ? 'default' : 'destructive'
          }>
            {isConnecting ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Connecting...
              </>
            ) : isConnected ? (
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
            <span className="text-sm">{formatLastSync(lastCheckedAt)}</span>
          </div>
        </div>

        {/* Pending Requests */}
        {isConnecting && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
              <span className="text-sm">Checking…</span>
            </div>
          </div>
        )}

        {/* Recent Errors */}
        {showDetails && !!error && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Recent Errors</span>
            <div className="space-y-1">
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
