"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeaderStore, useFooterStore } from "@/lib/stores";
import { useParams } from "next/navigation";

export default function DeviceByIpPage() {
  const p = useParams<{ address: string[] }>();
  const parts = (p?.address || []) as unknown as string[];
  const target = Array.isArray(parts) ? parts.join('/') : String(parts ?? '');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hideHeader, showHeader } = useHeaderStore();
  const { hideFooter, showFooter } = useFooterStore();
  const isIPv4 = useMemo(() => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(target), [target]);
  const isIPv6 = useMemo(() => target.includes(':'), [target]);
  const endpointLabel = isIPv4 ? 'IPv4' : (isIPv6 ? 'IPv6' : 'IP');

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
    <div className="relative h-[calc(100vh-0px)] bg-black">
      <div className="absolute inset-0">
        <img
          src={`/api/device/${encodeURIComponent(target)}/screen`}
          alt="Remote screen"
          className="w-full h-full object-contain select-none pointer-events-none"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.style.display = "none";
          }}
        />
        <div className="w-full h-full flex items-center justify-center text-white/70">
          <div className="text-center">
            <div className="text-lg">Device screen: {target}</div>
            <div className="text-sm">Waiting for image…</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Toggle sidebar"
        onClick={() => setSidebarOpen((v) => !v)}
        className={`absolute top-1/2 -translate-y-1/2 z-[60] w-9 h-16 flex items-center justify-center shadow-lg border border-white/20 rounded-l-full backdrop-blur-sm transition-[right] duration-200 ${sidebarOpen ? 'right-80' : 'right-0'} bg-black/60 text-white hover:bg-black/70`}
      >
        {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <aside
        className={`absolute inset-y-0 right-0 z-10 w-80 bg-card text-foreground border-l shadow-lg transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="font-semibold">Device Controls</div>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Connected to ({endpointLabel})</div>
              <div className="text-base font-medium break-all">{target}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
