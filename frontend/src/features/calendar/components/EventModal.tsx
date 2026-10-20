import { useNavigate, useParams } from 'react-router-dom';
import { X, Calendar, FileText, ExternalLink, AlertTriangle, BookOpen } from 'lucide-react';
import { useClassEvents } from '../../class-admin/hooks/useClassEvents';

export function EventModal() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: response } = useClassEvents();
  const events = response?.data || [];

  // Encontra o evento baseado no deep link
  const rawEvent = events.find((e) => e.id === id);

  const onClose = () => {
    navigate('/app/minha-turma');
  };

  // Prepara o evento para UI caso exista
  let event = null;
  if (rawEvent) {
    const isProva = rawEvent.categoria === 'Prova';
    const isTrab = rawEvent.categoria === 'Trabalho';
    const isAviso = rawEvent.categoria === 'Aviso';

    const colorClass = isProva
      ? 'text-rose-600'
      : isTrab
      ? 'text-blue-600'
      : isAviso
      ? 'text-purple-600'
      : 'text-amber-600';
    const bgClass = isProva
      ? 'bg-rose-500/10'
      : isTrab
      ? 'bg-blue-500/10'
      : isAviso
      ? 'bg-purple-500/10'
      : 'bg-amber-500/10';

    const dateObj = new Date(rawEvent.dataHoraLimite);
    const dayStr = dateObj.getDate().toString().padStart(2, '0');
    const monthStr = dateObj
      .toLocaleString('pt-BR', { month: 'short' })
      .replace('.', '');
    const time = dateObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateStr = `${dayStr} ${monthStr} • ${time}`;

    event = {
      ...rawEvent,
      label: rawEvent.categoria.toUpperCase(),
      title: rawEvent.materia,
      subject: rawEvent.materia,
      dateStr,
      colorClass,
      bgClass,
    };
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/30"
        onClick={(e) => e.stopPropagation()}
      >
        {event ? (
          <>
            {/* Cabeçalho do Modal */}
            <div
              className={`p-6 border-b border-slate-200/50 dark:border-slate-800/50 ${event.bgClass}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`inline-flex px-3 py-1 rounded-xl text-xs font-bold tracking-widest bg-white/80 dark:bg-slate-900/80 shadow-sm ${event.colorClass}`}
                >
                  {event.label}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all bg-white/40 dark:bg-slate-800/40 rounded-full hover:bg-white dark:hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {event.title}
              </h2>
              <p className="text-sm font-bold mt-3 text-slate-700 dark:text-slate-300 flex items-center gap-2 bg-white/30 dark:bg-slate-900/30 w-fit px-3 py-1.5 rounded-lg shadow-sm">
                <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                {event.subject}
              </p>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Data Limite / Realização
                </h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm inline-block">
                  {event.dateStr}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Descrição Detalhada
                </h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm whitespace-pre-wrap">
                  {event.descricao || (
                    <span className="italic opacity-60">Sem descrição detalhada.</span>
                  )}
                </div>
              </div>

              {event.anexoUrl && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    Anexos e Arquivos
                  </h4>
                  <a
                    href={event.anexoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group bg-white dark:bg-slate-800 shadow-sm mt-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          Acessar Material / Anexo
                        </span>
                        <span className="text-xs text-slate-500 truncate max-w-xs">
                          {event.anexoUrl}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary group-hover:underline">
                      Abrir &rarr;
                    </span>
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          /* TRATAMENTO DE ERRO: 404 Empty State */
          <div className="p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 h-[400px]">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-sm border border-rose-100 dark:border-rose-900/50">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
              Evento Não Encontrado
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-10 leading-relaxed font-medium">
              Este evento foi removido ou está indisponível para a sua turma no momento.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Voltar para Agenda
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
