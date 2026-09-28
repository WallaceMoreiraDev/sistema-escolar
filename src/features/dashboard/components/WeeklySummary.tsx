import { Link, useNavigate } from 'react-router-dom'

import { useClassEvents } from '../../class-admin/hooks/useClassEvents'

export function WeeklySummary() {
  const navigate = useNavigate();
  const { data: response, isLoading } = useClassEvents(1, 5); // Pega os 5 eventos mais próximos

  const getEventStyles = (category: string) => {
    if (category === 'Prova') return { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-100 dark:border-rose-900', text: 'text-rose-600 dark:text-rose-400', hoverBg: 'group-hover:bg-rose-500', badgeBg: 'bg-rose-100 dark:bg-rose-900/40', badgeText: 'text-rose-700 dark:text-rose-300' };
    if (category === 'Trabalho') return { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-100 dark:border-blue-900', text: 'text-blue-600 dark:text-blue-400', hoverBg: 'group-hover:bg-blue-500', badgeBg: 'bg-blue-100 dark:bg-blue-900/40', badgeText: 'text-blue-700 dark:text-blue-300' };
    return { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-100 dark:border-amber-900', text: 'text-amber-600 dark:text-amber-400', hoverBg: 'group-hover:bg-amber-500', badgeBg: 'bg-amber-100 dark:bg-amber-900/40', badgeText: 'text-amber-700 dark:text-amber-300' };
  };

  const events = response?.data || [];

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Próximos 5 Dias Letivos</h3>
        <Link to="/app/minha-turma" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver turma completa &rarr;</Link>
      </div>
      
      <div className="grid gap-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse font-bold">Carregando eventos...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-slate-500 glass-card rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 font-medium">
            Nenhum evento letivo para os próximos dias.
          </div>
        ) : (
          events.map(event => {
            const styles = getEventStyles(event.category);
            const dateObj = new Date(event.dueDate);
            const dayStr = dateObj.getDate().toString().padStart(2, '0');
            const monthStr = dateObj.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
            const time = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={event.id}
                onClick={() => navigate(`/app/minha-turma/evento/${event.id}`)}
                className="glass-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5 group cursor-pointer"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center shrink-0 shadow-sm transition-colors ${styles.bg} ${styles.border} ${styles.text} ${styles.hoverBg} group-hover:text-white`}>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{monthStr}</span>
                  <span className="text-xl sm:text-2xl font-black leading-none mt-0.5">{dayStr}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${styles.badgeBg} ${styles.badgeText}`}>
                      {event.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {time}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                    {event.subject}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {event.description || <span className="italic">Sem descrição</span>}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
