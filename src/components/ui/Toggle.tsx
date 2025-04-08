import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  containerClassName = '',
  labelClassName = '',
  descriptionClassName = '',
  size = 'md',
  id,
}: ToggleProps) {
  const toggleId = id || React.useId();
  
  const sizeClasses = {
    sm: {
      toggle: 'h-4 w-7',
      dot: 'h-3 w-3 translate-x-0.5 group-checked:translate-x-3.5',
    },
    md: {
      toggle: 'h-5 w-9',
      dot: 'h-4 w-4 translate-x-0.5 group-checked:translate-x-4.5',
    },
    lg: {
      toggle: 'h-6 w-11',
      dot: 'h-5 w-5 translate-x-0.5 group-checked:translate-x-5.5',
    },
  };

  return (
    <div className={`flex items-center ${containerClassName}`}>
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`
          group relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${sizeClasses[size].toggle}
        `}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          className={`
            pointer-events-none relative inline-block rounded-full bg-white shadow
            transform ring-0 transition duration-200 ease-in-out
            ${sizeClasses[size].dot}
          `}
        >
          <span
            className={`
              absolute inset-0 flex h-full w-full items-center justify-center transition-opacity
              ${checked ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'}
            `}
            aria-hidden="true"
          ></span>
          <span
            className={`
              absolute inset-0 flex h-full w-full items-center justify-center transition-opacity
              ${checked ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'}
            `}
            aria-hidden="true"
          ></span>
        </span>
      </button>
      
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={toggleId}
              className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${
                disabled ? 'opacity-50' : ''
              } ${labelClassName}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              className={`text-sm text-gray-500 dark:text-gray-400 ${
                disabled ? 'opacity-50' : ''
              } ${descriptionClassName}`}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 