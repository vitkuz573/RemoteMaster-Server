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



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
