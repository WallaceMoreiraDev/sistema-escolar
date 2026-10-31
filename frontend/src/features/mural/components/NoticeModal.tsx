import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { X, AlertTriangle } from 'lucide-react';
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
        className="glass-panel w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20"
        onClick={e => e.stopPropagation()} 
      >
        {isLoading ? (
          <div className="p-8 bg-white space-y-6 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
              <div className="w-8 h-8 rounded-full bg-slate-200" />
            </div>
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-5/6" />
              <div className="h-4 bg-slate-200 rounded w-4/6" />
            </div>
          </div>
        ) : notice && !isError ? (
          (() => {
            const typeConfig = getNoticeTypeConfig(notice.badgeDestaque);
            const icon = getSenderIcon(notice.remetente);
            return (
              <>
                <div className={`relative p-6 border-b border-slate-200/50 ${typeConfig.modalHeaderBgClass}`}>
                  <div className={`absolute top-0 left-0 w-full h-1 ${typeConfig.borderClass}`} />
                  
                  <div className="flex justify-between items-start mb-4 pt-2">
                    <div className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm ${typeConfig.badgeClass}`}>
                      {notice.badgeDestaque}
                    </div>
                    <button 
                      type="button"
                      onClick={onClose} 
                      className="p-2 text-slate-500 hover:text-slate-900 transition-all bg-white/60 rounded-full hover:bg-white hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                      aria-label="Fechar aviso"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-900 leading-tight mb-4">
                    {notice.titulo}
                  </h2>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 shadow-inner">
                      {icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">
                        {notice.remetente}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(notice.dataPostagem).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-white max-h-[50vh] overflow-y-auto">
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {notice.mensagem}
                  </div>
                </div>
              </>
            );
          })()
        ) : (
          /* TRATAMENTO DE ERRO: 404 Empty State */
          <div className="p-12 flex flex-col items-center justify-center text-center bg-white h-[400px]">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-sm border border-rose-100">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">Aviso Não Encontrado</h2>
            <p className="text-sm text-slate-500 max-w-sm mb-10 leading-relaxed font-medium">
              Este aviso foi apagado pela coordenação ou não está mais disponível.
            </p>
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg"
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
