import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast]);
  const error = useCallback((msg: string) => toast(msg, 'error'), [toast]);
  const warning = useCallback((msg: string) => toast(msg, 'warning'), [toast]);
  const info = useCallback((msg: string) => toast(msg, 'info'), [toast]);

  // Helper icons and styles matching each toast type
  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="text-green-500" size={20} />,
          border: 'border-green-200/80 dark:border-green-900/40 bg-green-50/90 dark:bg-green-950/20',
          text: 'text-green-800 dark:text-green-300'
        };
      case 'error':
        return {
          icon: <AlertCircle className="text-red-500" size={20} />,
          border: 'border-red-200/80 dark:border-red-900/40 bg-red-50/90 dark:bg-red-950/20',
          text: 'text-red-800 dark:text-red-300'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-amber-500" size={20} />,
          border: 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/90 dark:bg-amber-950/20',
          text: 'text-amber-800 dark:text-amber-300'
        };
      case 'info':
      default:
        return {
          icon: <Info className="text-blue-500" size={20} />,
          border: 'border-blue-200/80 dark:border-blue-900/40 bg-blue-50/90 dark:bg-blue-950/20',
          text: 'text-blue-800 dark:text-blue-300'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast Portal/Stack Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const config = getToastConfig(t.type);
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-md border ${config.border} transition-colors duration-300`}
              >
                <div className="shrink-0 mt-0.5">{config.icon}</div>
                <div className={`flex-1 text-sm font-medium leading-relaxed ${config.text}`}>
                  {t.message}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
