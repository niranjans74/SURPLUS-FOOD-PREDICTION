import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footerButtons }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-dark-border flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] text-sm text-slate-600 dark:text-slate-300">
          {children}
        </div>
        
        {/* Footer */}
        {footerButtons && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/40 flex justify-end gap-3">
            {footerButtons}
          </div>
        )}
      </div>
    </div>
  );
}
