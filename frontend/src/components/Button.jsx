import React from 'react';

export default function Button({ children, type = "button", variant = "primary", onClick, disabled, className = "" }) {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-green-600 hover:bg-brand-green-700 text-white focus:ring-brand-green-500 shadow-sm shadow-brand-green-500/10",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-700 focus:ring-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200",
    danger: "bg-brand-orange-500 hover:bg-brand-orange-600 text-white focus:ring-brand-orange-400 shadow-sm shadow-brand-orange-500/10",
    outline: "border border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-dark-border dark:hover:bg-slate-800 dark:text-slate-200"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
