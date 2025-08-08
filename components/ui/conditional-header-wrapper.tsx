'use client';

import { usePathname } from 'next/navigation';
import { ConditionalHeader } from './conditional-header';

export function ConditionalHeaderWrapper() {
  const pathname = usePathname();
  
  // Hide context header on main page (/) and device pages
  if (pathname === '/' || pathname.startsWith('/device')) {
    return null;
  }
  
  return <ConditionalHeader />;
} 
