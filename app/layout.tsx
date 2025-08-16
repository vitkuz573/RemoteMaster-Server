import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
 
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { appConfig } from "@/lib/app-config";

import { ConditionalHeaderWrapper } from "@/components/ui/conditional-header-wrapper";
import { ConditionalFooterWrapper } from "@/components/ui/conditional-footer-wrapper";
import { MSWProvider } from "@/components/msw-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorReporter } from "@/components/error-reporter";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { IntlProvider } from './providers'
import { getLocale, getMessages } from 'next-intl/server'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${appConfig.name} - ${appConfig.description}`,
  description: appConfig.description,
};



export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <IntlProvider locale={locale} messages={messages}>
          <MSWProvider>
            <TooltipProvider>
              <AppErrorBoundary>
                <div className="flex min-h-screen flex-col">
                  <ConditionalHeaderWrapper />
                  <main className="flex-1">
                    {children}
                  </main>
                  <ConditionalFooterWrapper />
                </div>
              </AppErrorBoundary>
            </TooltipProvider>
            <Toaster />
            <ErrorReporter />
            <WebVitalsReporter />
          </MSWProvider>
          </IntlProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
