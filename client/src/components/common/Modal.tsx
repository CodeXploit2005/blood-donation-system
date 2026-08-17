import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/70 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative z-10 flex w-full ${maxWidth} max-h-[100dvh] sm:max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-porcelain-card dark:bg-[#1A1E22] shadow-2xl border border-sand dark:border-white/15 text-ink dark:text-porcelain`}
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-crimson via-crimson-deep to-sage"></div>

            {/* Header */}
            {(title || showClose) && (
              <div className="relative z-20 flex flex-none items-start justify-between gap-3 border-b border-sand/60 dark:border-white/10 px-4 pb-3 pt-5 sm:px-8 sm:pb-4 sm:pt-7 bg-porcelain-card dark:bg-[#1A1E22]">
                <div className="min-w-0 pr-1">
                  {title && (
                    <h3 className="font-display text-lg sm:text-2xl font-bold text-ink dark:text-white tracking-tight leading-tight">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="line-clamp-2 text-xs sm:text-sm text-ink-muted dark:text-gray-400 mt-1 leading-relaxed">{subtitle}</p>
                  )}
                </div>

                {showClose && (
                  <button
                    onClick={onClose}
                    className="-mr-1 -mt-1 flex h-10 w-10 flex-none items-center justify-center text-ink-muted dark:text-gray-300 hover:text-crimson hover:bg-crimson-light dark:hover:bg-white/10 rounded-xl transition-colors"
                    aria-label="Đóng"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-8 sm:py-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
