import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/ui/footer";
import { ConditionalHeader } from "@/components/ui/conditional-header";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Toaster } from "@/components/ui/sonner";
import { appConfig } from "@/lib/app-config";

import { ConditionalHeaderWrapper } from "@/components/ui/conditional-header-wrapper";
import { ConditionalFooterWrapper } from "@/components/ui/conditional-footer-wrapper";
import { MSWProvider } from "@/components/msw-provider";
import { ThemeProvider } from "@/components/theme-provider";

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



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MSWProvider>
            <TooltipProvider>
              <ConditionalHeaderWrapper />
              <div className="flex-1">
                {children}
              </div>
              <ConditionalFooterWrapper />
            </TooltipProvider>
            <Toaster />
          </MSWProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
