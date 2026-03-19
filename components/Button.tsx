import React from 'react';
import type { AppTheme } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  fullWidth?: boolean;
  theme: AppTheme;
}

export const Button: React.FC<ButtonProps> = ({ children, isLoading, className, fullWidth, theme, ...props }) => {
  const baseClasses = "relative inline-flex items-center justify-center gap-2 px-4 py-2.5 font-bold text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-md hover:shadow-lg active:scale-95 active:shadow-inner";
  
  // Fallback if no specific className passed, use primary from theme but add gradients and subtle borders
  let colorClasses = className;
  if (!colorClasses) {
      colorClasses = `${theme.classes.button.primary} bg-gradient-to-b from-white/10 to-transparent border-t border-white/10 hover:brightness-110 hover:border-white/20`;
  } else {
      // Even if custom class is passed, try to add the gradient overlay for consistency unless it conflicts hard
      colorClasses = `${className} bg-gradient-to-b from-white/10 to-transparent border-t border-white/10 hover:brightness-110 hover:border-white/20`;
  }

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${colorClasses} ${widthClass}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Shine effect container */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-0 pointer-events-none"></div>
      
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
            children
        )}
      </span>
    </button>
  );
};