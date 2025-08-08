'use client';

import React from 'react';
import { appConfig } from '@/lib/app-config';
import { useFooterStore } from '@/lib/stores';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink } from 'lucide-react';


interface FooterProps {
  /**
   * Custom className for the footer
   */
  className?: string;
}

export function Footer({ 
  className = ""
}: FooterProps) {
  const { isFooterVisible, footerConfig } = useFooterStore();
  const { showBuildDate } = footerConfig;

  if (!isFooterVisible) return null;

  return (
         <footer className={`border-t bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 relative z-10 ${className}`}>
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
            <div className="text-xs text-muted-foreground relative">
               v{appConfig.buildVersion}
               {/* Enhanced Environment Indicator */}
               <Tooltip delayDuration={300}>
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
                 <TooltipContent side="top" className="max-w-xs z-50">
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

                     {/* Right section - Build info */}
           <div className="flex items-center gap-4 text-xs text-muted-foreground">
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