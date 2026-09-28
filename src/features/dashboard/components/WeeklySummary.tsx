import { Link, useNavigate } from 'react-router-dom'

interface DashboardEvent {
  id: number;
  subject: string;
  category: string;
  date: string;
  time: string;
  dayStr: string;
  monthStr: string;
  description: string;
  imageUrl?: string;
}

export function WeeklySummary() {
  const navigate = useNavigate();

  const weekEvents: DashboardEvent[] = [
    {
      id: 1, // ID mapeado com o EventModal mock
      subject: "Matemática",
      category: "Prova",
      date: "Amanhã",
      time: "10:00",
      dayStr: "26",
      monthStr: "SET",
      description: "Prova bimestral abrangendo o conteúdo de Geometria Analítica e Equações de 2º Grau.\n\nCapítulos para estudar: 4, 5 e 6 do livro texto.\nTrazer calculadora simples e régua.",
      imageUrl: "https://images.unsplash.com/photo-1632559646142-f94793b89cb0?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2, // ID mapeado
      subject: "História",
      category: "Trabalho",
      date: "Sexta-feira",
      time: "23:59",
      dayStr: "28",
      monthStr: "SET",
      description: "Entrega do trabalho em grupo sobre a Era Vargas. O trabalho deve ter no mínimo 5 páginas e seguir as normas da ABNT. A entrega será feita de forma digital pelo Microsoft Teams."
    }
  ];

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Próximos 5 Dias Letivos</h3>
        <Link to="/app/minha-turma" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver turma completa &rarr;</Link>
      </div>
      
      <div className="grid gap-4">
        {/* Renderiza Prova de Matemática */}
        <div 
          onClick={() => navigate(`/app/minha-turma/evento/${weekEvents[0].id}`)}
          className="glass-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5 group cursor-pointer"
        >
          {/* Quadrado do Calendário (Mês/Dia) */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 flex flex-col items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm group-hover:bg-rose-500 group-hover:text-white transition-colors">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{weekEvents[0].monthStr}</span>
            <span className="text-xl sm:text-2xl font-black leading-none mt-0.5">{weekEvents[0].dayStr}</span>
          </div>
          
          {/* Informações do Evento */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold tracking-wider uppercase">
                Prova
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {weekEvents[0].date} • {weekEvents[0].time}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
              {weekEvents[0].subject}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {weekEvents[0].description}
            </p>
          </div>
        </div>
        
        {/* Renderiza Trabalho de História */}
        <div 
          onClick={() => navigate(`/app/minha-turma/evento/${weekEvents[1].id}`)}
          className="glass-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5 group cursor-pointer"
        >
          {/* Quadrado do Calendário (Mês/Dia) */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 flex flex-col items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{weekEvents[1].monthStr}</span>
            <span className="text-xl sm:text-2xl font-black leading-none mt-0.5">{weekEvents[1].dayStr}</span>
          </div>
          
          {/* Informações do Evento */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                Trabalho
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {weekEvents[1].date} • {weekEvents[1].time}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
              {weekEvents[1].subject}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {weekEvents[1].description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
