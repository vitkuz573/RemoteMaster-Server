'use client';

import React from 'react';
import { SetupWizard } from '@/components/setup-wizard/setup-wizard';

export default function SuspenseDemoPage() {
  const handleStepChange = (step: string) => {
    console.log('Step changed to:', step);
  };

  const handleComplete = () => {
    console.log('Setup wizard completed!');
  };

  return (
    <div className="min-h-screen bg-background">
      <SetupWizard 
        onStepChange={handleStepChange}
        onComplete={handleComplete}
      />
    </div>
  );
} 