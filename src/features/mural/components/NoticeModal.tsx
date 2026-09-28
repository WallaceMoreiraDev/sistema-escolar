import { useNavigate, useParams } from 'react-router-dom'
import { getNoticeTypeConfig, getSenderIcon } from '../utils/noticeUtils'
import { MOCK_NOTICES } from '../data/mockNotices'

export function NoticeModal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const notice = MOCK_NOTICES.find((n: any) => n.id === id);

  const onClose = () => {
    navigate('/app/mural');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/30"
        onClick={e => e.stopPropagation()} 
      >
        {notice ? (
          (() => {
            const typeConfig = getNoticeTypeConfig(notice.badge);
            const icon = getSenderIcon(notice.sender);
            return (
              <>
                <div className={`relative p-6 border-b border-slate-200/50 dark:border-slate-800/50 ${typeConfig.modalHeaderBgClass}`}>
                  <div className={`absolute top-0 left-0 w-full h-1 ${typeConfig.borderClass}`}></div>
                  
                  <div className="flex justify-between items-start mb-4 pt-2">
                    <div className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm ${typeConfig.badgeClass}`}>
                      {notice.badge}
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all bg-white/60 dark:bg-slate-800/60 rounded-full hover:bg-white dark:hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-sm cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4">{notice.title}</h2>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shadow-inner">
                      {icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{notice.sender}</span>
                      <span className="text-xs font-medium text-slate-500">{notice.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-white dark:bg-slate-900">
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {notice.message.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </>
            );
          })()
        ) : (
          /* TRATAMENTO DE ERRO: 404 Empty State */
          <div className="p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 h-[400px]">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-sm border border-rose-100 dark:border-rose-900/50">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Aviso Não Encontrado</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-10 leading-relaxed font-medium">
              Este aviso foi apagado pela coordenação ou não está mais disponível.
            </p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Voltar ao Mural
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
