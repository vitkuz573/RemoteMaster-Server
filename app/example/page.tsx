'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHideFooter } from '@/contexts/footer-context';
import { ArrowLeft } from 'lucide-react';

/**
 * Example page demonstrating how to hide the footer
 * This page uses useHideFooter() hook to hide the footer
 */
export default function ExamplePage() {
  const router = useRouter();
  
  // This hook will hide the footer when the component mounts
  // and restore it when the component unmounts
  useHideFooter();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Example Page</h1>
            <p className="text-muted-foreground">This page demonstrates footer management</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Footer Hidden</CardTitle>
              <CardDescription>
                This page uses the useHideFooter() hook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The footer is automatically hidden on this page because we're using the 
                <code className="bg-muted px-1 py-0.5 rounded text-xs mx-1">useHideFooter()</code> 
                hook. When you navigate away from this page, the footer will be restored.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Example</CardTitle>
              <CardDescription>
                How to hide footer in your components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`import { useHideFooter } from '@/contexts/footer-context';

export default function MyPage() {
  // Hide footer on this page
  useHideFooter();
  
  return (
    <div>Your page content</div>
  );
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alternative Method</CardTitle>
              <CardDescription>
                Manual footer control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`import { useFooter } from '@/contexts/footer-context';

export default function MyPage() {
  const { hideFooter, showFooter } = useFooter();
  
  // Manual control
  const handleHide = () => hideFooter();
  const handleShow = () => showFooter();
  
  return (
    <div>Your page content</div>
  );
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer Configuration</CardTitle>
              <CardDescription>
                Customize footer appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`import { useFooter } from '@/contexts/footer-context';

export default function MyPage() {
  const { updateFooterConfig } = useFooter();
  
  React.useEffect(() => {
    // Customize footer
    updateFooterConfig({
      showSystemStatus: false,
      showBuildDate: false
    });
  }, []);
  
  return (
    <div>Your page content</div>
  );
}`}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Notice how the footer is not visible on this page. 
            Navigate to other pages to see the footer restored.
          </p>
        </div>
      </div>
    </div>
  );
}