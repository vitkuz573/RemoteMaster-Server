'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Globe, Shield, CheckCircle, Info } from 'lucide-react';
import type { BYOIDForm } from './types';

interface BYOIDStepProps {
  form: BYOIDForm;
  onFormChange: (field: keyof BYOIDForm, value: string) => void;
  onDiscoverProvider: () => Promise<void>;
  isDiscovering: boolean;
}

export function BYOIDStep({
  form,
  onFormChange,
  onDiscoverProvider,
  isDiscovering
}: BYOIDStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">OpenID Connect Setup (Optional)</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Configure your identity provider for enhanced security. Start by entering the issuer URL and clicking "Discover Provider" to automatically configure the endpoints.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="issuerUrl">Issuer URL *</Label>
          <div className="flex gap-2">
            <Input
              id="issuerUrl"
              value={form.issuerUrl}
              onChange={(e) => onFormChange('issuerUrl', e.target.value)}
              placeholder="https://your-idp.com"
              className="flex-1"
              
            />
            <Button
              onClick={onDiscoverProvider}
              disabled={isDiscovering || !form.issuerUrl.trim()}
              variant="outline"
              className="whitespace-nowrap"
            >
              {isDiscovering ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  Discovering...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Discover Provider
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The OpenID Connect issuer URL. Click "Discover Provider" to automatically configure endpoints.
          </p>
        </div>

        {form.discoveryData && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-green-900 dark:text-green-100">Provider Discovered Successfully</h4>
                <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                  <div><strong>Issuer:</strong> {form.discoveryData.issuer}</div>
                  <div><strong>Authorization Endpoint:</strong> {form.discoveryData.authorization_endpoint}</div>
                  <div><strong>Token Endpoint:</strong> {form.discoveryData.token_endpoint}</div>
                  <div><strong>UserInfo Endpoint:</strong> {form.discoveryData.userinfo_endpoint}</div>
                  <div><strong>Supported Scopes:</strong> {form.discoveryData.scopes_supported.join(', ')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">
              Client ID
              {form.discoveryData && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id="clientId"
              value={form.clientId}
              onChange={(e) => onFormChange('clientId', e.target.value)}
              placeholder="your-client-id"
              className={form.discoveryData && !form.clientId.trim() ? "border-red-300 focus:border-red-500" : ""}
            />
            <p className="text-xs text-muted-foreground">
              The client ID configured in your IdP
              {form.discoveryData && !form.clientId.trim() && (
                <span className="text-red-500 ml-1">Required after discovery</span>
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">
              Client Secret
              {form.discoveryData && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id="clientSecret"
              type="password"
              value={form.clientSecret}
              onChange={(e) => onFormChange('clientSecret', e.target.value)}
              placeholder="your-client-secret"
              className={form.discoveryData && !form.clientSecret.trim() ? "border-red-300 focus:border-red-500" : ""}
            />
            <p className="text-xs text-muted-foreground">
              The client secret configured in your IdP
              {form.discoveryData && !form.clientSecret.trim() && (
                <span className="text-red-500 ml-1">Required after discovery</span>
              )}
            </p>
          </div>
        </div>

        {form.discoveryData && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Configuration Complete</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Your OpenID Connect provider has been discovered and configured. You can now proceed with the setup or skip this step to configure it later.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 