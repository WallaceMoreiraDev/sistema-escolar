import { useState } from 'react';
import { PixModal } from './PixModal';
import { useFunding } from '../../system-admin/hooks/useFunding';

export function CrowdfundingBanner() {
  const [isPixOpen, setIsPixOpen] = useState(false);
  const { data: funding, isLoading } = useFunding();
  const goal = 40.00;

  if (isLoading) {
    return (
      <div className="glass-panel p-8 rounded-3xl mb-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden animate-pulse">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1 space-y-3 w-full">
            <div className="w-28 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div className="w-56 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="w-80 max-w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full mt-4"></div>
            <div className="w-48 h-3 bg-slate-200 dark:bg-slate-800 rounded mt-2"></div>
          </div>
          <div className="w-full md:w-48 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
        </div>
      </div>
    );
  }

  const currentFunding = funding?.metaArrecadadaMes ?? 0;
  const percentage = Math.min(100, Math.round((currentFunding / goal) * 100));
  const formattedFunding = currentFunding.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Apoie o Projeto Prumo!</h2>
            <p className="text-slate-500 dark:text-slate-300 text-sm max-w-md">
              Meta para registro e renovação do nosso domínio oficial (.com.br). Ajude a manter nossa plataforma independente, rápida e sem anúncios.
            </p>
            
            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{percentage}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              R$ {formattedFunding} arrecadados de R$ 40,00
            </p>
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
  );
}
