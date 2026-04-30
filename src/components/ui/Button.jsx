import React from 'react';
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';

const BASE = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

const VARIANTS = {
  primary:   'bg-[#2D6A4F] text-white hover:bg-[#245A41] focus:ring-[#2D6A4F]',
  secondary: 'bg-[#F4845F] text-white hover:bg-[#e07550] focus:ring-[#F4845F]',
  danger:    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  ghost:     'bg-transparent text-[#2D6A4F] hover:bg-[#f0fdf4] border border-[#2D6A4F] focus:ring-[#2D6A4F]',
  outline:   'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-gray-400',
  link:      'bg-transparent text-[#2D6A4F] hover:underline focus:ring-[#2D6A4F] rounded-none',
};

const SIZES = {
  xs: 'text-xs px-3 py-1.5 gap-1',
  sm: 'text-sm px-4 py-2 gap-1.5',
  md: 'text-sm px-5 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}) {
  return (
    <button
      className={clsx(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" color={variant === 'ghost' || variant === 'outline' ? 'primary' : 'white'} />
      ) : leftIcon ? (
        <span className="w-4 h-4 flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && (
        <span className="w-4 h-4 flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
