import React from 'react';
import { LucideIcon } from 'lucide-react';

type ChangeType = 'increase' | 'decrease' | 'neutral';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: string;
  changeType?: ChangeType;
  iconColor?: string;
  iconBackgroundColor?: string;
  suffix?: string;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  iconBackgroundColor = 'bg-blue-500 bg-opacity-10',
  iconColor = 'text-blue-500',
  suffix,
  className = '',
}: DashboardCardProps) {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg dark:bg-gray-800 ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${iconBackgroundColor}`}>
            <div className={`h-6 w-6 ${iconColor}`}>
              <Icon size={24} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
                {suffix && <span className="text-sm ml-1 text-gray-500 dark:text-gray-400">{suffix}</span>}
              </div>
              
              {change && (
                <div
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    changeType === 'increase'
                      ? 'text-green-600 dark:text-green-500'
                      : changeType === 'decrease'
                      ? 'text-red-600 dark:text-red-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {changeType === 'increase' ? (
                    <svg
                      className="self-center flex-shrink-0 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : changeType === 'decrease' ? (
                    <svg
                      className="self-center flex-shrink-0 h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : null}
                  <span className="sr-only">
                    {changeType === 'increase' ? 'Increased' : changeType === 'decrease' ? 'Decreased' : 'No change'} by
                  </span>
                  {change}
                </div>
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
} 