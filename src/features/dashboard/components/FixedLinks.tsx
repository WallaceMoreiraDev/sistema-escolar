export function FixedLinks() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Links Úteis</h3>
      <div className="glass-panel p-2 rounded-2xl flex flex-col">
        <a href="#" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <span className="block font-bold text-slate-900 dark:text-white">Google Meet</span>
            <span className="text-xs text-slate-500 font-medium">Link fixo da sala</span>
          </div>
        </a>
        <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
        <a href="#" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          </div>
          <div>
            <span className="block font-bold text-slate-900 dark:text-white">Drive da Turma</span>
            <span className="text-xs text-slate-500 font-medium">Acesso aos PDFs</span>
          </div>
        </a>
        <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
        <a href="#" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <span className="block font-bold text-slate-900 dark:text-white">Portal NSA</span>
            <span className="text-xs text-slate-500 font-medium">Notas e faltas</span>
          </div>
        </a>
      </div>
    </div>
  )
}
