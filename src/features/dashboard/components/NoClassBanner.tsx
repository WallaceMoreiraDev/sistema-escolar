import { Link } from 'react-router-dom'

export function NoClassBanner() {
  return (
    <div className="glass-panel p-10 rounded-3xl flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Você ainda não faz parte de nenhuma turma.</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        Vincule-se a uma sala usando o código de convite fornecido pelo seu líder, ou solicite a criação de uma nova sala caso você seja o representante.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link to="/onboarding" className="px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 font-bold transition-all hover:-translate-y-1 active:scale-95 text-center">
          Entrar em uma Turma
        </Link>
        <button className="px-6 py-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold shadow-sm transition-all hover:-translate-y-1 active:scale-95">
          Criar Nova Turma
        </button>
      </div>
    </div>
  )
}
