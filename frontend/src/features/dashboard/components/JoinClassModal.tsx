import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { joinClassSchema, type JoinClassInput } from '@shared/schemas/classSchema';
import { JoinClassResponse } from '@shared/types';
import { useJoinClass } from '../../class-requests/hooks/useClassRequests';
import { ApiError } from '@/utils/apiError';
import { getErrorMessage } from '@/utils/errorMessages';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function JoinClassModal({ isOpen, onClose, onSuccess }: JoinClassModalProps) {
  const joinMutation = useJoinClass();
  const [joinedClass, setJoinedClass] = useState<JoinClassResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinClassInput>({
    resolver: zodResolver(joinClassSchema),
    defaultValues: {
      codigoConvite: '',
    },
  });

  const { reset: resetMutation } = joinMutation;

  // Limpa o formulário e erros da mutação ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      reset();
      resetMutation();
    }
  }, [isOpen, reset, resetMutation]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    resetMutation();
    setJoinedClass(null);
    onClose();
    onSuccess?.();
  };

  const onSubmit = (data: JoinClassInput) => {
    joinMutation.mutate(
      { codigoConvite: data.codigoConvite.trim().toUpperCase() },
      {
        onSuccess: (result) => {
          setJoinedClass(result);
        },
      }
    );
  };

  // Mapeamento amigável de erros da API
  const apiErrorMessage = joinMutation.error
    ? joinMutation.error instanceof ApiError
      ? joinMutation.error.code === 'NOT_FOUND'
        ? 'Código de turma inválido ou inexistente.'
        : getErrorMessage(joinMutation.error.code)
      : joinMutation.error.message || 'Erro ao ingressar na turma.'
    : null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          type="button"
          aria-label="Fechar modal"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {joinedClass ? (
          // Visão de Sucesso / Boas-vindas
          <div className="text-center py-2 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Bem-vindo à Turma!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Você ingressou com sucesso na turma:
              </p>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
              <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200 tracking-wide">
                {joinedClass.nomeOficial}
              </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sua Dashboard foi atualizada. Agora você tem acesso a todos os eventos, links e comunicados da sala.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 font-bold transition-all active:scale-95"
            >
              Acessar Minha Turma
            </button>
          </div>
        ) : (
          // Formulário de Ingresso
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary shadow-inner">
                <KeyRound className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Entrar na Turma
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Insira o código fornecido pelo líder da sua sala.
              </p>
            </div>

            {apiErrorMessage && (
              <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="codigoConvite"
                  className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Código de Convite
                </label>
                <input
                  type="text"
                  id="codigoConvite"
                  maxLength={6}
                  placeholder="Ex: X8K9J4"
                  disabled={joinMutation.isPending}
                  {...register('codigoConvite', {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.codigoConvite || apiErrorMessage
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary'
                  } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white uppercase font-bold text-center tracking-widest text-lg focus:ring-2 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                />
                {errors.codigoConvite && (
                  <p className="text-xs font-medium text-red-500 mt-1.5 text-center">
                    {errors.codigoConvite.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={joinMutation.isPending}
                className="w-full px-6 py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-primary/20 font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {joinMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Entrando na turma...</span>
                  </>
                ) : (
                  <span>Confirmar e Entrar</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
