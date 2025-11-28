"use client"

import { UserStatus } from "@/lib/types/userStatus"
import { cn } from "@/lib/utils"

interface UserStatusIndicatorProps {
  status: UserStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function UserStatusIndicator({
  status,
  size = 'md',
  showLabel = false,
  className
}: UserStatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const statusConfig = {
    [UserStatus.ONLINE]: {
      color: 'bg-green-500',
      label: 'Đang hoạt động',
      ring: 'ring-green-500/20'
    },
    [UserStatus.OFFLINE]: {
      color: 'bg-gray-400',
      label: 'Không hoạt động',
      ring: 'ring-gray-400/20'
    }
  }

  const config = statusConfig[status]

  if (showLabel) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "rounded-full ring-2",
          sizeClasses[size],
          config.color,
          config.ring
        )} />
        <span className="text-sm text-muted-foreground">{config.label}</span>
      </div>
    )
  }

  return (
    <div className={cn(
      "rounded-full ring-2",
      sizeClasses[size],
      config.color,
      config.ring,
      className
    )} />
  )
}

