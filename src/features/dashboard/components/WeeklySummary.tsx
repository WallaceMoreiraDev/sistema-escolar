import { Link } from 'react-router-dom'

export function WeeklySummary() {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Resumo da Semana</h3>
        <Link to="/app/calendario" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Ver calendário completo &rarr;</Link>
      </div>
      
      <div className="grid gap-4">
        <div className="glass-card p-6 flex gap-5 group cursor-pointer animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 flex flex-col items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm group-hover:bg-rose-500 group-hover:text-white transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider">Amanhã</span>
            <span className="text-xl font-black">10h</span>
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold tracking-wider mb-2">PROVA</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Matemática - Geometria Analítica</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sala 12 • Prof. Carlos</p>
          </div>
        </div>
        
        <div className="glass-card p-6 flex gap-5 group cursor-pointer animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider">Sex</span>
            <span className="text-xl font-black">23h</span>
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold tracking-wider mb-2">TRABALHO</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">História - Era Vargas</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Entrega via Microsoft Teams</p>
          </div>
        </div>
      </div>
    </div>
  )
}
