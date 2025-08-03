'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, RotateCcw } from 'lucide-react';

interface DebugPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export function DebugPanel({ isVisible = false, onToggle }: DebugPanelProps) {
  const [storageData, setStorageData] = React.useState<Record<string, any>>({});

  const loadStorageData = () => {
    if (typeof window !== 'undefined') {
      const keys = [
        'setup-wizard-current-step',
        'setup-wizard-org-form',
        'setup-wizard-byoid-form',
        'setup-wizard-total-monthly',
        'setup-wizard-is-submitting',
        'setup-wizard-is-discovering'
      ];
      
      const data: Record<string, any> = {};
      keys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            data[key] = JSON.parse(value);
          }
        } catch (error) {
          data[key] = 'Error parsing data';
        }
      });
      setStorageData(data);
    }
  };

  const clearAllStorage = () => {
    if (typeof window !== 'undefined') {
      const keys = [
        'setup-wizard-current-step',
        'setup-wizard-org-form',
        'setup-wizard-byoid-form',
        'setup-wizard-total-monthly',
        'setup-wizard-is-submitting',
        'setup-wizard-is-discovering'
      ];
      
      keys.forEach(key => localStorage.removeItem(key));
      loadStorageData();
    }
  };

  React.useEffect(() => {
    if (isVisible) {
      loadStorageData();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-hidden z-50 bg-background/95 backdrop-blur-sm border-2 border-dashed border-muted-foreground/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold">Setup Wizard Debug</CardTitle>
            <CardDescription className="text-xs">LocalStorage State</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={loadStorageData}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearAllStorage}
              className="h-8 w-8 p-0 text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            {onToggle && (
              <Button
                size="sm"
                variant="outline"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(storageData).map(([key, value]) => (
            <div key={key} className="text-xs">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {key.replace('setup-wizard-', '')}
                </Badge>
              </div>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
          {Object.keys(storageData).length === 0 && (
            <div className="text-center text-muted-foreground text-xs py-4">
              No setup wizard data found in localStorage
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 