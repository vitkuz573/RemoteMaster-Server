"use client";

import React, { useEffect } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

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
    <ContextMenu open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <ContextMenuContent
        className="w-48"
        style={{ position: "fixed", left: x, top: y }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {hasIp && (
          <ContextMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onClose();
              onConnectIp?.();
            }}
          >
            Connect via IP
          </ContextMenuItem>
        )}
        {hasInternetId && (
          <ContextMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onClose();
              onConnectInternetId?.();
            }}
          >
            Connect via Internet ID
          </ContextMenuItem>
        )}
        {!hasIp && !hasInternetId && onConnect && (
          <ContextMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onClose();
              onConnect?.();
            }}
          >
            Connect
          </ContextMenuItem>
        )}
        {(hasIp || hasInternetId || onConnect) && <ContextMenuSeparator />}
        <ContextMenuItem
          disabled={!canShowProperties}
          onSelect={(e) => {
            if (!canShowProperties) return;
            e.preventDefault();
            onClose();
            onProperties();
          }}
        >
          Properties
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
