import { createPortal } from 'react-dom'

export type EventCategory = 'Prova' | 'Trabalho' | 'Tarefa';

export interface ClassEvent {
  id: string;
  subject: string;
  category: EventCategory;
  date: string;
  time?: string;
  description: string;
  imageUrl?: string;
}

interface EventModalProps {
  event: ClassEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!isOpen || !event) return null;

  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case 'Prova': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800/50';
      case 'Trabalho': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'Tarefa': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header Fixed */}
        <div className="flex-none p-5 sm:p-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors z-10"
          >
            ✕
          </button>

          <div className="mb-4 pr-8">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight break-words">{event.subject}</h2>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{event.date}</span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{event.time}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição Detalhada</h3>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base break-words whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </div>

          {event.imageUrl && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Anexo / Mídia</h3>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-50 dark:bg-slate-900/50">
                <img 
                  src={event.imageUrl} 
                  alt="Anexo do evento" 
                  className="w-full h-auto max-h-[60vh] object-contain" 
                  loading="lazy"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">A imagem acima foi anexada pelo líder da turma.</p>
            </div>
          )}
        </div>

        {/* Modal Footer Fixed */}
        <div className="flex-none p-5 sm:p-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl sm:rounded-b-3xl">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold transition-colors active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
