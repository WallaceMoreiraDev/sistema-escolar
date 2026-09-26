import { useState } from 'react'
import { JoinClassModal } from './JoinClassModal'
import { CreateClassModal } from './CreateClassModal'

export function NoClassBanner() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPending, setIsPending] = useState(false); // Mock visual de Aguardando Aprovação

  return (
    <>
      <div className="glass-panel p-10 rounded-3xl flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Você ainda não faz parte de nenhuma turma.</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
          Vincule-se a uma sala usando o código de convite fornecido pelo seu líder, ou solicite a criação de uma nova sala caso você seja o representante.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button 
            onClick={() => setIsJoinOpen(true)}
            className="px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 font-bold transition-all hover:-translate-y-1 active:scale-95 text-center"
          >
            Entrar em uma Turma
          </button>
          
          {isPending ? (
            <div className="px-6 py-3.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 rounded-xl font-bold shadow-inner flex items-center justify-center gap-2 cursor-not-allowed">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Aguardando Aprovação
            </div>
          ) : (
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold shadow-sm transition-all hover:-translate-y-1 active:scale-95"
            >
              Criar Nova Turma
            </button>
          )}
        </div>
      </div>

      <JoinClassModal 
        isOpen={isJoinOpen} 
        onClose={() => setIsJoinOpen(false)} 
        onSuccess={() => {
          setIsJoinOpen(false);
          // O DashboardPage.tsx trocaria o estado hasClass globalmente aqui.
          alert("Mock: Aluno atrelado à turma com sucesso!");
        }}
      />
      
      <CreateClassModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSubmit={() => {
          setIsCreateOpen(false);
          setIsPending(true); // O botão vai sumir e dar lugar ao aviso de pendente
        }}
      />
    </>
  )
}
