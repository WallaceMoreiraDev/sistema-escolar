export function RouteLoadingSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Cabeçalho Placeholder */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200/80 dark:bg-slate-800/70 rounded-2xl w-48 sm:w-64" />
          <div className="h-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl w-32 sm:w-40" />
        </div>
        <div className="h-10 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl w-32 hidden sm:block" />
      </div>

      {/* Grid Principal dos Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="h-6 bg-slate-200/80 dark:bg-slate-800/70 rounded-xl w-1/3" />
          <div className="h-4 bg-slate-200/60 dark:bg-slate-800/50 rounded-lg w-2/3" />
          <div className="h-44 bg-slate-200/40 dark:bg-slate-800/40 rounded-2xl mt-4" />
        </div>
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="h-6 bg-slate-200/80 dark:bg-slate-800/70 rounded-xl w-1/2" />
          <div className="h-16 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl" />
          <div className="h-16 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl" />
        </div>
      </div>

      {/* Tabela / Bloco Inferior */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-3">
        <div className="h-5 bg-slate-200/80 dark:bg-slate-800/70 rounded-lg w-1/4 mb-4" />
        <div className="h-12 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl" />
        <div className="h-12 bg-slate-200/50 dark:bg-slate-800/40 rounded-2xl" />
      </div>
    </div>
  );
}

export function ModalRouteLoadingSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4" />
        <div className="h-24 bg-slate-200/60 dark:bg-slate-800/50 rounded-2xl" />
        <div className="h-12 bg-slate-200/40 dark:bg-slate-800/40 rounded-xl" />
      </div>
    </div>
  );
}
