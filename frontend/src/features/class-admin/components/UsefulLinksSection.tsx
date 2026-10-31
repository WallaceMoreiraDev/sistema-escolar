import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link2, Plus, Trash2, ExternalLink, ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createLinkSchema, type CreateLinkInput } from '@shared/schemas/linkSchema';
import { useUsefulLinks, useCreateLink, useDeleteLink } from '../hooks/useUsefulLinks';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { UsefulLink } from '../types';
import { getErrorMessage } from '@/utils/errorMessages';
import { ApiError } from '@/utils/apiError';
import { sanitizeSafeUrl } from '@/utils/urlSecurity';

interface UsefulLinksSectionProps {
  turmaId?: string;
}

export function UsefulLinksSection({ turmaId }: UsefulLinksSectionProps = {}) {
  const { data: links, isLoading, isError, error } = useUsefulLinks(turmaId);
  const createLinkMutation = useCreateLink();
  const deleteLinkMutation = useDeleteLink();

  const [linkToDelete, setLinkToDelete] = useState<UsefulLink | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLinkInput>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      titulo: '',
      urlLink: '',
    },
  });

  const onSubmit = (data: CreateLinkInput) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    createLinkMutation.mutate(
      { payload: data, turmaId },
      {
        onSuccess: () => {
          reset();
          setSuccessMessage('Link adicionado com sucesso!');
          setTimeout(() => setSuccessMessage(null), 4000);
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setErrorMessage(
              err.code === 'CONTENT_POLICY_VIOLATION' && err.message
                ? err.message
                : getErrorMessage(err.code, err.message)
            );
          } else {
            setErrorMessage('Ocorreu um erro ao adicionar o link.');
          }
        },
      }
    );
  };

  const confirmDelete = () => {
    if (linkToDelete) {
      deleteLinkMutation.mutate(linkToDelete.id, {
        onSuccess: () => {
          setLinkToDelete(null);
          setSuccessMessage('Link excluído com sucesso!');
          setTimeout(() => setSuccessMessage(null), 4000);
        },
        onError: (err) => {
          setLinkToDelete(null);
          if (err instanceof ApiError) {
            setErrorMessage(getErrorMessage(err.code, err.message));
          } else {
            setErrorMessage('Ocorreu um erro ao excluir o link.');
          }
        },
      });
    }
  };

  const [page, setPage] = useState(1);
  const limit = 5;
  const safeLinks = links || [];
  const totalPages = Math.ceil(safeLinks.length / limit) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedLinks = safeLinks.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <section className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Link2 className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Links Úteis</h2>
      </div>

      {successMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm flex items-start gap-2.5 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <span className="font-medium leading-relaxed">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Criação (Coluna Menor) */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Novo Link</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Título do Link *
              </label>
              <input
                type="text"
                {...register('titulo')}
                placeholder="Ex: Pasta do Drive"
                className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${
                  errors.titulo ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                } rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
              />
              {errors.titulo && (
                <span className="text-xs font-bold text-red-500">{errors.titulo.message}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                URL Completa *
              </label>
              <input
                type="url"
                {...register('urlLink')}
                placeholder="https://..."
                className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${
                  errors.urlLink ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                } rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
              />
              {errors.urlLink && (
                <span className="text-xs font-bold text-red-500">{errors.urlLink.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={createLinkMutation.isPending}
              className="w-full mt-2 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md"
            >
              {createLinkMutation.isPending ? (
                'Adicionando...'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Adicionar Link
                </>
              )}
            </button>
          </form>
        </div>

        {/* Listagem de Links (Coluna Maior) */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            {isError ? (
              <div className="p-8 text-center text-red-500 font-bold flex flex-col items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                <span>
                  {error instanceof ApiError
                    ? getErrorMessage(error.code, error.message)
                    : 'Erro ao carregar os links da turma.'}
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Título</th>
                      <th className="px-6 py-4">URL</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={`sk-link-${i}`} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end">
                              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : safeLinks.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                          Nenhum link adicionado ainda.
                        </td>
                      </tr>
                    ) : (
                      paginatedLinks.map((link) => (
                        <tr
                          key={link.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            {link.titulo}
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={sanitizeSafeUrl(link.urlLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline max-w-[200px] xl:max-w-[300px] truncate flex items-center gap-1.5"
                            >
                              <span className="truncate">{link.urlLink}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            </a>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setLinkToDelete(link)}
                              disabled={
                                deleteLinkMutation.isPending && linkToDelete?.id === link.id
                              }
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 inline-flex items-center justify-center"
                              title="Remover Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && !isLoading && !isError && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <span className="text-sm font-bold text-slate-500">
                  Página <span className="text-slate-900 dark:text-white">{currentPage}</span> de{' '}
                  {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!linkToDelete}
        title="Excluir Link Útil"
        message={`Tem certeza que deseja excluir o link "${linkToDelete?.titulo}" do painel de todos os alunos?`}
        isDestructive={true}
        confirmText="Excluir Link"
        onConfirm={confirmDelete}
        onCancel={() => setLinkToDelete(null)}
      />
    </section>
  );
}
