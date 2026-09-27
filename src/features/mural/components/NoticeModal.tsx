import { useNavigate, useParams } from 'react-router-dom'

const mockNotices = [
  {
    id: "1",
    sender: "Diretoria ETEC",
    badge: "Urgente",
    title: "Cancelamento de Aulas - Semana Paulo Freire",
    message: "Aviso oficial: Devido aos eventos da Semana Paulo Freire, informamos que não haverá aulas regulares na próxima quarta-feira. A presença de todos os alunos será computada unicamente através da participação nos workshops e palestras previamente agendados.",
    date: "Hoje, 08:30"
  },
  {
    id: "2",
    sender: "Coordenação",
    badge: "Informativo",
    title: "Sábado Letivo (Reposição)",
    message: "Lembramos a todos que neste sábado teremos um sábado letivo para todas as turmas do período da manhã, visando a reposição do calendário. O horário de funcionamento será das 08:00 às 12:00. O refeitório não servirá almoço, apenas o lanche das 10h.",
    date: "Ontem, 14:00"
  },
  {
    id: "3",
    sender: "Administração da Plataforma",
    badge: "Evento",
    title: "Campanha do Agasalho ETEC",
    message: "As caixas de arrecadação para a nossa Campanha do Agasalho já estão disponíveis na entrada principal. Participe e ajude quem precisa neste inverno! Aceitamos cobertores e roupas em bom estado.",
    date: "12 Set, 09:15"
  }
];

export function NoticeModal() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const notice = mockNotices.find(n => n.id === id);

  const onClose = () => {
    navigate('/app/mural');
  };

  const getBorderColor = (badge: string) => {
    switch (badge) {
      case 'Urgente': return 'bg-red-500';
      case 'Evento': return 'bg-emerald-500';
      default: return 'bg-blue-500';
    }
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Urgente': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      case 'Evento': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/30"
        onClick={e => e.stopPropagation()} 
      >
        {notice ? (
          <>
            <div className="relative p-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
              <div className={`absolute top-0 left-0 w-full h-1 ${getBorderColor(notice.badge)}`}></div>
              
              <div className="flex justify-between items-start mb-4 pt-2">
                <div className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm ${getBadgeStyle(notice.badge)}`}>
                  {notice.badge}
                </div>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all bg-white/60 dark:bg-slate-800/60 rounded-full hover:bg-white dark:hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-sm cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4">{notice.title}</h2>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shadow-inner">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{notice.sender}</span>
                  <span className="text-xs font-medium text-slate-500">{notice.date}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white dark:bg-slate-900">
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {notice.message.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                ))}
              </div>
            </div>
          </>
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
