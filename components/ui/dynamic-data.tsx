/**
 * Dynamic Data Component
 * Displays real-time data from external API endpoints with automatic refresh
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDynamicApi } from '@/hooks/use-dynamic-api';
import { useApiContext } from '@/contexts/api-context';
import { 
  RefreshCw, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Database
} from 'lucide-react';

interface DynamicDataConfig {
  endpoint: string;
  title: string;
  refreshInterval?: number;
  transform?: (data: any) => any;
  render: (data: any, loading: boolean, error: string | null) => React.ReactNode;
}

interface DynamicDataProps {
  config: DynamicDataConfig;
  baseUrl: string;
  className?: string;
  showRefreshButton?: boolean;
}

export function DynamicData({ 
  config, 
  baseUrl,
  className = "",
  showRefreshButton = true 
}: DynamicDataProps) {
  const { state, setConnected, setLastSync, addError } = useApiContext();
  
  const { data, loading, error, refetch } = useDynamicApi(
    baseUrl,
    config.endpoint,
    undefined,
    {
      enabled: state.isConnected && !state.isConnecting && !!baseUrl,
      refetchInterval: config.refreshInterval,
      onSuccess: (data) => {
        setLastSync(new Date());
        setConnected(true);
      },
      onError: (error) => {
        addError(`${config.title}: ${error}`);
        // Only disconnect if it's a network error, not a business logic error
        if (error.includes('Network error') || error.includes('Failed to fetch')) {
          setConnected(false);
        }
      }
    }
  );

  const transformedData = data && config.transform ? config.transform(data) : data;

  const handleRefresh = async () => {
    await refetch();
  };

  if (!baseUrl) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">API URL not configured</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            {config.title}
          </CardTitle>
          {showRefreshButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Failed to load data</span>
          </div>
        ) : (
          config.render(transformedData || null, loading, error)
        )}
      </CardContent>
    </Card>
  );
}

// Predefined data renderers
export const DataRenderers = {
  // Simple key-value display
  keyValue: (data: Record<string, any>) => {
    if (!data || typeof data !== 'object') {
      return <div className="text-sm text-muted-foreground">No data available</div>;
    }
    
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-sm font-medium">
              {typeof value === 'boolean' ? (
                <Badge variant={value ? 'default' : 'secondary'}>
                  {value ? 'Yes' : 'No'}
                </Badge>
              ) : (
                String(value)
              )}
            </span>
          </div>
        ))}
      </div>
    );
  },

  // Metric display with trend
  metric: (data: { value: number; trend?: number; unit?: string }) => {
    if (!data || typeof data.value !== 'number') {
      return <div className="text-sm text-muted-foreground">No metric data available</div>;
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{data.value}</span>
          {data.unit && <span className="text-sm text-muted-foreground">{data.unit}</span>}
        </div>
        {data.trend !== undefined && (
          <div className="flex items-center gap-1">
            {data.trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${data.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(data.trend)}%
            </span>
          </div>
        )}
      </div>
    );
  },

  // Status indicators
  status: (data: { status: string; message?: string }) => {
    if (!data || !data.status) {
      return <div className="text-sm text-muted-foreground">No status data available</div>;
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          data.status === 'online' ? 'bg-green-500' :
          data.status === 'degraded' ? 'bg-yellow-500' :
          'bg-red-500'
        }`} />
        <span className="text-sm font-medium capitalize">{data.status}</span>
        {data.message && (
          <span className="text-sm text-muted-foreground">- {data.message}</span>
        )}
      </div>
    );
  },

  // List display
  list: (data: Array<{ id: string; name: string; status?: string }>) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="text-sm text-muted-foreground">No items available</div>;
    }
    
    return (
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span className="text-sm">{item.name}</span>
            {item.status && (
              <Badge variant="outline" className="text-xs">
                {item.status}
              </Badge>
            )}
          </div>
        ))}
      </div>
    );
  },

  // Activity feed
  activity: (data: Array<{ id: string; action: string; timestamp: string; user?: string }>) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="text-sm text-muted-foreground">No activity available</div>;
    }
    
    return (
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <Activity className="w-3 h-3 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <span className="text-sm">{item.action}</span>
              {item.user && (
                <span className="text-xs text-muted-foreground ml-1">by {item.user}</span>
              )}
              <div className="text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}; 