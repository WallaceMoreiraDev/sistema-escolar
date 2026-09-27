import { useNavigate, Link } from 'react-router-dom'

// Mock baseado exatamente no muralgeral_detalhes.md
const mockNotices = [
  {
    id: "1",
    sender: "Diretoria ETEC" as const,
    badge: "Urgente" as const,
    title: "Cancelamento de Aulas - Semana Paulo Freire",
    message: "Aviso oficial: Devido aos eventos da Semana Paulo Freire, informamos que não haverá aulas regulares na próxima quarta-feira. A presença de todos os alunos será computada unicamente através da participação nos workshops e palestras previamente agendados.",
    date: "Hoje, 08:30"
  },
  {
    id: "2",
    sender: "Coordenação" as const,
    badge: "Informativo" as const,
    title: "Sábado Letivo (Reposição)",
    message: "Lembramos a todos que neste sábado teremos um sábado letivo para todas as turmas do período da manhã, visando a reposição do calendário. O horário de funcionamento será das 08:00 às 12:00. O refeitório não servirá almoço, apenas o lanche das 10h.",
    date: "Ontem, 14:00"
  },
  {
    id: "3",
    sender: "Administração da Plataforma" as const,
    badge: "Evento" as const,
    title: "Campanha do Agasalho ETEC",
    message: "As caixas de arrecadação para a nossa Campanha do Agasalho já estão disponíveis na entrada principal. Participe e ajude quem precisa neste inverno! Aceitamos cobertores e roupas em bom estado.",
    date: "12 Set, 09:15"
  }
];

export function MuralPreview() {
  const navigate = useNavigate();

  const getBorderColor = (badge: string) => {
    switch (badge) {
      case 'Urgente': return 'bg-red-500';
      case 'Evento': return 'bg-emerald-500';
      default: return 'bg-blue-500';
    }
  }

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Urgente': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      case 'Evento': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Avisos Recentes da Escola</h3>
        <Link to="/app/mural" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver todos os avisos &rarr;</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockNotices.map((notice) => (
          <div 
            key={notice.id}
            onClick={() => navigate(`/app/mural/aviso/${notice.id}`)}
            className="glass-card p-5 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${getBorderColor(notice.badge)}`}></div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(notice.badge)}`}>
                {notice.badge}
              </span>
              <span className="text-xs text-slate-400">{notice.date}</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-2 group-hover:text-primary transition-colors">{notice.title}</h4>
            <p className="text-sm text-slate-500 line-clamp-2">{notice.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
