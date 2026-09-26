import { useState } from 'react'
import { PixModal } from './PixModal'

export function CrowdfundingBanner() {
  const [isPixOpen, setIsPixOpen] = useState(false);

  return (
    <>
      <div className="glass-panel p-8 rounded-3xl mb-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Meta do Mês
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Apoie o Projeto Prumo! 🚀</h2>
            <p className="text-slate-500 dark:text-slate-300 text-sm max-w-md">O servidor custa R$ 50/mês. Ajude a manter nossa plataforma rápida, segura e sem anúncios.</p>
            
            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-primary to-orange-500 w-[60%] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">60%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">R$ 30,00 arrecadados de R$ 50,00</p>
          </div>
          
          <button 
            onClick={() => setIsPixOpen(true)}
            className="whitespace-nowrap px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 font-medium transition-all hover:scale-105 active:scale-95"
          >
            Fazer PIX Voluntário
          </button>
        </div>
      </div>

      <PixModal isOpen={isPixOpen} onClose={() => setIsPixOpen(false)} />
    </>
  )
}
