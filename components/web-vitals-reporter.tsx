"use client";

import { useEffect } from "react";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

type MetricPayload = {
  name: string;
  id: string;
  value: number;
  rating?: string;
};

function sendMetric(payload: MetricPayload) {
  // Prefer a dedicated metrics endpoint; fall back to console via logger
  try {
    const body = JSON.stringify({ type: "web-vitals", ...payload });
    if ("sendBeacon" in navigator) {
      const ok = navigator.sendBeacon(
        "/api/metrics",
        new Blob([body], { type: "application/json" })
      );
      if (ok) return;
    }
    void fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch (e) {
    logger.info("web-vitals", payload);
  }
}

export function WebVitalsReporter() {
  useEffect(() => {
    if (!env.NEXT_PUBLIC_WEB_VITALS_ENABLED) return;
    let unsubscribed = false;
    // Dynamically import to avoid SSR footprint
    import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      if (unsubscribed) return;
      const report = (m: any) => {
        const metric: MetricPayload = {
          name: m.name,
          id: m.id,
          value: Math.round(m.value * 1000) / 1000, // trim noise
          rating: m.rating,
        };
        sendMetric(metric);
      };
      onCLS(report);
      onINP(report);
      onLCP(report);
      onFCP(report);
      onTTFB(report);
    });
    return () => {
      unsubscribed = true;
    };
  }, []);

  return null;
}

