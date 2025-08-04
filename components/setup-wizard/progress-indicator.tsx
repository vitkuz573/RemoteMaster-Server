'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { WizardStepConfig, WizardStep } from './types';

interface ProgressIndicatorProps {
  steps: WizardStepConfig[];
  currentStep: WizardStep;
  currentStepIndex: number;
  isLoading?: boolean;
}

export function ProgressIndicator({
  steps,
  currentStep,
  currentStepIndex,
  isLoading = false
}: ProgressIndicatorProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Show skeleton during loading or until client-side hydration
  if (isLoading || !isClient) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse mt-1" />
          </div>
          <div className="h-6 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-3 bg-muted rounded animate-pulse mb-6" />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Organization Setup Wizard
          </h1>
          <p className="text-muted-foreground mt-1">Complete your organization configuration</p>
        </div>
        <Badge variant="secondary" className="text-sm px-4 py-2">
          Step {currentStepIndex + 1} of {steps.length}
        </Badge>
      </div>
      
      {/* Enhanced Progress Bar */}
      <div className="relative mb-6">
        <Progress value={progress} className="h-3 bg-muted/50" />
        <motion.div 
          className="absolute inset-0 h-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />
      </div>
      
      {/* Enhanced Step Indicators */}
      <div className="flex justify-between mt-4">
        {steps.map((step, index) => (
          <motion.div 
            key={step.key} 
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <motion.div 
              className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStepIndex 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'bg-muted text-muted-foreground'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {index < currentStepIndex ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <CheckCircle className="w-5 h-5" />
                </motion.div>
              ) : (
                <span>{index + 1}</span>
              )}
              {index === currentStepIndex && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <span className={`text-xs font-medium ${
                index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.title}
              </span>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                {step.description}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 