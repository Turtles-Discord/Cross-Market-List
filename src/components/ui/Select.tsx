import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  fullWidth?: boolean;
  emptyOption?: {
    label: string;
    value: string;
  };
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      options,
      label,
      error,
      containerClassName = '',
      labelClassName = '',
      errorClassName = '',
      fullWidth = false,
      id,
      emptyOption,
      ...props
    },
    ref
  ) => {
    const selectId = id || React.useId();

    return (
      <div className={`${containerClassName} ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={selectId}
            className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${labelClassName}`}
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          className={`
            px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600
            ${error ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' : ''}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {emptyOption && (
            <option value={emptyOption.value}>{emptyOption.label}</option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p
            id={`${selectId}-error`}
            className={`mt-1 text-sm text-red-600 dark:text-red-500 ${errorClassName}`}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select'; 