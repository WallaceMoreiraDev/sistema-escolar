import { useState } from 'react';
import { CircleDollarSign, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useFunding, useUpdateFunding } from '../hooks/useFunding';
import { ApiError } from '@/utils/apiError';
import { getErrorMessage } from '@/utils/errorMessages';

export function FundingSection() {
  const { data: funding, isLoading } = useFunding();
  const updateMutation = useUpdateFunding();

  // Mantém controle da digitação do usuário sem necessitar de useEffect para sincronizar
  const [rawInput, setRawInput] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const displayValue =
    rawInput !== null
      ? rawInput
      : funding?.metaArrecadadaMes !== undefined
      ? funding.metaArrecadadaMes.toString()
      : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(false);

    const val = parseFloat(displayValue);
    if (isNaN(val)) {
      setErrorMsg('Informe um valor numérico válido.');
      return;
    }

    if (val < 0) {
      setErrorMsg('O valor arrecadado não pode ser negativo.');
      return;
    }

    if (val > 100000) {
      setErrorMsg('O valor arrecadado excede o limite permitido (R$ 100.000,00).');
      return;
    }

    updateMutation.mutate(
      { metaArrecadadaMes: val },
      {
        onSuccess: () => {
          setRawInput(null);
          setSuccessMsg(true);
          setTimeout(() => setSuccessMsg(false), 4000);
        },
        onError: (err: unknown) => {
          if (err instanceof ApiError) {
            setErrorMsg(getErrorMessage(err.code, err.message));
          } else {
            setErrorMsg('Ocorreu um erro ao atualizar a meta de financiamento.');
          }
        },
      }
    );
  };

  return (
    <section className="glass-card p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Financiamento</h2>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-6 -mt-2">
        Atualização em tempo real da meta do servidor da plataforma.
      </p>

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
              max="100000"
              required
              disabled={isLoading || updateMutation.isPending}
              value={displayValue}
              onChange={(e) => {
                setErrorMsg(null);
                setRawInput(e.target.value);
              }}
              placeholder="0.00"
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || updateMutation.isPending}
          className="w-full md:w-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Valor'
          )}
        </button>
      </form>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 font-medium text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 font-medium text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>Valor atualizado com sucesso! O dashboard dos alunos já reflete o novo valor.</span>
        </div>
      )}
    </section>
  );
}
