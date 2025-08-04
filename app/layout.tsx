import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/ui/footer";
import { FooterProvider } from "@/contexts/footer-context";
import { ConditionalHeader } from "@/components/ui/conditional-header";
import { HeaderProvider } from "@/contexts/header-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiProvider } from "@/contexts/api-context";
import { Toaster } from "@/components/ui/sonner";
import { appConfig } from "@/lib/app-config";

import { ConditionalHeaderWrapper } from "@/components/ui/conditional-header-wrapper";
import { MSWProvider } from "@/components/msw-provider";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <MSWProvider>
          <TooltipProvider>
            <ApiProvider>
              <HeaderProvider>
                <FooterProvider>
                  <ConditionalHeaderWrapper />
                  <div className="flex-1">
                    {children}
                  </div>
                  <Footer />
                </FooterProvider>
              </HeaderProvider>
            </ApiProvider>
          </TooltipProvider>
          <Toaster />
        </MSWProvider>
      </body>
    </html>
  );
}
