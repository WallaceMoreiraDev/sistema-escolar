import { Outlet, useNavigate } from 'react-router-dom';
import { useNotices } from './hooks/useNotices';
import { getNoticeTypeConfig, getSenderIcon } from './utils/noticeUtils';
import { Notice } from './types';

export function MuralPage() {
  const navigate = useNavigate();
  const { data: notices, isLoading, isError } = useNotices();

  return (
    <>
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mural Geral</h1>
          <p className="text-muted-foreground">Avisos da diretoria e comunicados institucionais.</p>
        </header>

        <div className="max-w-3xl mx-auto space-y-6">
          {isLoading ? (
            <div className="glass p-8 rounded-2xl text-center text-slate-500 font-bold animate-pulse">
              Carregando avisos do mural...
            </div>
          ) : isError ? (
            <div className="glass p-8 rounded-2xl text-center text-red-500 font-bold">
              Erro ao carregar avisos.
            </div>
          ) : notices?.length === 0 ? (
            <div className="glass p-8 rounded-2xl text-center text-slate-500 font-bold">
              Nenhum aviso no mural no momento.
            </div>
          ) : (
            notices?.map((notice: Notice) => {
              const typeConfig = getNoticeTypeConfig(notice.badge);
              const icon = getSenderIcon(notice.sender);
              return (
                <div 
                  key={notice.id}
                  onClick={() => navigate(`aviso/${notice.id}`)}
                  className="glass p-6 rounded-2xl relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all group"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${typeConfig.borderClass}`}></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{notice.sender}</h3>
                        <p className="text-xs text-slate-500">{new Date(notice.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${typeConfig.badgeClass}`}>
                      {notice.badge}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{notice.title}</h2>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                    {notice.message}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>
      
      <Outlet />
    </>
  )
}
