'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  onReset?: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isSubmitting: boolean;
  isLastStep: boolean;
}

export function NavigationButtons({
  onBack,
  onNext,
  onReset,
  canGoBack,
  canGoNext,
  isSubmitting,
  isLastStep
}: NavigationButtonsProps) {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {/* Left side - Back and Reset buttons */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            onClick={onBack}
            disabled={!canGoBack}
            className="w-full sm:w-auto h-12 px-6 text-base font-medium transition-all duration-200 hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </motion.div>
        
        {onReset && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              onClick={onReset}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-4 text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </motion.div>
        )}
      </div>
      
      {/* Right side - Next/Complete button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full sm:w-auto"
      >
        <Button
          onClick={onNext}
          disabled={!canGoNext || isSubmitting}
          className="w-full sm:w-auto h-12 px-8 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Setting up...
            </>
          ) : isLastStep ? (
            <>
              Complete Setup
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
} 