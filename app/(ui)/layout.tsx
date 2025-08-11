"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ConditionalHeaderWrapper } from "@/components/ui/conditional-header-wrapper"
import { ConditionalFooterWrapper } from "@/components/ui/conditional-footer-wrapper"
import { MSWProvider } from "@/components/msw-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorReporter } from "@/components/error-reporter"

export default function UiLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MSWProvider>
        <TooltipProvider>
          <ConditionalHeaderWrapper />
          <div className="flex-1">
            {children}
          </div>
          <ConditionalFooterWrapper />
        </TooltipProvider>
        <Toaster />
        <ErrorReporter />
      </MSWProvider>
    </ThemeProvider>
  )
}

