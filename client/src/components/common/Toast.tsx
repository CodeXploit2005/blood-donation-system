import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (msg, duration) => showToast(msg, 'success', duration);
  const error = (msg, duration) => showToast(msg, 'error', duration);
  const info = (msg, duration) => showToast(msg, 'info', duration);
  const warning = (msg, duration) => showToast(msg, 'warning', duration);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  const { type, message, duration } = toast;

  const styles = {
    success: {
      bg: 'bg-white dark:bg-[#1E232A] border-emerald-500/40 text-ink dark:text-white shadow-lg shadow-emerald-500/10',
      bar: 'bg-emerald-500',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-white dark:bg-[#1E232A] border-rose-500/40 text-ink dark:text-white shadow-lg shadow-rose-500/10',
      bar: 'bg-rose-500',
      icon: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-white dark:bg-[#1E232A] border-amber-500/40 text-ink dark:text-white shadow-lg shadow-amber-500/10',
      bar: 'bg-amber-500',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-white dark:bg-[#1E232A] border-blue-500/40 text-ink dark:text-white shadow-lg shadow-blue-500/10',
      bar: 'bg-blue-500',
      icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl ${currentStyle.bg} flex items-start gap-3 backdrop-blur-md`}
    >
      {currentStyle.icon}
      <div className="flex-1 text-xs font-semibold leading-relaxed">{message}</div>
      <button
        onClick={onDismiss}
        className="text-ink-muted dark:text-gray-400 hover:text-crimson p-0.5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Countdown Timer Progress Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-1 ${currentStyle.bar}`}
      />
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
