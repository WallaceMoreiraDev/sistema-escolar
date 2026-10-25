import { useState } from 'react';
import { UserPlus, Copy, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';

interface InviteSectionProps {
  turma?: {
    codigoConvite?: string | null;
    nomeOficial?: string | null;
  } | null;
}

export function InviteSection({ turma }: InviteSectionProps = {}) {
  const { user, isLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  const inviteCode = turma !== undefined ? turma?.codigoConvite || null : user?.turma?.codigoConvite || null;
  const displayCode = inviteCode || '------';
  const className = turma !== undefined ? turma?.nomeOficial : user?.turma?.nomeOficial;

  const handleCopy = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Convite de Alunos</h2>
          {className && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Turma: <span className="font-semibold text-slate-700 dark:text-slate-300">{className}</span>
            </p>
          )}
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Código de Acesso da Sala</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            Compartilhe este código com os colegas da sua turma (ex: no grupo do WhatsApp). Ele permite que outros alunos ingressem automaticamente nesta sala na plataforma e tenham acesso a todos os eventos criados por você.
          </p>

          {!isLoading && !inviteCode && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-3 py-2 rounded-lg max-w-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>O código de convite para esta turma ainda não foi gerado ou está indisponível.</span>
            </div>
          )}
        </div>

        <div className="w-full md:w-auto flex flex-col items-center gap-3 min-w-[200px]">
          {isLoading ? (
            <div className="w-full space-y-3">
              <div className="h-16 w-full md:w-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              <div className="h-12 w-full md:w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-2xl font-black tracking-widest text-primary shadow-inner w-full text-center select-all">
                {displayCode}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!inviteCode}
                className={`w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
                  !inviteCode
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                    : copied
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 hover:shadow-md'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Código
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
