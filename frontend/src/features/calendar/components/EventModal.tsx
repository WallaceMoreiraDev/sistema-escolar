import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  X,
  Calendar,
  FileText,
  ExternalLink,
  AlertTriangle,
  BookOpen,
  Paperclip,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useClassEvents } from '../../class-admin/hooks/useClassEvents';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { eventApi } from '../../class-admin/api/eventApi';
import { AttachmentImagePreview } from '../../class-admin/components/AttachmentImagePreview';
import { formatFileSize, isImageAttachment } from '../../class-admin/utils/attachmentUtils';
import { triggerFileDownload } from '../../class-admin/utils/downloadHelper';

export function EventModal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { session } = useAuth();

  const { data: response } = useClassEvents();
  const events = response?.data || [];

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const rawEvent = events.find((e) => e.id === id);

  const onClose = () => {
    navigate('/app/minha-turma');
  };

  // Download de anexo (para PDFs e arquivos genéricos)
  const handleDownload = async (anexoId: string, anexoNome?: string) => {
    if (!session?.access_token || !rawEvent) return;
    setActionError(null);
    setDownloadingId(anexoId);
    try {
      const res = await eventApi.getAttachmentDownloadUrl(
        session.access_token,
        rawEvent.id,
        anexoId
      );
      if (res.data?.downloadUrl) {
        triggerFileDownload(res.data.downloadUrl, anexoNome);
      }
    } catch {
      setActionError('Não foi possível obter o link de download do anexo.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Prepara o evento para UI caso exista
  let event = null;
  let isExpiredPastSevenDays = false;
  let hasAttachments = false;

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

    const deadline = dateObj.getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    isExpiredPastSevenDays = now - deadline > sevenDaysMs;
    hasAttachments = !!rawEvent.anexos && rawEvent.anexos.length > 0;

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
        className="glass-panel w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/30 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {event && rawEvent ? (
          <>
            {/* Cabeçalho do Modal */}
            <div
              className={`p-6 border-b border-slate-200/50 dark:border-slate-800/50 ${event.bgClass} shrink-0`}
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
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 overflow-y-auto space-y-6">
              {actionError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Data Limite */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Data Limite / Realização
                </h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm inline-block">
                  {event.dateStr}
                </p>
              </div>

              {/* Descrição Detalhada */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Descrição Detalhada
                </h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm whitespace-pre-wrap break-words">
                  {event.descricao || (
                    <span className="italic opacity-60">Sem descrição detalhada.</span>
                  )}
                </div>
              </div>

              {/* LINKS EXTERNOS (Canva, Drive, Miro, etc.) */}
              {((event.links && event.links.length > 0) || event.anexoUrl) && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    Links Externos de Apoio
                  </h4>
                  <div className="space-y-2.5">
                    {event.links &&
                      event.links.map((link, idx) => (
                        <a
                          key={`event-link-${idx}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group bg-white dark:bg-slate-800 shadow-sm"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                                {link.titulo}
                              </span>
                              <span className="text-xs text-slate-400 truncate">
                                {link.url}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-primary group-hover:underline shrink-0 ml-2">
                            Acessar
                          </span>
                        </a>
                      ))}

                    {/* Legado anexoUrl caso exista e não esteja na lista de links */}
                    {event.anexoUrl &&
                      (!event.links || !event.links.some((l) => l.url === event.anexoUrl)) && (
                        <a
                          href={event.anexoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group bg-white dark:bg-slate-800 shadow-sm"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                                Material de Apoio
                              </span>
                              <span className="text-xs text-slate-400 truncate">
                                {event.anexoUrl}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-primary group-hover:underline shrink-0 ml-2">
                            Abrir
                          </span>
                        </a>
                      )}
                  </div>
                </div>
              )}

              {/* ANEXOS FÍSICOS (Preview Inline de Imagens e Cards de Documentos) */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4" />
                  Anexos da Atividade
                </h4>

                {hasAttachments ? (
                  <div className="space-y-3">
                    <div className="space-y-3">
                      {event.anexos.map((anexo) => {
                        const isImg = isImageAttachment(anexo);
                        const isPdf = anexo.mimeType === 'application/pdf';
                        const isDownloading = downloadingId === anexo.id;

                        // Se for imagem, renderiza o componente de Preview Inline diretamente na tela
                        if (isImg) {
                          return (
                            <AttachmentImagePreview
                              key={anexo.id}
                              eventId={rawEvent.id}
                              anexo={anexo}
                              canDelete={false}
                            />
                          );
                        }

                        // Se for PDF ou outro arquivo físico, renderiza card com botão de baixar/abrir
                        return (
                          <div
                            key={anexo.id}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                  isPdf
                                    ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {anexo.nomeArquivo}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {formatFileSize(anexo.tamanhoBytes)}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDownload(anexo.id, anexo.nomeArquivo)}
                              disabled={isDownloading}
                              className="px-3 py-1.5 text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 ml-3"
                              title="Baixar ou visualizar documento"
                            >
                              {isDownloading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>Baixar</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* AVISO MANDATÓRIO DE AUTO-EXPURGO DE 7 DIAS */}
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs leading-relaxed flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
                      <span>
                        <strong className="font-semibold text-slate-800 dark:text-slate-100">
                          Nota:
                        </strong>{' '}
                        Para otimização de armazenamento do sistema, os arquivos anexados ficam
                        disponíveis até 7 dias após o prazo final da atividade. Após esse período,
                        os anexos físicos são automaticamente removidos.
                      </span>
                    </div>
                  </div>
                ) : isExpiredPastSevenDays ? (
                  /* ESTADO VAZIO INFORMATIVO: ATIVIDADE EXPIRADA HÁ MAIS DE 7 DIAS */
                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <span>
                      Os anexos desta atividade foram removidos para otimização do armazenamento (o
                      prazo encerrou há mais de 7 dias).
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    Nenhum arquivo físico anexado a esta atividade.
                  </p>
                )}
              </div>
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
