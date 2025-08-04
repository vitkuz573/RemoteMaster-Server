'use client';

import React, { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { Building2, ChevronRight } from 'lucide-react';

// Optimized TreeItem component
interface TreeItemProps {
  title: string;
  hosts: number;
  onClick: () => void;
  isSelected: boolean;
}

export const TreeItem = memo(function TreeItem({ 
  title, 
  hosts, 
  onClick, 
  isSelected 
}: TreeItemProps) {
  const className = useMemo(() => `
    w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors
    ${isSelected 
      ? 'bg-primary text-primary-foreground' 
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }
  `, [isSelected]);

  const badgeClassName = useMemo(() => `
    text-xs px-2 py-1 rounded transition-colors
    ${isSelected 
      ? 'bg-primary-foreground/20 text-primary-foreground' 
      : 'bg-muted text-muted-foreground'
    }
  `, [isSelected]);

  return (
    <button onClick={onClick} className={className}>
      <span className="flex items-center">
        <ChevronRight className="h-3 w-3 mr-2" />
        {title}
      </span>
      <span className={badgeClassName}>
        {hosts}
      </span>
    </button>
  );
});

// Optimized HostCard component
interface HostCardProps {
  host: {
    id: string;
    name: string;
    status: string;
    type: string;
  };
  isSelected: boolean;
  onToggle: () => void;
}

export const HostCard = memo(function HostCard({ 
  host, 
  isSelected, 
  onToggle 
}: HostCardProps) {
  const getTypeIcon = useMemo(() => (type: string) => {
    switch (type.toLowerCase()) {
      case 'web':
        return <Building2 className="h-4 w-4" />;
      case 'database':
        return <Building2 className="h-4 w-4" />;
      case 'application':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  }, []);

  const className = useMemo(() => `
    relative p-4 border rounded-lg cursor-pointer transition-all
    ${isSelected 
      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
      : 'border-border hover:border-primary/50'
    }
  `, [isSelected]);

  return (
    <div
      data-host-id={host.id}
      className={className}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox checked={isSelected} onChange={onToggle} />
          <div>
            <h3 className="font-medium">{host.name}</h3>
            <p className="text-sm text-muted-foreground">{host.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getTypeIcon(host.type)}
          <StatusIndicator status={host.status} />
        </div>
      </div>
    </div>
  );
});

// Optimized SidebarLink component
interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SidebarLink = memo(function SidebarLink({ 
  href, 
  children 
}: SidebarLinkProps) {
  return (
    <a 
      href={href} 
      className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
    >
      {children}
    </a>
  );
});

// Optimized SelectionRectangle component
interface SelectionRectangleProps {
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  dragEnd: { x: number; y: number } | null;
}

export const SelectionRectangle = memo(function SelectionRectangle({
  isDragging,
  dragStart,
  dragEnd,
}: SelectionRectangleProps) {
  if (!isDragging || !dragStart || !dragEnd) {
    return null;
  }

  const style = useMemo(() => ({
    left: Math.min(dragStart.x, dragEnd.x),
    top: Math.min(dragStart.y, dragEnd.y),
    width: Math.abs(dragEnd.x - dragStart.x),
    height: Math.abs(dragEnd.y - dragStart.y),
  }), [dragStart, dragEnd]);

  return (
    <div
      className="absolute border-2 border-primary bg-primary/10 pointer-events-none z-10"
      style={style}
    />
  );
});

// Optimized Toolbar component
interface ToolbarProps {
  selectedUnit: string | null;
  selectedHostsCount: number;
  onSelectAll: () => void;
  onClear: () => void;
}

export const Toolbar = memo(function Toolbar({
  selectedUnit,
  selectedHostsCount,
  onSelectAll,
  onClear,
}: ToolbarProps) {
  return (
    <div className="border-b bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">
            {selectedUnit ? 'Host Management' : 'Select an Organizational Unit'}
          </h2>
          {selectedHostsCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedHostsCount} host{selectedHostsCount !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
});

// Optimized EmptyState component
interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const EmptyState = memo(function EmptyState({
  title,
  description,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}); 