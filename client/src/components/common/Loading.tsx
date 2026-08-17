import React from 'react';
import { motion } from 'framer-motion';

export const Loading = ({ text = 'Đang tải dữ liệu...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {/* Heartbeat pulse animation */}
      <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.25, 1, 1.35, 1],
            opacity: [0.6, 1, 0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-crimson-light border border-crimson/30"
        />
        <svg
          className="w-8 h-8 text-crimson relative z-10"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      <p className="text-sm font-medium text-ink-muted tracking-wide animate-pulse">
        {text}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
};

export const CardSkeleton = () => {
  return (
    <div className="bg-porcelain-card rounded-2xl border border-sand p-6 shadow-warm animate-pulse">
      <div className="h-48 bg-sand/50 rounded-xl mb-4"></div>
      <div className="h-5 bg-sand rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-sand/60 rounded w-1/2 mb-6"></div>
      <div className="space-y-2 mb-6">
        <div className="h-3.5 bg-sand/40 rounded w-full"></div>
        <div className="h-3.5 bg-sand/40 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-sand/40">
        <div className="h-4 bg-sand rounded w-24"></div>
        <div className="h-9 bg-sand rounded-xl w-32"></div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-sand bg-porcelain-card shadow-warm animate-pulse">
      <div className="h-12 bg-sand/30 border-b border-sand"></div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 p-4 border-b border-sand/40 last:border-0"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 bg-sand/60 rounded flex-1"
              style={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Loading;
