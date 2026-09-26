import { Link } from 'react-router-dom'

export function MuralPreview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Avisos Recentes da Escola</h3>
        <Link to="/app/mural" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver todos os avisos &rarr;</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">URGENTE</span>
            <span className="text-xs text-slate-400">Hoje, 08:30</span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-2">Cancelamento de Aulas - Paulo Freire</h4>
          <p className="text-sm text-slate-500 line-clamp-2">Devido aos eventos da Semana Paulo Freire, não haverá aulas regulares na próxima quarta-feira. A presença será computada.</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group hover:border-slate-400/50 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-400">Ontem, 14:00</span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-2">Sábado Letivo (Reposição)</h4>
          <p className="text-sm text-slate-500 line-clamp-2">Teremos sábado letivo para todas as turmas do período da manhã. Horário de funcionamento: 08:00 às 12:00.</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group hover:border-emerald-400/50 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
          <div className="flex items-center gap-2 mb-3">
             <span className="text-xs text-slate-400">12 Set, 09:15</span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-2">Campanha do Agasalho</h4>
          <p className="text-sm text-slate-500 line-clamp-2">As caixas de arrecadação já estão disponíveis na entrada principal. Participe e ajude quem precisa neste inverno!</p>
        </div>
      </div>
    </div>
  )
}
