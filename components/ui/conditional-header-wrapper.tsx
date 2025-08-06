'use client';

import { usePathname } from 'next/navigation';
import { ConditionalHeader } from './conditional-header';

export function ConditionalHeaderWrapper() {
  const pathname = usePathname();
  
  // Hide context header on main page (/) since it has its own header
  if (pathname === '/') {
    return null;
  }
  
  return <ConditionalHeader />;
} 