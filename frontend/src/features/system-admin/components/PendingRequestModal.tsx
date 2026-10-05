import { PendingRequest } from '../data/mockPendingRequests';

interface PendingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PendingRequest | null;
  onApprove: (req: PendingRequest) => void;
  onReject: (req: PendingRequest) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export function PendingRequestModal({ 
  isOpen, 
  onClose, 
  request, 
  onApprove, 
  onReject,
  isApproving,
  isRejecting
}: PendingRequestModalProps) {
  if (!isOpen || !request) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detalhes da Solicitação</h2>
            <p className="text-sm text-slate-500 mt-1">Revise os dados antes de aprovar a criação da turma.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Solicitante */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Solicitante (Futuro Líder)</h3>
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg">
                {request.requesterName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{request.requesterName}</p>
                <p className="text-xs text-slate-500">Solicitado em {formatDate(request.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Dados da Turma */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dados da Turma</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="block text-xs text-slate-500 mb-1">Ano Escolar</span>
                <span className="font-bold text-slate-900 dark:text-white">{request.year}º Ano</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="block text-xs text-slate-500 mb-1">Turno</span>
                <span className="font-bold text-slate-900 dark:text-white">{request.shift}</span>
              </div>
              <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="block text-xs text-slate-500 mb-1">Curso</span>
                <span className="font-bold text-slate-900 dark:text-white">{request.course}</span>
              </div>
              {request.room && (
                <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="block text-xs text-slate-500 mb-1">Local / Sala</span>
                  <span className="font-bold text-slate-900 dark:text-white">{request.room}</span>
                </div>
              )}
            </div>
          </div>

          {/* Justificativa */}
          {request.justification && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Justificativa</h3>
              <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{request.justification}"
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            onClick={() => onReject(request)}
            disabled={isRejecting || isApproving}
            className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Rejeitar
          </button>
          <button 
            onClick={() => onApprove(request)}
            disabled={isApproving || isRejecting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Aprovar e Criar Turma
          </button>
        </div>
      </div>
    </div>
  );
}
