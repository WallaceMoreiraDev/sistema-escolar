import React, { useState } from 'react';
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import { useClassEvents, useDeleteEvent, useDeleteAttachment } from '../hooks/useClassEvents';
import { EventDTO, EventAttachmentDTO } from '@shared/types';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { getErrorMessage } from '@/utils/errorMessages';
import { ApiError } from '@/utils/apiError';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { eventApi } from '../api/eventApi';
import { AttachmentImagePreview } from './AttachmentImagePreview';
import { formatFileSize, isImageAttachment } from '../utils/attachmentUtils';
import { triggerFileDownload } from '../utils/downloadHelper';
import { sanitizeSafeUrl } from '@/utils/urlSecurity';

interface EventListProps {
  onEdit: (event: EventDTO) => void;
  turmaId?: string;
}

export function EventList({ onEdit, turmaId }: EventListProps) {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { session } = useAuth();
  const { data: response, isLoading, isError, error } = useClassEvents(undefined, undefined, turmaId);
  const deleteMutation = useDeleteEvent();
  const deleteAttachmentMutation = useDeleteAttachment();

  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventDTO | null>(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState<{
    eventId: string;
    attachment: EventAttachmentDTO;
  } | null>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const handleDelete = (event: EventDTO) => {
    setActionError(null);
    setEventToDelete(event);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete.id, {
        onSuccess: () => {
          setEventToDelete(null);
          setActionSuccess(`Atividade "${eventToDelete.materia}" excluída com sucesso.`);
          setTimeout(() => setActionSuccess(null), 4000);
        },
        onError: (err) => {
          setEventToDelete(null);
          if (err instanceof ApiError) {
            setActionError(getErrorMessage(err.code, err.message));
          } else {
            setActionError('Ocorreu um erro ao excluir a atividade.');
          }
        },
      });
    }
  };

  const handleDownloadAttachment = async (
    eventId: string,
    anexoId: string,
    anexoNome?: string
  ) => {
    if (!session?.access_token) return;
    setActionError(null);
    setDownloadingId(anexoId);
    try {
      const res = await eventApi.getAttachmentDownloadUrl(
        session.access_token,
        eventId,
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

  const confirmDeleteAttachment = () => {
    if (!attachmentToDelete) return;
    deleteAttachmentMutation.mutate(
      { eventId: attachmentToDelete.eventId, anexoId: attachmentToDelete.attachment.id },
      {
        onSuccess: () => {
          setActionSuccess(
            `Anexo "${attachmentToDelete.attachment.nomeArquivo}" excluído com sucesso.`
          );
          setAttachmentToDelete(null);
          setTimeout(() => setActionSuccess(null), 4000);
        },
        onError: (err) => {
          setAttachmentToDelete(null);
          if (err instanceof ApiError) {
            setActionError(getErrorMessage(err.code, err.message));
          } else {
            setActionError('Erro ao excluir anexo.');
          }
        },
      }
    );
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEventId((curr) => (curr === eventId ? null : eventId));
  };

  const allEvents = response?.data || [];
  const total = allEvents.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedEvents = allEvents.slice((page - 1) * limit, page * limit);

  // Renderizador compartilhado dos detalhes da atividade (SSOT para Desktop e Mobile)
  const renderEventDetails = (event: EventDTO) => {
    const anexosCount = event.anexos ? event.anexos.length : 0;
    const deadline = new Date(event.dataHoraLimite).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const isExpiredPastSevenDays = now - deadline > sevenDaysMs;

    return (
      <div className="space-y-4 w-full">
        {/* Descrição */}
        {event.descricao && (
          <div className="w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Descrição:
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 leading-relaxed">
              {event.descricao}
            </p>
          </div>
        )}

        {/* Links Externos */}
        {((event.links && event.links.length > 0) || event.anexoUrl) && (
          <div className="w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
              Links Externos de Apoio:
            </span>
            <div className="flex flex-wrap gap-2">
              {event.links &&
                event.links.map((link, idx) => (
                  <a
                    key={`event-link-${event.id}-${idx}`}
                    href={sanitizeSafeUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary hover:border-primary/40 shadow-sm transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-primary" />
                    <span>{link.titulo}</span>
                  </a>
                ))}
              {event.anexoUrl &&
                (!event.links || !event.links.some((l) => l.url === event.anexoUrl)) && (
                  <a
                    href={sanitizeSafeUrl(event.anexoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-primary hover:border-primary/40 shadow-sm transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    <span>Material de Apoio</span>
                  </a>
                )}
            </div>
          </div>
        )}

        {/* Anexos Físicos */}
        <div className="w-full">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Paperclip className="w-3.5 h-3.5 text-primary" />
            Arquivos Anexados:
          </span>

          {anexosCount > 0 ? (
            <div className="space-y-3 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {event.anexos.map((anexo) => {
                  const isImg = isImageAttachment(anexo);
                  const isPdf = anexo.mimeType === 'application/pdf';
                  const isDownloading = downloadingId === anexo.id;

                  // Se for imagem, renderiza preview inline com Lightbox embutido
                  if (isImg) {
                    return (
                      <AttachmentImagePreview
                        key={anexo.id}
                        eventId={event.id}
                        anexo={anexo}
                        canDelete={false}
                        onDelete={() =>
                          setAttachmentToDelete({
                            eventId: event.id,
                            attachment: anexo,
                          })
                        }
                      />
                    );
                  }

                  // Se for PDF ou outro arquivo, renderiza card com download e delete
                  return (
                    <div
                      key={anexo.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm text-xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isPdf
                              ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {anexo.nomeArquivo}
                          </p>
                          <span className="text-slate-400 text-[11px]">
                            {formatFileSize(anexo.tamanhoBytes)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadAttachment(event.id, anexo.id, anexo.nomeArquivo);
                          }}
                          disabled={isDownloading}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Baixar documento"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                        
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aviso Mandatório de Auto-Expurgo de 7 Dias */}
              <div className="w-full p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs leading-relaxed flex items-start gap-2.5 mt-2 whitespace-normal break-words">
                <AlertCircle className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
                <span className="flex-1">
                  <strong className="font-semibold text-slate-800 dark:text-slate-100">
                    Nota:
                  </strong>{' '}
                  Para otimização de armazenamento do sistema, os arquivos
                  anexados ficam disponíveis até 7 dias após o prazo final da
                  atividade. Após esse período, os anexos físicos são
                  automaticamente removidos.
                </span>
              </div>
            </div>
          ) : isExpiredPastSevenDays ? (
            <div className="w-full p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2.5 whitespace-normal break-words">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span className="flex-1">
                Os anexos desta atividade foram removidos para otimização do
                armazenamento (o prazo encerrou há mais de 7 dias).
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Nenhum arquivo físico anexado a esta atividade.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {actionSuccess && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Atividades e Eventos Cadastrados
          </h3>
          <span className="text-sm text-slate-500 font-medium">
            Total: {total}
          </span>
        </div>

        {isError && (
          <div className="p-8 text-center text-red-500 font-bold flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <span>
              {error instanceof ApiError
                ? getErrorMessage(error.code, error.message)
                : 'Erro ao carregar as atividades da turma.'}
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. VISUALIZAÇÃO DESKTOP: TABELA TRADICIONAL (hidden md:block)              */}
        {/* ========================================================================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Matéria</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Recursos</th>
                <th className="px-6 py-4">Data Limite</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`sk-evt-${i}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma atividade cadastrada para o período.
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event) => {
                  const isProva = event.categoria === 'Prova';
                  const isTrab = event.categoria === 'Trabalho';
                  const isAviso = event.categoria === 'Aviso';

                  let badgeClass =
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                  if (isProva)
                    badgeClass =
                      'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
                  if (isTrab)
                    badgeClass =
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                  if (isAviso)
                    badgeClass =
                      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';

                  const isExpanded = expandedEventId === event.id;
                  const linksCount = (event.links ? event.links.length : 0) + (event.anexoUrl ? 1 : 0);
                  const anexosCount = event.anexos ? event.anexos.length : 0;

                  const deadline = new Date(event.dataHoraLimite).getTime();
                  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
                  const isExpiredPastSevenDays = now - deadline > sevenDaysMs;

                  return (
                    <React.Fragment key={event.id}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          <button
                            type="button"
                            onClick={() => toggleExpand(event.id)}
                            className="flex items-center gap-2 hover:text-primary transition-colors text-left"
                            title="Clique para ver anexos e detalhes"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span>{event.materia}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}
                          >
                            {event.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {linksCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                <ExternalLink className="w-3 h-3" />
                                {linksCount} link{linksCount > 1 ? 's' : ''}
                              </span>
                            )}
                            {anexosCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                                <Paperclip className="w-3 h-3" />
                                {anexosCount} anexo{anexosCount > 1 ? 's' : ''}
                              </span>
                            ) : isExpiredPastSevenDays ? (
                              <span className="text-[11px] text-slate-400 italic">
                                Anexos expurgados
                              </span>
                            ) : null}
                            {linksCount === 0 && anexosCount === 0 && !isExpiredPastSevenDays && (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                          {new Date(event.dataHoraLimite).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(event);
                              }}
                              className="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700"
                              title="Editar Atividade"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(event);
                              }}
                              disabled={
                                deleteMutation.isPending && eventToDelete?.id === event.id
                              }
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                              title="Excluir Atividade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* DETALHES EXPANSÍVEIS DESKTOP */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60 dark:bg-slate-900/30">
                          <td
                            colSpan={5}
                            className="p-5 border-t border-b border-slate-100 dark:border-slate-800/80 whitespace-normal break-words max-w-full"
                          >
                            <div className="w-full max-w-4xl">
                              {renderEventDetails(event)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* 2. VISUALIZAÇÃO MOBILE: CARDS VERTICAIS RESPONSIVOS (block md:hidden)     */}
        {/* ========================================================================= */}
        <div className="block md:hidden">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`sk-mob-${i}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 animate-pulse space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-28" />
                </div>
              ))}
            </div>
          ) : paginatedEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhuma atividade cadastrada para o período.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedEvents.map((event) => {
                const isProva = event.categoria === 'Prova';
                const isTrab = event.categoria === 'Trabalho';
                const isAviso = event.categoria === 'Aviso';

                let badgeClass =
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                if (isProva)
                  badgeClass =
                    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
                if (isTrab)
                  badgeClass =
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                if (isAviso)
                  badgeClass =
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';

                const isExpanded = expandedEventId === event.id;
                const linksCount = (event.links ? event.links.length : 0) + (event.anexoUrl ? 1 : 0);
                const anexosCount = event.anexos ? event.anexos.length : 0;
                const deadline = new Date(event.dataHoraLimite).getTime();
                const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
                const isExpiredPastSevenDays = now - deadline > sevenDaysMs;

                return (
                  <div
                    key={`mob-card-${event.id}`}
                    className="p-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    {/* Cabeçalho do Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}
                          >
                            {event.categoria}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {new Date(event.dataHoraLimite).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {event.materia}
                        </h4>
                      </div>

                      {/* Ações do Card */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(event);
                          }}
                          className="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700"
                          title="Editar Atividade"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(event);
                          }}
                          disabled={deleteMutation.isPending && eventToDelete?.id === event.id}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                          title="Excluir Atividade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Recursos Rápidos (Links e Anexos) */}
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      {linksCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[11px] font-semibold">
                          <ExternalLink className="w-3 h-3" />
                          {linksCount} link{linksCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {anexosCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 text-[11px] font-semibold">
                          <Paperclip className="w-3 h-3" />
                          {anexosCount} anexo{anexosCount > 1 ? 's' : ''}
                        </span>
                      ) : isExpiredPastSevenDays ? (
                        <span className="text-[11px] text-slate-400 italic">
                          Anexos expurgados
                        </span>
                      ) : null}
                    </div>

                    {/* Botão de Expansão Elegante */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => toggleExpand(event.id)}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-1"
                      >
                        <span>
                          {isExpanded ? 'Ocultar detalhes e anexos' : 'Ver detalhes e anexos'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Área Expandida Mobile (w-full e overflow-x-hidden) */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700/60 w-full overflow-x-hidden animate-in fade-in duration-150">
                        {renderEventDetails(event)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Paginação padronizada em 5 itens */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <span className="text-sm font-bold text-slate-500">
              Página <span className="text-slate-900 dark:text-white">{page}</span> de{' '}
              {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!eventToDelete}
        title="Excluir Atividade"
        message={`Tem certeza que deseja excluir a atividade "${eventToDelete?.materia}"? Essa ação apagará a tarefa e todos os anexos associados para todos os alunos da turma e não pode ser desfeita.`}
        isDestructive={true}
        isLoading={deleteMutation.isPending}
        confirmText="Excluir Atividade"
        onConfirm={confirmDelete}
        onCancel={() => setEventToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!attachmentToDelete}
        title="Excluir Anexo"
        message={`Tem certeza que deseja excluir o anexo "${attachmentToDelete?.attachment.nomeArquivo}"? O arquivo será removido do armazenamento da turma imediatamente.`}
        isDestructive={true}
        isLoading={deleteAttachmentMutation.isPending}
        confirmText="Excluir Anexo"
        onConfirm={confirmDeleteAttachment}
        onCancel={() => setAttachmentToDelete(null)}
      />
    </>
  );
}
