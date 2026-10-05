import { createPortal } from 'react-dom'

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PixModal({ isOpen, onClose }: PixModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Overlay Escuro */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      {/* Container do Modal */}
      <div className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="flex-none p-5 sm:p-8 pb-4 border-b border-slate-100 dark:border-slate-800 text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors z-10"
          >
            ✕
          </button>
          
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">Apoie o Projeto</h2>
        </div>

        {/* Corpo Rolável */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="space-y-6">
            
            {/* Propósito */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Destino do Valor</span>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                100% destinado ao pagamento mensal dos servidores e do banco de dados da plataforma Prumo.
              </p>
            </div>

            {/* Dados do PIX */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Recebedor</label>
                <div className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold break-words">
                  [Nome Completo do Responsável Financeiro]
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Banco</label>
                <div className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold break-words">
                  [Nome da Instituição Bancária]
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 ml-1">Chave PIX</label>
                <div className="relative">
                  <div className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold break-all pr-12">
                    [chave-pix-aqui]
                  </div>
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg"
                    title="Copiar Chave"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="flex-none p-5 sm:p-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl sm:rounded-b-3xl">
          <button 
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
