"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { MSWProvider } from "@/components/msw-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorReporter } from "@/components/error-reporter"

export default function UiLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MSWProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster />
        <ErrorReporter />
      </MSWProvider>
    </ThemeProvider>
  )
}
