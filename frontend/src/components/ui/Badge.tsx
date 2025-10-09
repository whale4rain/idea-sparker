import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default:
        'badge-default border-transparent bg-primary text-primary-foreground',
      secondary:
        'badge-secondary border-transparent bg-secondary text-secondary-foreground',
      success:
        'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
      warning:
        'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      error: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
      info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    return (
      <div
        ref={ref}
        className={cn(
          'badge inline-flex items-center gap-1 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          removable && 'pr-1',
          className
        )}
        {...props}
      >
        {children}
        {removable && (
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
