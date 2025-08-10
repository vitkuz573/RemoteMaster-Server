"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface HostContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onConnect?: () => void;
  onConnectIp?: () => void;
  onConnectInternetId?: () => void;
  onProperties: () => void;
  canShowProperties: boolean;
  hasIp?: boolean;
  hasInternetId?: boolean;
}

export function HostContextMenu({
  open,
  x,
  y,
  onClose,
  onConnect,
  onConnectIp,
  onConnectInternetId,
  onProperties,
  canShowProperties,
  hasIp,
  hasInternetId,
}: HostContextMenuProps) {
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return onClose();
      // Close when clicking outside of the menu
      if (!target.closest?.("[data-host-context-menu]")) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", handle, true);
    window.addEventListener("keydown", handleEsc, true);
    return () => {
      window.removeEventListener("mousedown", handle, true);
      window.removeEventListener("keydown", handleEsc, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-host-context-menu
      className="fixed z-50 min-w-40 rounded-md border bg-popover p-1 shadow-md"
      style={{ left: x, top: y }}
      role="menu"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Connect options */}
      {hasIp && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            onClose();
            onConnectIp?.();
          }}
        >
          Connect via IP
        </Button>
      )}
      {hasInternetId && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            onClose();
            onConnectInternetId?.();
          }}
        >
          Connect via Internet ID
        </Button>
      )}
      {!hasIp && !hasInternetId && onConnect && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            onClose();
            onConnect?.();
          }}
        >
          Connect
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          if (!canShowProperties) return;
          onClose();
          onProperties();
        }}
        disabled={!canShowProperties}
      >
        Properties
      </Button>
    </div>
  );
}
