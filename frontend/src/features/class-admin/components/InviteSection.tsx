import { useEffect, useRef, useState } from 'react';
import { UserPlus, Link2, Copy, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';

interface InviteSectionProps {
  turma?: {
    codigoConvite?: string | null;
    nomeOficial?: string | null;
  } | null;
}

export function InviteSection({ turma }: InviteSectionProps = {}) {
  const { user, isLoading } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const linkTimerRef = useRef<number | null>(null);
  const codeTimerRef = useRef<number | null>(null);

  const inviteCode = turma !== undefined ? turma?.codigoConvite || null : user?.turma?.codigoConvite || null;
  const displayCode = inviteCode || '------';
  const className = turma !== undefined ? turma?.nomeOficial : user?.turma?.nomeOficial;
  const inviteLink =
    inviteCode && typeof window !== 'undefined'
      ? `${window.location.origin}/convite/${inviteCode}`
      : null;

  useEffect(() => {
    return () => {
      if (linkTimerRef.current !== null) window.clearTimeout(linkTimerRef.current);
      if (codeTimerRef.current !== null) window.clearTimeout(codeTimerRef.current);
    };
  }, []);

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      if (linkTimerRef.current !== null) window.clearTimeout(linkTimerRef.current);
      linkTimerRef.current = window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Ignora erro caso o navegador bloqueie acesso à área de transferência
    }
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      if (codeTimerRef.current !== null) window.clearTimeout(codeTimerRef.current);
      codeTimerRef.current = window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Ignora erro caso o navegador bloqueie acesso à área de transferência
    }
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Link Direto e Código da Sala</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
            Envie o link de convite diretamente no grupo da turma (ex: WhatsApp). Seus colegas entram automaticamente nesta sala assim que fizerem login, sem precisar digitar o código manualmente.
          </p>

          {!isLoading && !inviteCode && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-3 py-2 rounded-lg max-w-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>O código de convite para esta turma ainda não foi gerado ou está indisponível.</span>
            </div>
          )}
        </div>

        <div className="w-full md:w-auto flex flex-col items-center gap-2.5 min-w-[240px]">
          {isLoading ? (
            <div className="w-full space-y-2.5">
              <div className="h-16 w-full md:w-60 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              <div className="h-12 w-full md:w-60 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-9 w-full md:w-60 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-2xl font-black tracking-widest text-primary shadow-inner w-full text-center select-all">
                {displayCode}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                disabled={!inviteLink}
                className={`w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer ${
                  !inviteLink
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                    : copiedLink
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                    : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md shadow-primary/20'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 shrink-0" />
                    <span>Copiar Link de Convite</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                disabled={!inviteCode}
                className={`w-full py-2 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border cursor-pointer ${
                  !inviteCode
                    ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                    : copiedCode
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Código Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>Copiar apenas o código</span>
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
