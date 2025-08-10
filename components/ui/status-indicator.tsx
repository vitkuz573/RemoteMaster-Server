"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'pending' | string;
  showText?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StatusIndicator({ 
  status, 
  showText = false, 
  size = "md",
  className 
}: StatusIndicatorProps) {
  const statusConfig = {
    online: {
      icon: CheckCircle,
      variant: "default" as const,
      className: "bg-green-500 hover:bg-green-600 text-white",
      text: "Online"
    },
    offline: {
      icon: XCircle,
      variant: "destructive" as const,
      className: "bg-red-500 hover:bg-red-600 text-white",
      text: "Offline"
    },
    warning: {
      icon: AlertCircle,
      variant: "secondary" as const,
      className: "bg-yellow-500 hover:bg-yellow-600 text-white",
      text: "Warning"
    },
    pending: {
      icon: Clock,
      variant: "outline" as const,
      className: "bg-gray-500 hover:bg-gray-600 text-white",
      text: "Pending"
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.offline;
  const Icon = config.icon;

  if (showText) {
    return (
      <Badge 
        variant={config.variant}
        className={cn(config.className, className)}
      >
        <Icon className={cn("mr-1", size === "sm" ? "w-3 h-3" : "w-4 h-4")} />
        {config.text}
      </Badge>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn(
        "rounded-full",
        size === "sm" ? "w-2 h-2" : "w-3 h-3",
        config.className
      )} />
    </div>
  );
} 
