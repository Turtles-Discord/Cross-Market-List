"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from './ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4">
          <Alert
            variant="error"
            title="Something went wrong"
            onDismiss={() => this.setState({ hasError: false, error: null })}
          >
            <div>
              <p>An error occurred in this component.</p>
              {this.state.error && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs font-mono overflow-auto max-h-48">
                  {this.state.error.toString()}
                </div>
              )}
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try again
              </button>
            </div>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Client-side error component that works with Next.js error handling
export function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert
          variant="error"
          title="Something went wrong"
        >
          <div>
            <p>An unexpected error occurred.</p>
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs font-mono overflow-auto max-h-48">
              {error.message}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={reset}
            >
              Try again
            </button>
          </div>
        </Alert>
      </div>
    </div>
  );
} 