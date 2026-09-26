import { createPortal } from 'react-dom'

interface Notice {
  id: string;
  sender: "Diretoria ETEC" | "Coordenação" | "Administração da Plataforma";
  badge: "Urgente" | "Informativo" | "Evento";
  title: string;
  message: string;
  date: string;
}

interface NoticeModalProps {
  notice: Notice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NoticeModal({ notice, isOpen, onClose }: NoticeModalProps) {
  if (!isOpen || !notice) return null;

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'urgente': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      case 'evento': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
    }
  }

  // Renderiza o modal fora da hierarquia DOM (direto no body) para evitar bugs de z-index e overlays presos em divs com animação
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header Fixed */}
        <div className="flex-none p-5 sm:p-8 pb-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors z-10"
          >
            ✕
          </button>

          <div className="flex items-center gap-3 mb-5 pr-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg sm:text-xl shrink-0">
              {notice.sender === 'Diretoria ETEC' ? '🏛️' : notice.sender === 'Coordenação' ? '🏫' : '💻'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">{notice.sender}</p>
              <p className="text-xs text-slate-500 mt-0.5">{notice.date}</p>
            </div>
          </div>

          <div className="mb-4 flex items-center">
            <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${getBadgeColor(notice.badge)}`}>
              {notice.badge}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">{notice.title}</h2>
        </div>

        {/* Modal Body Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 pb-5 sm:pb-8">
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base break-words">
              {notice.message}
            </p>
          </div>
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
