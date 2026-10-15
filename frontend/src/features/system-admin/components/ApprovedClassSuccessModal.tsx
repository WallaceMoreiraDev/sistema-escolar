import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ApproveClassRequestResponse } from '@shared/types';

interface ApprovedClassSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ApproveClassRequestResponse | null;
  requesterName?: string;
}

export function ApprovedClassSuccessModal({
  isOpen,
  onClose,
  data,
  requesterName = 'O aluno',
}: ApprovedClassSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.codigoConvite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback silencioso
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-emerald-500/20 dark:border-emerald-500/30 p-6 sm:p-8 flex flex-col text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícone de Sucesso */}
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mb-5 shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1.5">
          Turma Criada com Sucesso!
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
          A sala <strong className="text-slate-800 dark:text-slate-200">{data.nomeOficial}</strong> foi oficializada no sistema.
        </p>

        {/* Card do Código de Convite */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
            Código de Convite Único
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-mono font-black text-primary tracking-widest select-all">
              {data.codigoConvite}
            </span>
            <button
              onClick={handleCopyCode}
              type="button"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-all shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              title="Copiar Código"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Nota Informativa */}
        <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 text-left bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-6 leading-relaxed">
          <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            O aluno <strong className="text-slate-700 dark:text-slate-300">{requesterName}</strong> foi promovido a <strong>Líder</strong> da turma e já pode compartilhar este código com os outros estudantes para que entrem na sala.
          </p>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm"
        >
          Concluir
        </button>
      </div>
    </div>,
    document.body
  );
}
