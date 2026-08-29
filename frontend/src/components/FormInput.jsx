import React from 'react';

export default function FormInput({ label, id, name, type = "text", value, onChange, placeholder, required, error, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-brand-orange-500">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 transition-all ${
          error ? 'border-brand-orange-500 focus:ring-brand-orange-500 focus:border-brand-orange-500' : ''
        }`}
        {...props}
      />
      {error && <span className="text-xs text-brand-orange-500 font-semibold">{error}</span>}
    </div>
  );
}
