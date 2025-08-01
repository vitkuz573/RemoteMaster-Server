'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  ArrowRight,
  Mail,
  Users,
  Settings,
  Shield,
  Zap,
  ExternalLink,
  Building2,
  Calendar,
  Clock
} from "lucide-react";
import { appConfig } from '@/lib/app-config';

export default function SetupCompletePage() {
  const router = useRouter();

  const nextSteps = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "Invite Team Members",
      description: "Add your team members to start collaborating",
      action: "Invite Users",
      href: "#"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "Configure SSO",
      description: "Set up Single Sign-On with your identity provider",
      action: "Configure SSO",
      href: "#"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Security Settings",
      description: "Review and configure security policies",
      action: "Security Settings",
      href: "#"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "API Integration",
      description: "Connect your existing systems and tools",
      action: "View APIs",
      href: "#"
    }
  ];

  const supportResources = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using RemoteMaster",
      href: appConfig.support.documentation || "#",
      icon: <ExternalLink className="w-4 h-4" />
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      href: appConfig.support.website || "#",
      icon: <ExternalLink className="w-4 h-4" />
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      href: appConfig.support.documentation || "#",
      icon: <ExternalLink className="w-4 h-4" />
    },
    {
      title: "Community Forum",
      description: "Connect with other users",
      href: appConfig.support.community || "#",
      icon: <ExternalLink className="w-4 h-4" />
    }
  ];

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/30 min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{appConfig.shortName}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">{appConfig.name}</h1>
              <p className="text-xs text-muted-foreground">{appConfig.description}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome to {appConfig.name}!</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Your organization has been successfully registered and your account is now active. 
              You're ready to start using {appConfig.name} for your team.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="text-sm">
                <Calendar className="w-3 h-3 mr-1" />
                Free 30-day trial active
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Clock className="w-3 h-3 mr-1" />
                Setup completed
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Next Steps
                  </CardTitle>
                  <CardDescription>
                    Complete these steps to get your team up and running quickly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nextSteps.map((step, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{step.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                            <Button size="sm" variant="outline" className="w-full">
                              {step.action}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks to get you started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">Invite Team Members</span>
                      </div>
                      <span className="text-sm text-muted-foreground text-left">
                        Send invitations to your team
                      </span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span className="font-medium">Configure Settings</span>
                      </div>
                      <span className="text-sm text-muted-foreground text-left">
                        Customize your organization settings
                      </span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">Security Setup</span>
                      </div>
                      <span className="text-sm text-muted-foreground text-left">
                        Review security policies and settings
                      </span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium">View Dashboard</span>
                      </div>
                      <span className="text-sm text-muted-foreground text-left">
                        Go to your main dashboard
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Welcome Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Welcome!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your {appConfig.name} account is now ready. You can start using all features immediately.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Account activated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Payment processed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">30-day trial started</span>
                    </div>
                  </div>
                  
                  <Button onClick={() => router.push('/')} className="w-full">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Support Resources - Only show if support resources are configured */}
              {(appConfig.support.documentation || appConfig.support.website || appConfig.support.community) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Support Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {supportResources.map((resource, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{resource.title}</p>
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                          <a href={resource.href} target="_blank" rel="noopener noreferrer">
                            {resource.icon}
                          </a>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Contact Support - Only show if support is configured */}
              {(appConfig.support.email || appConfig.support.website || appConfig.support.availability || appConfig.support.responseTime) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Our support team is here to help you get the most out of {appConfig.name}.
                    </p>
                    
                    <div className="space-y-2">
                      {appConfig.support.email && (
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href={`mailto:${appConfig.support.email}`}>
                            <Mail className="w-4 h-4 mr-2" />
                            Contact Support
                          </a>
                        </Button>
                      )}
                      {appConfig.support.website && (
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href={appConfig.support.website} target="_blank" rel="noopener noreferrer">
                            Schedule Demo
                          </a>
                        </Button>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {appConfig.support.availability && (
                        <p>Support available {appConfig.support.availability}</p>
                      )}
                      {appConfig.support.responseTime && (
                        <p>Response time: {appConfig.support.responseTime}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trial Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trial period:</span>
                      <span className="font-medium">30 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Full access:</span>
                      <span className="font-medium">All features</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">No commitment:</span>
                      <span className="font-medium">Cancel anytime</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <p className="text-xs text-muted-foreground">
                    Your trial will automatically convert to a paid plan after 30 days. 
                    You can cancel or modify your plan at any time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 