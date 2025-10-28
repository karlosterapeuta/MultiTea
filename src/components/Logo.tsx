import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const Logo = ({ className, size = 'md' }: LogoProps) => {
  const isSmall = size === 'sm';
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div
        className={cn(
          'bg-primary rounded-md flex items-center justify-center',
          isSmall ? 'h-8 w-8' : 'h-10 w-10'
        )}
      >
        <svg
          width={isSmall ? '20' : '24'}
          height={isSmall ? '20' : '24'}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary-foreground"
        >
          <path
            d="M12 2L12 11M12 11C12 11 15 13 15 15C15 17 12 19 12 22C12 19 9 17 9 15C9 13 12 11 12 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 3H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        className={cn(
          'font-bold text-foreground tracking-tight',
          isSmall ? 'text-xl' : 'text-2xl'
        )}
      >
        MultiTea
      </span>
    </div>
  );
};