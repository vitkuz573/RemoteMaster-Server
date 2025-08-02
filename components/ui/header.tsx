'use client';

import React from 'react';
import { appConfig } from '@/lib/app-config';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  return (
    <header className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
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
  );
} 