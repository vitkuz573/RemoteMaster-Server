"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeaderStore, useFooterStore } from "@/lib/stores";

interface DevicePageProps {
  params: { ip: string };
}

export default function DevicePage({ params }: DevicePageProps) {
  const { ip } = params;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hideHeader, showHeader } = useHeaderStore();
  const { hideFooter, showFooter } = useFooterStore();

  // Hide global header/footer while on device page
  useEffect(() => {
    hideHeader();
    hideFooter();
    return () => {
      showHeader();
      showFooter();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-[calc(100vh-0px)] bg-black">{/* Full viewport under layout wrappers */}
      {/* Screen area */}
      <div className="absolute inset-0">
        {/* Placeholder for remote screen image/stream */}
        <img
          src={`/api/device/${encodeURIComponent(ip)}/screen`}
          alt="Remote screen"
          className="w-full h-full object-contain select-none pointer-events-none"
          onError={(e) => {
            // fallback styling/message if image not available
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = "none";
          }}
        />
        {/* Fallback block when no image */}
        <div className="w-full h-full flex items-center justify-center text-white/70">
          <div className="text-center">
            <div className="text-lg">Device screen: {ip}</div>
            <div className="text-sm">Waiting for image…</div>
          </div>
        </div>
      </div>

      {/* Edge toggle button (right middle) */}
      <button
        type="button"
        aria-label="Toggle sidebar"
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute top-1/2 -translate-y-1/2 right-0 z-20 w-9 h-16 rounded-l-full bg-white/20 hover:bg-white/30 text-white backdrop-blur flex items-center justify-center shadow"
      >
        {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`absolute inset-y-0 right-0 z-10 w-80 bg-card text-foreground border-l shadow-lg transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="font-semibold">Device Controls</div>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Connected to</div>
              <div className="text-base font-medium break-all">{ip}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
