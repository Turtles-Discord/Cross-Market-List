import React from 'react';

type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type LoadingVariant = 'default' | 'primary' | 'secondary' | 'white';

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  className?: string;
  fullPage?: boolean;
  text?: string;
}

const sizeStyles: Record<LoadingSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantStyles: Record<LoadingVariant, string> = {
  default: 'text-gray-400 dark:text-gray-600',
  primary: 'text-blue-600 dark:text-blue-500',
  secondary: 'text-purple-600 dark:text-purple-500',
  white: 'text-white',
};

export function Loading({
  size = 'md',
  variant = 'primary',
  className = '',
  fullPage = false,
  text,
}: LoadingProps) {
  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizeStyles[size]} ${variantStyles[variant]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        data-testid="loading-spinner"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && (
        <div className={`mt-2 text-sm ${variantStyles[variant]}`}>{text}</div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// A skeleton loader component for content that's still loading
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  circle?: boolean;
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded = false,
  circle = false,
}: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse bg-gray-200 dark:bg-gray-700
        ${rounded ? 'rounded-md' : ''}
        ${circle ? 'rounded-full' : ''}
        ${className}
      `}
      style={{
        width: width,
        height: height,
      }}
    ></div>
  );
} 