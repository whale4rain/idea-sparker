import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    className,
    variant = 'text',
    width,
    height,
    animation = 'pulse',
    ...props
  }, ref) => {
    const variantClasses = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-md'
    };

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: ''
    };

    const style: React.CSSProperties = {
      width: width || (variant === 'text' ? '100%' : undefined),
      height: height || (variant === 'text' ? '1rem' : undefined),
      ...props.style
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-muted',
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Predefined skeleton components for common use cases
export const TextSkeleton = ({
  lines = 3,
  className,
  ...props
}: Omit<SkeletonProps, 'variant'> & { lines?: number }) => (
  <div className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        className={cn(
          i === lines - 1 && 'w-3/4' // Last line is shorter
        )}
      />
    ))}
  </div>
);

export const CardSkeleton = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('p-4 space-y-4', className)} {...props}>
    <Skeleton variant="text" width="60%" height="1.5rem" />
    <Skeleton variant="text" width="40%" height="1rem" />
    <Skeleton variant="rectangular" height="8rem" />
  </div>
);

export const AvatarSkeleton = ({ size = 'md', className, ...props }: Omit<SkeletonProps, 'variant' | 'width' | 'height'> & { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeMap = {
    xs: '1.5rem',
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
    xl: '4rem'
  };

  return (
    <Skeleton
      variant="circular"
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={className}
      {...props}
    />
  );
};

export { Skeleton };
