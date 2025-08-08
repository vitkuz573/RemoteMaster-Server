'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export function ConditionalFooterWrapper() {
  const pathname = usePathname();
  
  // Hide footer on main page (/) and device pages
  if (pathname === '/' || pathname.startsWith('/device')) {
    return null;
  }
  
  return <Footer />;
} 
