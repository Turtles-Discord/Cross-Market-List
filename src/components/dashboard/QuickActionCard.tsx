import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  className = '',
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={`block p-6 bg-white rounded-lg border border-gray-200 shadow-sm 
        hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700
        transition-colors duration-200 ${className}`}
    >
      <div className="flex items-start">
        <div className={`p-3 rounded-full ${iconBgColor} ${iconColor} mr-4`}>
          <Icon icon={icon} size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </Link>
  );
} 