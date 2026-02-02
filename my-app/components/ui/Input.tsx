import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            {icon}
          </div>
        )}
        
        <input
          className={`
            w-full bg-zinc-800 border rounded-lg px-4 py-3 text-white
            focus:outline-none focus:ring-2 transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-cyan-500/50 focus:border-cyan-500'}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-zinc-500">
          {helperText}
        </p>
      )}
    </div>
  );
}