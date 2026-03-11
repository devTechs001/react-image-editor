// frontend/src/components/ui/Button.jsx
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

const buttonVariants = {
  primary: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-glow hover:from-primary-400 hover:to-secondary-400 hover:shadow-glow-lg',
  secondary: 'bg-primary-500/10 text-primary-300 border border-primary-500/30 hover:bg-primary-500/20 hover:border-primary-500/50',
  ghost: 'text-surface-300 hover:bg-white/5 hover:text-white',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50',
  outline: 'border border-surface-600 text-surface-300 hover:bg-white/5 hover:border-surface-500',
  glass: 'bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10'
};

const buttonSizes = {
  xs: 'px-2 py-1 text-xs rounded-lg',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
  icon: 'p-2.5 rounded-xl',
  'icon-sm': 'p-2 rounded-lg',
  'icon-lg': 'p-3 rounded-xl'
};

const Button = forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  animate = true,
  ...props
}, ref) => {
  const isIconOnly = size.includes('icon');

  const buttonContent = (
    <>
      {loading && (
        <Loader2 className={cn(
          'animate-spin',
          isIconOnly ? 'h-5 w-5' : 'h-4 w-4'
        )} />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={cn(isIconOnly ? 'h-5 w-5' : 'h-4 w-4')} />
      )}
      {!isIconOnly && children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={cn(isIconOnly ? 'h-5 w-5' : 'h-4 w-4')} />
      )}
    </>
  );

  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-editor-bg',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    buttonVariants[variant],
    buttonSizes[size],
    fullWidth && 'w-full',
    className
  );

  if (animate && !disabled && !loading) {
    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <button
      ref={ref}
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;