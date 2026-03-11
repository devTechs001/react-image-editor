// frontend/src/components/ui/Toast.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const toastVariants = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  error: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
};

export default function Toast({
  id,
  message,
  type = 'info',
  duration = 5000,
  onDismiss,
  action,
  position = 'top-right'
}) {
  useEffect(() => {
    if (duration !== null) {
      const timer = setTimeout(() => {
        onDismiss?.(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const Icon = toastIcons[type];

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-elevated',
        'min-w-[300px] max-w-md',
        toastVariants[type],
        positionClasses[position]
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-3 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {action.label}
        </button>
      )}
      <button
        onClick={() => onDismiss?.(id)}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Toast Container
export function ToastContainer({ toasts, onDismiss, position = 'top-right' }) {
  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col gap-2',
        position === 'top-right' && 'top-4 right-4',
        position === 'top-left' && 'top-4 left-4',
        position === 'bottom-right' && 'bottom-4 right-4',
        position === 'bottom-left' && 'bottom-4 left-4'
      )}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={onDismiss} position={position} />
        ))}
      </AnimatePresence>
    </div>
  );
}
