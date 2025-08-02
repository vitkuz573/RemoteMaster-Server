'use client';

import React from 'react';
import { appConfig } from '@/lib/app-config';
import { useFooter } from '@/contexts/footer-context';
import { getCachedSystemStatus, type SystemStatus } from '@/lib/system-status';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink } from 'lucide-react';
import { apiService } from '@/lib/api-service';

interface FooterProps {
  /**
   * Custom className for the footer
   */
  className?: string;
}

export function Footer({ 
  className = ""
}: FooterProps) {
  const { isFooterVisible, footerConfig } = useFooter();
  const [systemStatus, setSystemStatus] = React.useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const { showSystemStatus, showBuildDate, showDevBadge } = footerConfig;
  
  // Load system status on mount
  React.useEffect(() => {
    let mounted = true;
    
    const loadStatus = async () => {
      try {
        // Fetch from external API
        const data = await apiService.getHealth();
        
        if (mounted) {
          setSystemStatus({
            status: data.status === 'healthy' ? 'online' : 
                    data.status === 'degraded' ? 'degraded' : 'offline',
            message: data.message || 'System is operational',
            timestamp: Date.now(),
            services: data.services || {},
            checkResults: data.checkResults || {}
          });
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setSystemStatus({
            status: 'offline',
            message: 'Unable to check system status',
            timestamp: Date.now(),
            services: {},
            checkResults: {}
          });
          setIsLoading(false);
        }
      }
    };
    
    loadStatus();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'unhealthy':
        return 'bg-red-500';
      case 'degraded':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Passed';
      case 'unhealthy':
        return 'Failed';
      case 'degraded':
        return 'Degraded';
      default:
        return 'Unknown';
    }
  };

  if (!isFooterVisible) return null;

  return (
    <footer className={`border-t bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section - App info and version */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{appConfig.shortName}</span>
              </div>
              <span className="text-sm font-medium">{appConfig.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">
               v{appConfig.buildVersion}
               {/* Enhanced Environment Indicator */}
               <Tooltip>
                 <TooltipTrigger asChild>
                   <span className={`
                     ml-2 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-help
                     ${(() => {
                       const env = appConfig.environment as string;
                       if (env === 'development') {
                         return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 animate-pulse';
                       } else if (env === 'staging') {
                         return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700';
                       } else if (env === 'production') {
                         return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700';
                       } else {
                         return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700';
                       }
                     })()}
                     hover:scale-105 hover:shadow-sm
                   `}>
                     {(() => {
                       const env = appConfig.environment as string;
                       if (env === 'development') return '🚀';
                       if (env === 'staging') return '🧪';
                       if (env === 'production') return '✅';
                       if (env === 'test') return '🧪';
                       return '❓';
                     })()}
                     {' '}
                     {appConfig.environment.toUpperCase()}
                   </span>
                 </TooltipTrigger>
                 <TooltipContent side="top" className="max-w-xs">
                   <div className="space-y-2">
                     <div className="font-medium flex items-center gap-2">
                       <span>Environment</span>
                       <Badge variant="outline" className="text-xs">
                         {appConfig.environment}
                       </Badge>
                     </div>
                     <div className="space-y-1 text-xs">
                                             <div className="flex justify-between">
                        <span className="text-muted-foreground">Version:</span>
                        <span className="font-mono">
                          {appConfig.versionUrl ? (
                            <a 
                              href={appConfig.versionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline hover:text-primary transition-colors flex items-center gap-1"
                              title="View release on GitHub"
                            >
                              {appConfig.version}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            appConfig.version
                          )}
                        </span>
                      </div>
                                             <div className="flex justify-between">
                        <span className="text-muted-foreground">Build:</span>
                        <span className="font-mono">
                          {appConfig.commitUrl ? (
                            <a 
                              href={appConfig.commitUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline hover:text-primary transition-colors flex items-center gap-1"
                              title="View commit on GitHub"
                            >
                              {appConfig.buildHash}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            appConfig.buildHash
                          )}
                        </span>
                      </div>
                                               <div className="flex justify-between">
                          <span className="text-muted-foreground">Branch:</span>
                          <span className="font-mono">
                            {appConfig.branchUrl ? (
                              <a 
                                href={appConfig.branchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline hover:text-primary transition-colors flex items-center gap-1"
                                title="View branch on GitHub"
                              >
                                {appConfig.buildBranch}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              appConfig.buildBranch
                            )}
                          </span>
                        </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Date:</span>
                         <span className="font-mono">{appConfig.buildDate}</span>
                       </div>
                     </div>
                     {(() => {
                       const env = appConfig.environment as string;
                       if (env === 'development') {
                         return (
                           <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                             ⚠️ Development mode - features may be unstable
                           </div>
                         );
                       } else if (env === 'staging') {
                         return (
                           <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                             🧪 Staging environment - testing in progress
                           </div>
                         );
                       } else if (env === 'production') {
                         return (
                           <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                             ✅ Production environment - stable release
                           </div>
                         );
                       }
                       return null;
                     })()}
                   </div>
                 </TooltipContent>
               </Tooltip>
             </div>
          </div>

          {/* Center section - Copyright */}
          <div className="hidden md:block">
            <p className="text-xs text-muted-foreground">
              © {appConfig.copyrightStartYear}-{new Date().getFullYear()} {appConfig.developer}. All rights reserved.
            </p>
          </div>

          {/* Right section - System status and build info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                         {showSystemStatus && (
               <div className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                      <span className="text-xs">Checking...</span>
                    </>
                  ) : systemStatus ? (
                    <>
                      {/* Overall status indicator */}
                      <div className="flex items-center gap-1">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            systemStatus.status === 'online' ? 'bg-green-500' :
                            systemStatus.status === 'degraded' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                        />
                        <span className="text-xs font-medium">
                          {systemStatus.status === 'online' ? 'System Online' :
                           systemStatus.status === 'degraded' ? 'System Degraded' :
                           'System Offline'}
                        </span>
                      </div>

                      {/* Individual check results - compact version */}
                      {systemStatus.checkResults && Object.keys(systemStatus.checkResults).length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              <span className="text-xs text-muted-foreground">•</span>
                              <div className="flex items-center gap-1">
                                {/* Show only failed checks as red dots */}
                                {Object.entries(systemStatus.checkResults)
                                  .filter(([_, check]) => check.status === 'unhealthy')
                                  .map(([key, check]) => (
                                    <div 
                                      key={key}
                                      className="w-1.5 h-1.5 rounded-full bg-red-500"
                                      title={`${check.name}: Failed`}
                                    />
                                  ))}
                                {/* Show success indicator if all checks passed */}
                                {Object.values(systemStatus.checkResults).every(check => check.status === 'healthy') && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="All checks passed" />
                                )}
                              </div>
                              {/* Show count of failed checks */}
                              {(() => {
                                const failedCount = Object.values(systemStatus.checkResults).filter(check => check.status === 'unhealthy').length;
                                const totalCount = Object.keys(systemStatus.checkResults).length;
                                return failedCount > 0 && (
                                  <span className="text-xs text-red-500 font-medium">
                                    {failedCount}/{totalCount}
                                  </span>
                                );
                              })()}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-2">
                              <div className="font-medium">Health Check Details</div>
                                                             {Object.entries(systemStatus.checkResults).map(([key, check]) => (
                                 <div key={key} className="flex items-center justify-between gap-4">
                                   <div className="flex items-center gap-2">
                                     <div className={`w-2 h-2 rounded-full ${getStatusColor(check.status)}`} />
                                     <span className="text-xs font-medium">{check.name}</span>
                                   </div>
                                   <Badge 
                                     variant={check.status === 'healthy' ? 'default' : 'destructive'}
                                     className="text-xs"
                                   >
                                     {getStatusText(check.status)}
                                   </Badge>
                                 </div>
                               ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <span className="text-xs">Status Unknown</span>
                    </>
                                     )}
                 </div>
             )}
            {showBuildDate && (
              <div className="hidden lg:flex items-center gap-2">
                <span>Build:</span>
                <span className="font-mono text-xs">{appConfig.buildDate}</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="font-mono text-xs">{appConfig.buildInfo}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile copyright - shown only on small screens */}
        <div className="md:hidden mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            © {appConfig.copyrightStartYear}-{new Date().getFullYear()} {appConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}