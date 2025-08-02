'use client';

import React from 'react';
import { useHeader } from '@/contexts/header-context';
import { Header } from './header';

export function ConditionalHeader() {
  const { isVisible } = useHeader();

  if (!isVisible) {
    return null;
  }

  return <Header />;
} 