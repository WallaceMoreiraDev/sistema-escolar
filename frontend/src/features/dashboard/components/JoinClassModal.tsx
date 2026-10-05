import { createPortal } from 'react-dom'
import { useState } from 'react'

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError(true);
      return;
    }
    setError(false);
    onSuccess();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors z-10"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Entrar na Turma</h2>
          <p className="text-sm text-slate-500 mt-2">Insira o código fornecido pelo líder da sua sala.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Código de Convite</label>
            <input 
              type="text" 
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: X8K9J4"
              maxLength={6}
              className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary'} bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white uppercase font-bold text-center tracking-widest focus:ring-2 outline-none transition-all`}
            />
            {error && <p className="text-xs font-medium text-red-500 mt-2 text-center animate-pulse">Código inválido, expirado ou turma inexistente.</p>}
          </div>

          <button 
            type="submit"
            className="w-full px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 font-bold transition-all active:scale-95"
          >
            Confirmar e Entrar
          </button>
        </form>
      </div>
    </div>,
    document.body
  )
}
