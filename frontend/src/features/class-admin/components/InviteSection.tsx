import { useState } from 'react';

export function InviteSection() {
  const [copied, setCopied] = useState(false);
  
  const inviteCode = "X8K9J4";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Convite de Alunos</h2>
      </div>
      
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Código de Acesso da Sala</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            Compartilhe este código com os colegas da sua turma (ex: no grupo do WhatsApp). Ele permite que outros alunos ingressem automaticamente nesta sala na plataforma e tenham acesso a todos os eventos criados por você.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col items-center gap-3">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-2xl font-black tracking-widest text-primary shadow-inner w-full text-center">
            {inviteCode}
          </div>
          
          <button 
            onClick={handleCopy}
            className={`w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
              copied 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 hover:shadow-md'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Copiado!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copiar Código
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
