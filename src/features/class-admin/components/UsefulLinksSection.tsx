import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { linkSchema, LinkFormValues } from '../schemas/linkSchema';
import { useUsefulLinks, useCreateLink, useDeleteLink } from '../hooks/useUsefulLinks';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { UsefulLink } from '../types';

export function UsefulLinksSection() {
  const { data: links, isLoading, isError } = useUsefulLinks();
  const createLinkMutation = useCreateLink();
  const deleteLinkMutation = useDeleteLink();

  const [linkToDelete, setLinkToDelete] = useState<UsefulLink | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
  });

  const onSubmit = (data: LinkFormValues) => {
    createLinkMutation.mutate(data, {
      onSuccess: () => {
        reset();
      }
    });
  };

  const confirmDelete = () => {
    if (linkToDelete) {
      deleteLinkMutation.mutate(linkToDelete.id, {
        onSuccess: () => setLinkToDelete(null)
      });
    }
  };

  const [page, setPage] = useState(1);
  const limit = 5;
  const safeLinks = links || [];
  const totalPages = Math.ceil(safeLinks.length / limit);
  const paginatedLinks = safeLinks.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <section className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Links Úteis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Criação (Coluna Menor) */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Novo Link</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Título do Link</label>
              <input 
                type="text" 
                {...register('title')}
                placeholder="Ex: Pasta do Drive"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {errors.title && <span className="text-xs font-bold text-red-500">{errors.title.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">URL Completa</label>
              <input 
                type="url" 
                {...register('url')}
                placeholder="https://..."
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {errors.url && <span className="text-xs font-bold text-red-500">{errors.url.message}</span>}
            </div>

            <button 
              type="submit"
              disabled={createLinkMutation.isPending}
              className="w-full mt-2 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {createLinkMutation.isPending ? 'Adicionando...' : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Adicionar Link
                </>
              )}
            </button>
          </form>
        </div>

        {/* Listagem de Links (Coluna Maior) */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center animate-pulse text-slate-500 font-bold">Carregando links...</div>
            ) : isError ? (
              <div className="p-8 text-center text-red-500 font-bold">Erro ao carregar os links.</div>
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
                    {safeLinks.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                          Nenhum link adicionado ainda.
                        </td>
                      </tr>
                    ) : (
                      paginatedLinks.map((link) => (
                        <tr key={link.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            {link.title}
                          </td>
                          <td className="px-6 py-4">
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-primary hover:underline max-w-[200px] xl:max-w-[300px] truncate block"
                            >
                              {link.url}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setLinkToDelete(link)}
                              disabled={deleteLinkMutation.isPending && linkToDelete?.id === link.id}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 inline-flex items-center justify-center"
                              title="Remover Link"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                  &larr; Anterior
                </button>
                
                <span className="text-sm font-bold text-slate-500">
                  Página <span className="text-slate-900 dark:text-white">{page}</span> de {totalPages}
                </span>
                
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                  Próxima &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={!!linkToDelete}
        title="Excluir Link Útil"
        message={`Tem certeza que deseja excluir o link "${linkToDelete?.title}" do painel de todos os alunos?`}
        isDestructive={true}
        confirmText="Excluir Link"
        onConfirm={confirmDelete}
        onCancel={() => setLinkToDelete(null)}
      />
    </section>
  );
}
