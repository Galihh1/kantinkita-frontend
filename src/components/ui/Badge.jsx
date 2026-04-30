import React from 'react';
import clsx from 'clsx';

const VARIANTS = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-600',
  info:    'bg-blue-100 text-blue-700',
  gray:    'bg-gray-100 text-gray-600',
  primary: 'bg-[#f0fdf4] text-[#2D6A4F]',
  orange:  'bg-orange-100 text-orange-700',
  purple:  'bg-purple-100 text-purple-700',
};

const SIZES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

const DOT_COLORS = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  gray:    'bg-gray-400',
  primary: 'bg-[#2D6A4F]',
  orange:  'bg-orange-500',
  purple:  'bg-purple-500',
};

export default function Badge({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className,
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium rounded-full',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_COLORS[variant])}
        />
      )}
      {children}
    </span>
  );
}
