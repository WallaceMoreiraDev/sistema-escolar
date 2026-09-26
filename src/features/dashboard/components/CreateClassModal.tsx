import { createPortal } from 'react-dom'

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function CreateClassModal({ isOpen, onClose, onSubmit }: CreateClassModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex-none p-5 sm:p-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors z-10"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             </div>
             <div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Solicitar Nova Turma</h2>
               <p className="text-xs text-slate-500 mt-0.5">Sua solicitação passará por aprovação.</p>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          <form id="create-class-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Ano *</label>
                <select required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none">
                  <option value="" disabled selected>Selecione</option>
                  <option value="1">1º Ano</option>
                  <option value="2">2º Ano</option>
                  <option value="3">3º Ano</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Turno *</label>
                <select required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none">
                  <option value="" disabled selected>Selecione</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Curso *</label>
              <select required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none">
                <option value="" disabled selected>Selecione o curso oficial</option>
                <option value="Desenvolvimento de Sistemas">Desenvolvimento de Sistemas</option>
                <option value="Administração">Administração</option>
                <option value="Logística">Logística</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Local / Sala <span className="text-slate-400 font-normal">(Opcional)</span></label>
              <input type="text" placeholder="Ex: Sala 14 - Bloco B" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Justificativa <span className="text-slate-400 font-normal">(Opcional)</span></label>
              <textarea rows={3} placeholder="Motivo da criação da sala..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
            </div>
          </form>
        </div>

        <div className="flex-none p-5 sm:p-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl sm:rounded-b-3xl">
          <button 
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="create-class-form"
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95"
          >
            Enviar Pedido
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
