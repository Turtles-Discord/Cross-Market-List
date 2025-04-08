import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

export function Icon({
  icon: LucideIcon,
  size = 24,
  color,
  className = '',
  onClick,
}: IconProps) {
  return (
    <LucideIcon
      size={size}
      color={color}
      className={className}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    />
  );
} 