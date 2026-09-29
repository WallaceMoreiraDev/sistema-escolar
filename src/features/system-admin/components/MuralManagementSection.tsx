import { useState, useEffect } from 'react';
import { useNotices, useDeleteNotice } from '../../mural/hooks/useNotices';
import { Notice } from '../../mural/types';
import { getNoticeTypeConfig } from '../../mural/utils/noticeUtils';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { NoticeFormModal } from './NoticeFormModal';

export function MuralManagementSection() {
  const { data: notices, isLoading, isError } = useNotices();
  const deleteMutation = useDeleteNotice();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);

  // Pagination logic
  const [page, setPage] = useState(1);
  const limit = 5;
  const safeNotices = notices || [];
  const totalPages = Math.ceil(safeNotices.length / limit);
  const paginatedNotices = safeNotices.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingNotice(null);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (noticeToDelete) {
      deleteMutation.mutate(noticeToDelete.id, {
        onSuccess: () => setNoticeToDelete(null)
      });
    }
  };

  return (
    <section className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão do Mural Geral</h2>
            <p className="text-sm text-slate-500">Gerencie avisos globais que aparecem para todos os alunos da plataforma.</p>
          </div>
        </div>
        <button 
          onClick={handleCreate}
          className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nova Postagem
        </button>
      </div>

      <div className="w-full">
          <div className="glass-card overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center animate-pulse text-slate-500 font-bold">Carregando mural...</div>
            ) : isError ? (
              <div className="p-8 text-center text-red-500 font-bold">Erro ao carregar avisos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Aviso</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {safeNotices.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                          Nenhum aviso publicado.
                        </td>
                      </tr>
                    ) : (
                      paginatedNotices.map((notice) => {
                        const typeConfig = getNoticeTypeConfig(notice.badge);
                        return (
                          <tr key={notice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{notice.title}</span>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>{notice.sender}</span>
                                  <span>•</span>
                                  <span>{new Date(notice.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${typeConfig.badgeClass}`}>
                                {notice.badge}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleEdit(notice)}
                                  className="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700"
                                  title="Editar Aviso"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button 
                                  onClick={() => setNoticeToDelete(notice)}
                                  disabled={deleteMutation.isPending && noticeToDelete?.id === notice.id}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 inline-flex items-center justify-center"
                                  title="Remover Aviso"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
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

      <NoticeFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        noticeToEdit={editingNotice}
      />

      <ConfirmModal
        isOpen={!!noticeToDelete}
        title="Excluir Aviso do Mural"
        message={`Tem certeza que deseja excluir o aviso "${noticeToDelete?.title}"? Ele desaparecerá do mural de todos os alunos instantaneamente.`}
        isDestructive={true}
        confirmText="Excluir Aviso"
        onConfirm={confirmDelete}
        onCancel={() => setNoticeToDelete(null)}
      />
    </section>
  );
}
