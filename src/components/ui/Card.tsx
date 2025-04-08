import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: CardHeaderProps) {
  return (
    <div className={`px-6 py-5 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-medium leading-6 text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children }: CardDescriptionProps) {
  return (
    <p className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children }: CardContentProps) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
} 