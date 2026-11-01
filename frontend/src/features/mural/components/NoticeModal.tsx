import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { X, AlertTriangle, ExternalLink, Calendar } from 'lucide-react';
import { getNoticeTypeConfig, getSenderIcon } from '../utils/noticeUtils';
import { useNotice } from '../hooks/useNotices';

export function NoticeModal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: notice, isLoading, isError } = useNotice(id);

  const onClose = () => {
    navigate('/app/mural');
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="glass-panel w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 bg-white dark:bg-slate-900 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()} 
      >
        {isLoading ? (
          <div className="p-8 bg-white dark:bg-slate-900 space-y-6 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
            </div>
          </div>
        ) : notice && !isError ? (
          (() => {
            const typeConfig = getNoticeTypeConfig(notice.badgeDestaque);
            const icon = getSenderIcon(notice.remetente);
            return (
              <>
                {/* Cabeçalho do Comunicado */}
                <div className={`relative p-6 border-b border-slate-200/50 dark:border-slate-800/50 ${typeConfig.modalHeaderBgClass} shrink-0`}>
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${typeConfig.borderClass}`} />
                  
                  <div className="flex justify-between items-start mb-4 pt-2">
                    <div className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm ${typeConfig.badgeClass}`}>
                      {notice.badgeDestaque}
                    </div>
                    <button 
                      type="button"
                      onClick={onClose} 
                      className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all bg-white/60 dark:bg-slate-800/60 rounded-full hover:bg-white dark:hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                      aria-label="Fechar aviso"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                    {notice.titulo}
                  </h2>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 shadow-inner">
                      {icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {notice.remetente}
                      </span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(notice.dataPostagem).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conteúdo com Scroll */}
                <div className="p-6 bg-white dark:bg-slate-900 overflow-y-auto flex-1 space-y-6">
                  {/* Imagem de Destaque / Cartaz Oficial */}
                  {notice.imagemUrl && (
                    <div className="relative group rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-950/40 p-2 sm:p-3 flex flex-col items-center justify-center">
                      <img
                        src={notice.imagemUrl}
                        alt={notice.titulo}
                        className="w-auto h-auto max-h-[60vh] max-w-full object-contain rounded-xl"
                      />
                      <div className="w-full flex justify-end pt-2">
                        <a
                          href={notice.imagemUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs hover:text-primary transition-all active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver imagem completa</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Texto do Comunicado */}
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                    {notice.mensagem}
                  </div>

                  {/* Links Úteis e Documentos Institucionais */}
                  {notice.links && notice.links.length > 0 && (
                    <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-primary" />
                        Links Úteis e Documentos
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {notice.links.map((link, idx) => {
                          let domain = link.url;
                          try {
                            domain = new URL(link.url).hostname.replace('www.', '');
                          } catch {
                            // fallback
                          }
                          return (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-primary/50 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all group"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors truncate block">
                                  {link.titulo}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                                  {domain}
                                </span>
                              </div>
                              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()
        ) : (
          /* TRATAMENTO DE ERRO: 404 Empty State */
          <div className="p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 h-[400px]">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-sm border border-rose-100 dark:border-rose-900">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Aviso Não Encontrado</h2>
            <p className="text-sm text-slate-500 max-w-sm mb-10 leading-relaxed font-medium">
              Este aviso foi apagado pela coordenação ou não está mais disponível.
            </p>
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg text-sm"
            >
              Voltar ao Mural
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
