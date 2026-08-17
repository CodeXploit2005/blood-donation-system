import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = null,
  title = 'Chưa có dữ liệu',
  description = 'Hiện tại chưa có mục nào phù hợp để hiển thị.',
  actionText = null,
  onAction = null,
  actionVariant = 'primary',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-porcelain-card border border-dashed border-sand-dark/80 my-4 ${className}`}
    >
      {/* Line art Icon Illustration */}
      <div className="w-16 h-16 rounded-2xl bg-sand-light border border-sand flex items-center justify-center text-crimson mb-4 shadow-sm">
        {Icon ? (
          <Icon className="w-8 h-8 stroke-[1.5]" />
        ) : (
          <svg
            className="w-8 h-8 text-crimson stroke-[1.5]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        )}
      </div>

      <h4 className="font-display text-lg sm:text-xl font-bold text-ink mb-1">
        {title}
      </h4>
      <p className="text-sm text-ink-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <Button variant={actionVariant} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
