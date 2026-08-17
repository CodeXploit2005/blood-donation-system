import React from 'react';

export const PulseDivider = ({ className = '', color = '#C4384A', height = 24 }) => {
  return (
    <div className={`flex items-center justify-center my-6 overflow-hidden ${className}`}>
      <div className="flex-1 h-px bg-sand-dark/60 max-w-xs sm:max-w-md"></div>
      <svg
        className="mx-3 text-crimson animate-pulse"
        width="64"
        height={height}
        viewBox="0 0 100 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 15 H35 L40 5 L45 25 L50 2 L55 28 L60 15 H100"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex-1 h-px bg-sand-dark/60 max-w-xs sm:max-w-md"></div>
    </div>
  );
};

export default PulseDivider;
