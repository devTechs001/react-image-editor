// frontend/src/components/ui/Input.jsx
import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

const inputSizes = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-3 text-sm rounded-xl',
  lg: 'px-5 py-4 text-base rounded-xl'
};

const Input = forwardRef(({
  className,
  type = 'text',
  size = 'md',
  label,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  clearable = false,
  onClear,
  prefix,
  suffix,
  fullWidth = true,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const isSearch = type === 'search';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const hasLeftContent = Icon && iconPosition === 'left' || isSearch || prefix;
  const hasRightContent = Icon && iconPosition === 'right' || isPassword || clearable && props.value || suffix;

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {label && (
        <label className="block text-sm font-medium text-surface-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Left Content */}
        {hasLeftContent && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-surface-500">
            {prefix && <span className="text-sm">{prefix}</span>}
            {isSearch && <Search className="h-4 w-4" />}
            {Icon && iconPosition === 'left' && !isSearch && <Icon className="h-4 w-4" />}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          className={cn(
            'w-full bg-white/5 border border-white/10 text-white placeholder-surface-500',
            'transition-all duration-200',
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            inputSizes[size],
            hasLeftContent && 'pl-10',
            hasRightContent && 'pr-10',
            isFocused && 'border-primary-500/50',
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {/* Right Content */}
        {hasRightContent && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {clearable && props.value && (
              <button
                type="button"
                onClick={onClear}
                className="text-surface-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-surface-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            
            {suffix && <span className="text-sm text-surface-500">{suffix}</span>}
            {Icon && iconPosition === 'right' && <Icon className="h-4 w-4 text-surface-500" />}
          </div>
        )}
      </div>

      {/* Error/Hint */}
      {(error || hint) && (
        <p className={cn(
          'mt-2 text-xs',
          error ? 'text-red-400' : 'text-surface-500'
        )}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;