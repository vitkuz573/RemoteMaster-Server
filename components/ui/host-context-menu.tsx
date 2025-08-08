"use client";

import React, { useEffect } from "react";

interface HostContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onConnect: () => void;
  onProperties: () => void;
  canShowProperties: boolean;
}

export function HostContextMenu({
  open,
  x,
  y,
  onClose,
  onConnect,
  onProperties,
  canShowProperties,
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
      <button
        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted"
        onClick={() => {
          onClose();
          onConnect();
        }}
      >
        Connect
      </button>
      <button
        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          if (!canShowProperties) return;
          onClose();
          onProperties();
        }}
        disabled={!canShowProperties}
      >
        Properties
      </button>
    </div>
  );
}
