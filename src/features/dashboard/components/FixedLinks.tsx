import { useUsefulLinks } from '../../class-admin/hooks/useUsefulLinks';

export function FixedLinks() {
  const { data: links, isLoading, isError } = useUsefulLinks();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Links Úteis</h3>
      
      {isLoading ? (
        <div className="glass-panel p-6 rounded-2xl text-center animate-pulse text-slate-500 font-bold">
          Carregando links...
        </div>
      ) : isError ? (
        <div className="glass-panel p-6 rounded-2xl text-center text-red-500 font-bold">
          Erro ao carregar links.
        </div>
      ) : links && links.length > 0 ? (
        <div className="glass-panel p-2 rounded-2xl flex flex-col">
          {links.slice(0, 3).map((link, index, array) => (
            <div key={link.id}>
              <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900 dark:text-white line-clamp-1">{link.title}</span>
                  <span className="block text-xs text-slate-500 font-medium line-clamp-1">{link.url}</span>
                </div>
              </a>
              {index < array.length - 1 && <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nenhum link adicionado ainda.</p>
        </div>
      )}
    </div>
  )
}

