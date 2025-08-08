'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export function ConditionalFooterWrapper() {
  const pathname = usePathname();
  
  // Hide footer on main page (/) since it has its own layout
  if (pathname === '/') {
    return null;
  }
  
  return <Footer />;
} 