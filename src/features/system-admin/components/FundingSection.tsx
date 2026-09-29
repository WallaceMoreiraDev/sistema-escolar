import { useState, useEffect } from 'react';
import { useFunding, useUpdateFunding } from '../hooks/useFunding';

export function FundingSection() {
  const { data: currentFunding, isLoading } = useFunding();
  const updateMutation = useUpdateFunding();
  
  const [inputValue, setInputValue] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (currentFunding !== undefined) {
      setInputValue(currentFunding.toString());
    }
  }, [currentFunding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputValue);
    if (!isNaN(val)) {
      updateMutation.mutate(val, {
        onSuccess: () => {
          setSuccessMsg(true);
          setTimeout(() => setSuccessMsg(false), 3000);
        }
      });
    }
  };

  return (
    <section className="glass-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financiamento (Crowdfunding)</h2>
          <p className="text-sm text-slate-500">Atualização em tempo real da meta do servidor da plataforma.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Valor Arrecadado no Mês (R$)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
            <input 
              type="number" 
              step="0.01"
              min="0"
              required
              disabled={isLoading || updateMutation.isPending}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={isLoading || updateMutation.isPending}
          className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      {successMsg && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 font-medium text-sm flex items-center gap-2 animate-in fade-in">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Valor atualizado com sucesso! O dashboard dos alunos já reflete o novo valor.
        </div>
      )}
    </section>
  );
}
