import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCheck, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { onboardingSchema } from '@shared/schemas/onboardingSchema';
import { useUpdateProfile } from '@/features/auth/hooks/useProfile';

const onboardingFormSchema = onboardingSchema.extend({
  aceitouTermos: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa ler e concordar com a Política de Privacidade para continuar.' }),
  }),
});
type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useUpdateProfile();

  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema)
  });

  const onSubmit = (data: OnboardingFormValues) => {
    mutate({ nome: data.nome }, {
      onSuccess: () => {
        navigate('/app/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg p-8 sm:p-10 rounded-3xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner animate-in zoom-in duration-500 delay-150">
          <UserCheck className="w-10 h-10 text-primary" />
        </div>

        <div className="text-center w-full mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Falta pouco!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
            Para garantir que todos te conheçam na plataforma, precisamos do seu nome completo.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Nome Completo
            </label>
            <input 
              id="nome"
              type="text" 
              {...register('nome')}
              placeholder="Ex: João Silva Mendes"
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
            {errors.nome && <span className="text-sm text-red-500 font-bold ml-1">{errors.nome.message}</span>}
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 flex gap-3 text-left">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 shrink-0" />
            <div className="text-sm text-orange-800 dark:text-orange-300">
              <span className="font-bold block mb-0.5">Atenção: Use seu nome verdadeiro!</span>
              A plataforma é um ambiente acadêmico sério. Certifique-se de que não há erros de digitação, pois <strong className="font-extrabold underline decoration-orange-400/50 underline-offset-2">não será possível</strong> alterar seu nome posteriormente nesta versão.
            </div>
          </div>

          {/* Card de Consentimento LGPD */}
          <div className="space-y-1.5">
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left">
              <input
                type="checkbox"
                id="aceitouTermos"
                {...register('aceitouTermos')}
                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-600 cursor-pointer shrink-0 accent-primary"
              />
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Li e concordo com a{' '}
                <Link
                  to="/privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary underline underline-offset-2 hover:text-primary/80 inline-flex items-center gap-1"
                >
                  Política de Privacidade e Proteção de Dados (LGPD){' '}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </Link>
                , autorizando o tratamento estritamente pedagógico dos meus dados no Prumo.
              </span>
            </label>
            {errors.aceitouTermos && (
              <span className="text-xs text-red-500 font-bold ml-1 block">
                {errors.aceitouTermos.message}
              </span>
            )}
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-lg mt-4"
          >
            {isPending ? 'Salvando...' : 'Continuar para o Dashboard'}
            {!isPending && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

      </div>
    </div>
  );
}
