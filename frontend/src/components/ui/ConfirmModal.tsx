import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar', 
  onConfirm, 
  onCancel,
  isDestructive = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCancel}>
      <div 
        className="glass-panel w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/30 p-6 flex flex-col text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-rose-100 text-rose-500 dark:bg-rose-500/20' : 'bg-amber-100 text-amber-500 dark:bg-amber-500/20'}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 mt-auto">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition-colors ${
              isDestructive 
                ? 'bg-rose-500 hover:bg-rose-600' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
