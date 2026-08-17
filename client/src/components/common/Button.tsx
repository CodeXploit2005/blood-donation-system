import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';

type ButtonProps = Omit<React.ComponentPropsWithoutRef<typeof motion.button>, 'children'> & {
  children: ReactNode;
  variant?: string;
  size?: string;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick = undefined,
  type = 'button',
  ...props
}: ButtonProps) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants: Record<string, string> = {
    primary:
      'bg-crimson text-white hover:bg-crimson-deep shadow-sm hover:shadow-pulse-glow border border-transparent',
    secondary:
      'bg-sage text-white hover:bg-sage-deep shadow-sm hover:shadow-sage-glow border border-transparent',
    outline:
      'bg-transparent text-crimson border-2 border-crimson/40 hover:border-crimson hover:bg-crimson-light/60',
    sand:
      'bg-sand text-ink hover:bg-sand-dark border border-sand-dark/50',
    ghost:
      'bg-transparent text-ink-light hover:text-crimson hover:bg-crimson-light/40 border border-transparent',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm border border-transparent',
    dark:
      'bg-ink text-porcelain hover:bg-ink-deep border border-transparent',
  };

  const sizes: Record<string, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[42px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[50px] font-semibold',
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Đang xử lý...</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;
