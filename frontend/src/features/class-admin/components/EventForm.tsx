import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPortal } from 'react-dom';
import {
  X,
  AlertCircle,
  Paperclip,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import {
  useCreateEvent,
  useUpdateEvent,
  useUploadAttachment,
  useDeleteAttachment,
} from '../hooks/useClassEvents';
import {
  EventDTO,
  CreateEventPayload,
  EventAttachmentDTO,
} from '@shared/types';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { formatFileSize, isImageAttachment } from '../utils/attachmentUtils';
import { getErrorMessage } from '@/utils/errorMessages';
import { ApiError } from '@/utils/apiError';

const MAX_TOTAL_BYTES = 5 * 1024 * 1024; // 5 MB

const linkItemSchema = z.object({
  titulo: z
    .string({ required_error: 'O título do link é obrigatório.' })
    .trim()
    .min(1, 'O título do link deve ter no mínimo 1 caractere.')
    .max(100, 'O título do link deve ter no máximo 100 caracteres.'),
  url: z
    .string({ required_error: 'A URL do link é obrigatória.' })
    .trim()
    .url('A URL do link deve ser válida (ex: https://...).')
    .max(500, 'A URL do link deve ter no máximo 500 caracteres.'),
});

const eventFormSchema = z.object({
  materia: z
    .string({ required_error: 'A matéria é obrigatória.' })
    .trim()
    .min(2, 'A matéria deve ter no mínimo 2 caracteres.')
    .max(100, 'A matéria deve ter no máximo 100 caracteres.'),
  categoria: z.enum(['Prova', 'Trabalho', 'Tarefa', 'Aviso'], {
    errorMap: () => ({ message: 'Selecione uma categoria válida.' }),
  }),
  dataHoraLimite: z
    .string({ required_error: 'A data e horário limite são obrigatórios.' })
    .min(1, 'A data e horário limite são obrigatórios.'),
  descricao: z
    .string()
    .trim()
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres.')
    .optional(),
  links: z
    .array(linkItemSchema)
    .max(2, 'No máximo 2 links são permitidos.'),
});

type EventFormInput = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventDTO | null;
  turmaId?: string;
}

export function EventForm({ isOpen, onClose, eventToEdit, turmaId }: EventFormProps) {
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const uploadAttachmentMutation = useUploadAttachment();
  const deleteAttachmentMutation = useDeleteAttachment();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<EventAttachmentDTO[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [attachmentToDelete, setAttachmentToDelete] = useState<EventAttachmentDTO | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      materia: '',
      categoria: 'Tarefa',
      dataHoraLimite: '',
      descricao: '',
      links: [],
    },
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control,
    name: 'links',
  });

  // Cálculo da cota cumulativa
  const existingBytes = existingAttachments.reduce(
    (sum, a) => sum + (a.tamanhoBytes || 0),
    0
  );
  const pendingBytes = pendingFiles.reduce((sum, f) => sum + f.size, 0);
  const totalBytes = existingBytes + pendingBytes;
  const quotaPercentage = Math.min(100, Math.round((totalBytes / MAX_TOTAL_BYTES) * 100));

  const handleClose = () => {
    setErrorMessage(null);
    setPendingFiles([]);
    setAttachmentToDelete(null);
    onClose();
  };

  useEffect(() => {
    if (eventToEdit && isOpen) {
      // Converte data ISO UTC para o formato datetime-local no fuso local
      const d = new Date(eventToEdit.dataHoraLimite);
      const pad = (n: number) => String(n).padStart(2, '0');
      const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

      let initialLinks =
        eventToEdit.links?.map((l) => ({
          titulo: l.titulo,
          url: l.url,
        })) || [];

      // Compatibilidade legada com anexoUrl caso não haja links cadastrados
      if (initialLinks.length === 0 && eventToEdit.anexoUrl) {
        initialLinks = [{ titulo: 'Material de Apoio', url: eventToEdit.anexoUrl }];
      }

      reset({
        materia: eventToEdit.materia,
        categoria: eventToEdit.categoria,
        dataHoraLimite: formattedDate,
        descricao: eventToEdit.descricao || '',
        links: initialLinks,
      });

      setExistingAttachments(eventToEdit.anexos || []);
      setPendingFiles([]);
      setAttachmentToDelete(null);
      setErrorMessage(null);
    } else if (isOpen && !eventToEdit) {
      reset({
        materia: '',
        categoria: 'Tarefa',
        dataHoraLimite: '',
        descricao: '',
        links: [],
      });
      setExistingAttachments([]);
      setPendingFiles([]);
      setAttachmentToDelete(null);
      setErrorMessage(null);
    }
  }, [eventToEdit, isOpen, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    setIsCompressing(true);

    try {
      const validFiles: File[] = [];
      let currentTotalBytes = totalBytes;

      for (let i = 0; i < files.length; i++) {
        const originalFile = files[i];

        // Validação estrita de tipos MIME e extensão correspondente (prevenção contra spoofing)
        const allowedExtensions: Record<string, string[]> = {
          'application/pdf': ['.pdf'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'image/webp': ['.webp'],
        };

        const extIndex = originalFile.name.lastIndexOf('.');
        const ext = extIndex !== -1 ? originalFile.name.substring(extIndex).toLowerCase() : '';

        if (!allowedExtensions[originalFile.type] || !allowedExtensions[originalFile.type].includes(ext)) {
          setErrorMessage(
            `O arquivo "${originalFile.name}" possui formato ou extensão não permitidos. Tipos aceitos: PDF (.pdf), JPEG (.jpg, .jpeg), PNG (.png) e WEBP (.webp).`
          );
          continue;
        }

        let fileToUpload = originalFile;

        // Otimização client-side de imagens
        if (originalFile.type.startsWith('image/')) {
          try {
            const imageCompression = (await import('browser-image-compression')).default;
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            const compressedBlob = await imageCompression(originalFile, options);
            fileToUpload = new File([compressedBlob], originalFile.name, {
              type: compressedBlob.type,
              lastModified: Date.now(),
            });
          } catch (compErr) {
            console.warn('Falha na compressão da imagem, mantendo arquivo original:', compErr);
            fileToUpload = originalFile;
          }
        }

        // Validação cumulativa do teto de 5 MB
        if (currentTotalBytes + fileToUpload.size > MAX_TOTAL_BYTES) {
          setErrorMessage(
            'O limite total de 5 MB de anexos para esta atividade foi atingido.'
          );
          break;
        }

        currentTotalBytes += fileToUpload.size;
        validFiles.push(fileToUpload);
      }

      if (validFiles.length > 0) {
        setPendingFiles((prev) => [...prev, ...validFiles]);
      }
    } catch {
      setErrorMessage('Erro ao processar os arquivos selecionados.');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const confirmDeleteAttachment = () => {
    if (!attachmentToDelete || !eventToEdit) return;

    deleteAttachmentMutation.mutate(
      { eventId: eventToEdit.id, anexoId: attachmentToDelete.id },
      {
        onSuccess: () => {
          setExistingAttachments((prev) =>
            prev.filter((a) => a.id !== attachmentToDelete.id)
          );
          setAttachmentToDelete(null);
        },
        onError: (err) => {
          setAttachmentToDelete(null);
          if (err instanceof ApiError) {
            setErrorMessage(getErrorMessage(err.code, err.message));
          } else {
            setErrorMessage('Erro ao excluir anexo.');
          }
        },
      }
    );
  };

  const isEditing = !!eventToEdit;
  const isPending =
    createEventMutation.isPending ||
    updateEventMutation.isPending ||
    uploadAttachmentMutation.isPending ||
    isCompressing;

  const onSubmit = async (data: EventFormInput) => {
    setErrorMessage(null);

    // Converte datetime-local para ISO 8601 UTC
    const utcDate = new Date(data.dataHoraLimite).toISOString();

    const payload: CreateEventPayload = {
      materia: data.materia.trim(),
      categoria: data.categoria,
      dataHoraLimite: utcDate,
      descricao: data.descricao?.trim() ? data.descricao.trim() : null,
      links: (data.links || []).filter((l) => l.titulo.trim() && l.url.trim()),
    };

    try {
      let targetEventId: string;

      if (isEditing && eventToEdit) {
        const updateRes = await updateEventMutation.mutateAsync({
          id: eventToEdit.id,
          data: payload,
        });
        targetEventId = updateRes.data.id;
      } else {
        const createRes = await createEventMutation.mutateAsync({
          payload,
          turmaId,
        });
        targetEventId = createRes.data.id;
      }

      // Se houver novos arquivos a serem anexados, realiza upload sequencial
      if (pendingFiles.length > 0) {
        for (const file of pendingFiles) {
          await uploadAttachmentMutation.mutateAsync({
            eventId: targetEventId,
            file,
          });
        }
      }

      handleClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(getErrorMessage(err.code, err.message));
      } else {
        setErrorMessage(
          isEditing
            ? 'Ocorreu um erro ao atualizar o evento.'
            : 'Ocorreu um erro ao cadastrar o evento.'
        );
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={isPending ? undefined : handleClose}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button
              onClick={handleClose}
              disabled={isPending}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors z-10 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
              {isEditing ? 'Editar Atividade' : 'Cadastrar Nova Atividade'}
            </h3>

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Matéria */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Matéria *
                  </label>
                  <input
                    {...register('materia')}
                    type="text"
                    placeholder="Ex: Matemática"
                    disabled={isPending}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.materia
                        ? 'border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                    } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all disabled:opacity-50`}
                  />
                  {errors.materia && (
                    <p className="text-xs text-red-500 mt-1">{errors.materia.message}</p>
                  )}
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    {...register('categoria')}
                    disabled={isPending}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.categoria
                        ? 'border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                    } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all appearance-none disabled:opacity-50`}
                  >
                    <option value="Prova">Prova</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Tarefa">Tarefa</option>
                    <option value="Aviso">Aviso</option>
                  </select>
                  {errors.categoria && (
                    <p className="text-xs text-red-500 mt-1">{errors.categoria.message}</p>
                  )}
                </div>
              </div>

              {/* Data e Horário Limite */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Data e Horário Limite *
                </label>
                <input
                  {...register('dataHoraLimite')}
                  type="datetime-local"
                  disabled={isPending}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.dataHoraLimite
                      ? 'border-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                  } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all disabled:opacity-50`}
                />
                {errors.dataHoraLimite && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.dataHoraLimite.message}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição Detalhada (Opcional)
                </label>
                <textarea
                  {...register('descricao')}
                  rows={3}
                  disabled={isPending}
                  placeholder="Ex: Capítulos 4 e 5 do livro didático. Trazer calculadora científica."
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.descricao
                      ? 'border-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                  } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none transition-all resize-none disabled:opacity-50`}
                />
                {errors.descricao && (
                  <p className="text-xs text-red-500 mt-1">{errors.descricao.message}</p>
                )}
              </div>

              {/* LINKS EXTERNOS DE APOIO (ATÉ 2 LINKS) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <span>Links Externos de Apoio (Até 2 links)</span>
                  </label>
                  {linkFields.length < 2 && (
                    <button
                      type="button"
                      onClick={() => appendLink({ titulo: '', url: '' })}
                      disabled={isPending}
                      className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Link</span>
                    </button>
                  )}
                </div>

                {linkFields.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum link externo adicionado. Você pode incluir até 2 links (ex: Google Drive, slides).
                  </p>
                ) : (
                  <div className="space-y-3">
                    {linkFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Link #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            disabled={isPending}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                            title="Remover link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <input
                              {...register(`links.${index}.titulo` as const)}
                              type="text"
                              placeholder="Título (ex: Slides da Aula)"
                              disabled={isPending}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-primary transition-all disabled:opacity-50"
                            />
                            {errors.links?.[index]?.titulo && (
                              <p className="text-[11px] text-red-500 mt-0.5">
                                {errors.links[index]?.titulo?.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <input
                              {...register(`links.${index}.url` as const)}
                              type="url"
                              placeholder="URL (https://...)"
                              disabled={isPending}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-primary transition-all disabled:opacity-50"
                            />
                            {errors.links?.[index]?.url && (
                              <p className="text-[11px] text-red-500 mt-0.5">
                                {errors.links[index]?.url?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ANEXOS FÍSICOS E COTA DE ARMAZENAMENTO */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-primary" />
                    <span>Anexos Físicos (PDFs e Imagens)</span>
                  </label>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {formatFileSize(totalBytes)} / 5 MB ({quotaPercentage}%)
                  </span>
                </div>

                {/* Barra de Progresso da Cota Cumulativa */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      quotaPercentage >= 95
                        ? 'bg-rose-500'
                        : quotaPercentage >= 75
                        ? 'bg-amber-500'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${quotaPercentage}%` }}
                  />
                </div>

                {/* Área de Seleção de Arquivo */}
                <label
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    totalBytes >= MAX_TOTAL_BYTES || isPending
                      ? 'border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed bg-slate-50/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 bg-slate-50/50 dark:bg-slate-800/20'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    disabled={isPending || totalBytes >= MAX_TOTAL_BYTES}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-primary mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Clique para selecionar anexos (PDF, PNG, JPG ou WEBP)
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 text-center">
                    Imagens são comprimidas automaticamente no seu navegador. Cota máxima de 5 MB somados.
                  </span>
                </label>

                {isCompressing && (
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary py-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Otimizando imagens selecionadas...</span>
                  </div>
                )}

                {/* Anexos já salvos (Modo Edição) */}
                {isEditing && existingAttachments.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Anexos já salvos nesta atividade ({existingAttachments.length}):
                    </span>
                    <div className="space-y-1.5">
                      {existingAttachments.map((anexo) => {
                        const isImg = isImageAttachment(anexo);
                        return (
                          <div
                            key={anexo.id}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-xs shadow-sm"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isImg
                                    ? 'bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400'
                                    : 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400'
                                }`}
                              >
                                {isImg ? (
                                  <ImageIcon className="w-3.5 h-3.5" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {anexo.nomeArquivo}
                                </p>
                                <span className="text-[10px] text-slate-400">
                                  {formatFileSize(anexo.tamanhoBytes)}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setAttachmentToDelete(anexo)}
                              disabled={isPending}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50 shrink-0 ml-2"
                              title="Excluir este anexo permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Novos Anexos a Enviar */}
                {pendingFiles.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Novos anexos a enviar ({pendingFiles.length}):
                    </span>
                    <div className="space-y-1.5">
                      {pendingFiles.map((file, idx) => (
                        <div
                          key={`pending-file-${idx}`}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs shadow-sm"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              {file.type.startsWith('image/') ? (
                                <ImageIcon className="w-3.5 h-3.5" />
                              ) : (
                                <FileText className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                {file.name}
                              </p>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                {formatFileSize(file.size)} (novo)
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemovePendingFile(idx)}
                            disabled={isPending}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50 shrink-0 ml-2"
                            title="Remover arquivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="px-6 py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold transition-colors mr-2 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md"
                >
                  {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                  <span>
                    {isCompressing
                      ? 'Comprimindo imagens...'
                      : uploadAttachmentMutation.isPending
                      ? 'Enviando anexos...'
                      : createEventMutation.isPending || updateEventMutation.isPending
                      ? 'Salvando...'
                      : isEditing
                      ? 'Salvar Alterações'
                      : 'Cadastrar Atividade'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmação para exclusão de anexo individual já salvo */}
      <ConfirmModal
        isOpen={!!attachmentToDelete}
        title="Excluir Anexo"
        message={`Tem certeza que deseja excluir o anexo "${attachmentToDelete?.nomeArquivo}"? O arquivo será removido do armazenamento da turma imediatamente.`}
        isDestructive={true}
        isLoading={deleteAttachmentMutation.isPending}
        confirmText="Excluir Anexo"
        onConfirm={confirmDeleteAttachment}
        onCancel={() => setAttachmentToDelete(null)}
      />
    </>
  );
}
