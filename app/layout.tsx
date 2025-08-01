import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/ui/footer";
import { FooterProvider } from "@/contexts/footer-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiProvider } from "@/contexts/api-context";
import { appConfig } from "@/lib/app-config";
import { initializeDefaultHealthChecks } from "@/lib/system-status";
import { initializeCustomHealthChecks } from "@/lib/custom-health-checks";

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

// Initialize health checks on server side
if (typeof window === 'undefined') {
  initializeDefaultHealthChecks();
  initializeCustomHealthChecks();
}

function LayoutFooter() {
  return <Footer />;
}

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
        <TooltipProvider>
          <ApiProvider>
            <FooterProvider>
              <div className="flex-1">
                {children}
              </div>
              <LayoutFooter />
            </FooterProvider>
          </ApiProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
