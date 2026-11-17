import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LogOut,
  RefreshCw,
  UserPlus,
  Users,
  WifiOff,
} from 'lucide-react';
import { joinClassSchema } from '@shared/schemas/classSchema';
import type { JoinClassResponse } from '@shared/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useJoinClass } from './hooks/useClassRequests';
import { ApiError } from '@/utils/apiError';
import { getErrorMessage } from '@/utils/errorMessages';
import {
  clearPendingInviteCode,
  savePendingInviteCode,
} from '@/utils/pendingNavigation';

/**
 * Skeleton padronizado para evitar Layout Shift durante carregamento de sessão
 * ou vinculação automática à turma (GEMINI.md Seção 5).
 */
function InviteCardSkeleton({ showLinkingHint = false }: { showLinkingHint?: boolean }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col items-center gap-6 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
        <div className="w-full flex flex-col items-center gap-3">
          <div className="h-7 w-48 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
          <div className="h-4 w-64 rounded-lg bg-slate-200/60 dark:bg-slate-800/70" />
          <div className="h-4 w-52 rounded-lg bg-slate-200/50 dark:bg-slate-800/50" />
        </div>
        {showLinkingHint && (
          <div className="w-full h-16 rounded-2xl bg-primary/10 border border-primary/15" />
        )}
        <div className="w-full h-12 rounded-xl bg-slate-200/70 dark:bg-slate-800/80" />
      </div>
    </div>
  );
}

/**
 * Página pública/híbrida de ingresso direto em turma via link compartilhável (/convite/:codigo).
 * Orquestra validação de código, autenticação Google OAuth com persistência em localStorage,
 * continuidade após onboarding e ingresso automático idempotente.
 */
export function InviteJoinPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, user, isLoading, isError, error, signOut } = useAuth();
  const joinMutation = useJoinClass();
  const { mutate: joinByCode } = joinMutation;

  const [isOAuthPending, setIsOAuthPending] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [joinedClass, setJoinedClass] = useState<JoinClassResponse | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Guarda idempotente por código para garantir execução única da mutação mesmo sob StrictMode
  const attemptedCodeRef = useRef<string | null>(null);

  const normalizedCode = (codigo ?? '').trim().toUpperCase();
  const validationResult = joinClassSchema.safeParse({ codigoConvite: normalizedCode });
  const isCodeValid = validationResult.success;

  const isUnauthorized = isError && error instanceof ApiError && error.status === 401;

  // Destrava o botão OAuth caso a página seja restaurada do BFCache (Safari iOS / navegadores móveis)
  useEffect(() => {
    const handlePageShow = () => {
      setIsOAuthPending(false);
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Trata sessão expirada (401) preservando o convite pendente para novo login
  useEffect(() => {
    if (isUnauthorized) {
      if (isCodeValid) {
        savePendingInviteCode(normalizedCode);
      }
      signOut();
    }
  }, [isUnauthorized, isCodeValid, normalizedCode, signOut]);

  // Limpa convite pendente se o código da URL for inválido
  useEffect(() => {
    if (!isCodeValid) {
      clearPendingInviteCode();
    }
  }, [isCodeValid]);

  // Persiste o código de convite para sobreviver ao redirect do Google OAuth e ao Onboarding
  useEffect(() => {
    if (!isCodeValid || isLoading) return;

    if (!session || (user && !user.onboardingConcluido)) {
      savePendingInviteCode(normalizedCode);
    }
  }, [isCodeValid, isLoading, session, user, normalizedCode]);

  // Limpa o convite pendente quando o usuário já pertence a uma turma (mesma ou outra)
  useEffect(() => {
    if (!isCodeValid || isLoading || !session || !user?.onboardingConcluido) return;

    if (user.turma && !joinedClass) {
      clearPendingInviteCode();
    }
  }, [isCodeValid, isLoading, session, user, joinedClass]);

  // Dispara ingresso automático idempotente quando autenticado, com onboarding concluído e sem turma
  useEffect(() => {
    if (!isCodeValid || isLoading || isError || !session || !user) return;
    if (!user.onboardingConcluido || user.turma) return;
    if (attemptedCodeRef.current === normalizedCode) return;

    attemptedCodeRef.current = normalizedCode;

    joinByCode(
      { codigoConvite: normalizedCode },
      {
        onSuccess: (result) => {
          clearPendingInviteCode();
          setJoinError(null);
          setJoinedClass(result);
        },
        onError: (err) => {
          clearPendingInviteCode();
          const friendlyMessage =
            err instanceof ApiError
              ? err.code === 'NOT_FOUND'
                ? 'Código de turma inválido ou inexistente.'
                : getErrorMessage(err.code)
              : err instanceof Error && err.message
              ? err.message
              : 'Não foi possível concluir o ingresso na turma.';
          setJoinError(friendlyMessage);
        },
      }
    );
  }, [isCodeValid, isLoading, isError, session, user, normalizedCode, joinByCode]);

  const handleGoogleLogin = async () => {
    if (!isCodeValid) return;

    setOauthError(null);
    setIsOAuthPending(true);
    savePendingInviteCode(normalizedCode);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    });

    if (authError) {
      setOauthError('Não foi possível iniciar o login com o Google. Tente novamente em instantes.');
      setIsOAuthPending(false);
    }
  };

  // ESTADO 1: Código da URL inválido
  if (!isCodeValid) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center ring-8 ring-red-50/50 dark:ring-red-950/20">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Link de convite inválido
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              O código informado no link não corresponde a um convite válido do Prumo. Peça ao líder da sua turma um novo link atualizado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(session ? '/app/dashboard' : '/login', { replace: true })}
            className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>{session ? 'Ir para o Dashboard' : 'Ir para o Início'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ESTADO 2: Sessão/perfil carregando ou deslogando sessão 401
  if (isLoading || isUnauthorized) {
    return <InviteCardSkeleton />;
  }

  // ESTADO 3: Usuário NÃO autenticado
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <img
                src="/pwa-192x192.png"
                alt="Prumo"
                className="w-16 h-16 rounded-2xl shadow-md object-contain bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 p-1"
              />
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest mb-3">
              CÓDIGO: {normalizedCode}
            </span>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Convite para Turma
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Você foi convidado para uma turma no Prumo! Entre com sua conta Google para ingressar automaticamente.
            </p>
          </div>

          {oauthError && (
            <div className="w-full p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{oauthError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isOAuthPending}
            className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white py-3.5 px-5 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {isOAuthPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  alt="Google Logo"
                  className="w-4 h-4"
                />
              </span>
            )}
            <span>
              {isOAuthPending ? 'Redirecionando...' : 'Entrar com Google e ingressar na turma'}
            </span>
          </button>

          <div className="w-full pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Ao continuar, você concorda com as nossas diretrizes de{' '}
              <Link
                to="/privacidade"
                className="underline hover:text-primary transition-colors font-medium"
              >
                Privacidade e LGPD
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback de erro de rede/servidor ao buscar perfil autenticado
  if (isError || !user) {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center ring-8 ring-red-50/50 dark:ring-red-950/20">
            {isOffline ? <WifiOff className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {isOffline ? 'Sem Conexão com a Internet' : 'Instabilidade na Conexão'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {isOffline
                ? 'Você parece estar sem acesso à internet. Reconecte-se para concluir seu ingresso na turma.'
                : 'Não foi possível validar sua conta no servidor no momento. Tente novamente em instantes.'}
            </p>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['me'] })}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-xs active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition-all text-xs active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ESTADO 4: Usuário autenticado, porém com Onboarding pendente
  if (!user.onboardingConcluido) {
    savePendingInviteCode(normalizedCode);
    return <Navigate to="/onboarding" replace />;
  }

  // ESTADO 5 — Sucesso do ingresso automático (avaliado antes do Caso A para não piscar após refetch de ['me'])
  if (joinedClass) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center shadow-inner ring-8 ring-emerald-500/5">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Bem-vindo à Turma!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Você ingressou automaticamente na turma:
            </p>
          </div>

          <div className="w-full p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
            <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200 tracking-wide">
              {joinedClass.nomeOficial}
            </p>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Agora você tem acesso ao calendário, atividades, links rápidos e avisos da sua sala.
          </p>

          <button
            type="button"
            onClick={() => navigate('/app/minha-turma', { replace: true })}
            className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Acessar Minha Turma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ESTADO 5 — Caso A: Já está vinculado a esta mesma turma
  if (user.turma && user.turma.codigoConvite?.toUpperCase() === normalizedCode) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Você já faz parte desta turma
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Sua conta já está vinculada à sala abaixo. Tudo pronto para acompanhar o calendário e as atividades.
            </p>
          </div>

          <div className="w-full p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {user.turma.nomeOficial}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/minha-turma', { replace: true })}
            className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Ir para Minha Turma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ESTADO 5 — Caso B: Já está vinculado a OUTRA turma
  if (user.turma) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center ring-8 ring-amber-50/50 dark:ring-amber-950/20">
            <Users className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Você já possui uma turma
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Sua conta já está vinculada à turma{' '}
              <strong className="font-bold text-slate-900 dark:text-white">
                {user.turma.nomeOficial}
              </strong>
              . Para trocar de sala, é necessário sair da sua turma atual primeiro em{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">Minha Turma</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/dashboard', { replace: true })}
            className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Ir para o Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ESTADO 5 — Caso C (Erro na mutação de ingresso)
  if (joinError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center ring-8 ring-red-50/50 dark:ring-red-950/20">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Não foi possível ingressar
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {joinError}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/dashboard', { replace: true })}
            className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Ir para o Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ESTADO 5 — Caso C (Vinculação em andamento com Skeleton elegante)
  return <InviteCardSkeleton showLinkingHint />;
}
