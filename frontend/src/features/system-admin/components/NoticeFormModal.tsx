import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  AlertTriangle,
  UploadCloud,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  avisoRemetenteEnum,
  avisoBadgeEnum,
  noticeLinkSchema,
} from '@shared/schemas/noticeSchema';
import { NoticeDTO } from '@shared/types';
import {
  useCreateNotice,
  useUpdateNotice,
  useUploadNoticeImage,
  useRemoveNoticeImage,
} from '../../mural/hooks/useNotices';
import { ApiError } from '@/utils/apiError';
import { getErrorMessage } from '@/utils/errorMessages';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const noticeFormSchema = z.object({
  titulo: z
    .string({ required_error: 'O título é obrigatório.' })
    .trim()
    .min(5, 'O título deve ter no mínimo 5 caracteres.')
    .max(255, 'O título deve ter no máximo 255 caracteres.'),
  mensagem: z
    .string({ required_error: 'A mensagem é obrigatória.' })
    .trim()
    .min(10, 'A mensagem deve ter no mínimo 10 caracteres.')
    .max(5000, 'A mensagem deve ter no máximo 5000 caracteres.'),
  remetente: avisoRemetenteEnum,
  badgeDestaque: avisoBadgeEnum,
  links: z.array(noticeLinkSchema).max(2, 'No máximo 2 links são permitidos.'),
});

type NoticeFormValues = z.infer<typeof noticeFormSchema>;

interface NoticeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  noticeToEdit?: NoticeDTO | null;
}

export function NoticeFormModal({ isOpen, onClose, noticeToEdit }: NoticeFormModalProps) {
  const createMutation = useCreateNotice();
  const updateMutation = useUpdateNotice();
  const uploadImageMutation = useUploadNoticeImage();
  const removeImageMutation = useRemoveNoticeImage();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      titulo: '',
      mensagem: '',
      remetente: undefined,
      badgeDestaque: undefined,
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

  // Limpeza de ObjectURL temporário ao desmontar ou trocar de preview
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);

      if (noticeToEdit) {
        setValue('titulo', noticeToEdit.titulo);
        setValue('mensagem', noticeToEdit.mensagem);
        setValue('remetente', noticeToEdit.remetente);
        setValue('badgeDestaque', noticeToEdit.badgeDestaque);
        setValue(
          'links',
          noticeToEdit.links && noticeToEdit.links.length > 0
            ? noticeToEdit.links.map((l) => ({ titulo: l.titulo, url: l.url }))
            : []
        );
        setExistingImageUrl(noticeToEdit.imagemUrl || null);
      } else {
        reset({
          titulo: '',
          mensagem: '',
          remetente: undefined,
          badgeDestaque: undefined,
          links: [],
        });
        setExistingImageUrl(null);
      }
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    }
  }, [isOpen, noticeToEdit, setValue, reset]);

  if (!isOpen) return null;

  // Manipulação de seleção e compressão de imagem
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Validação estrita de extensão e MIME type contra spoofing
    const allowedExtensions: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    };

    const extIndex = file.name.lastIndexOf('.');
    const ext = extIndex !== -1 ? file.name.substring(extIndex).toLowerCase() : '';

    if (!allowedExtensions[file.type] || !allowedExtensions[file.type].includes(ext)) {
      setErrorMessage(
        'Formato de arquivo não suportado. Por favor, envie uma imagem nos formatos JPEG (.jpg, .jpeg), PNG (.png) ou WEBP (.webp).'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrorMessage('A imagem selecionada excede o limite máximo permitido de 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsCompressing(true);
    try {
      let fileToSave = file;
      try {
        const imageCompression = (await import('browser-image-compression')).default;
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedBlob = await imageCompression(file, options);
        fileToSave = new File([compressedBlob], file.name, {
          type: compressedBlob.type,
          lastModified: Date.now(),
        });
      } catch (compErr) {
        console.warn('Falha na compressão da imagem, utilizando arquivo original:', compErr);
      }

      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setSelectedImageFile(fileToSave);
      setImagePreviewUrl(URL.createObjectURL(fileToSave));
    } catch {
      setErrorMessage('Erro ao processar a imagem selecionada.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveSelectedImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setSelectedImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveExistingImage = async () => {
    if (!noticeToEdit) return;
    setErrorMessage(null);
    try {
      await removeImageMutation.mutateAsync(noticeToEdit.id);
      setExistingImageUrl(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.code === 'CONTENT_POLICY_VIOLATION' && err.message
            ? err.message
            : getErrorMessage(err.code, err.message)
        );
      } else {
        setErrorMessage('Não foi possível remover a imagem atual do aviso.');
      }
    }
  };

  const onSubmit = async (data: NoticeFormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (noticeToEdit) {
        // 1. Atualiza dados textuais e links
        await updateMutation.mutateAsync({ id: noticeToEdit.id, data });

        // 2. Se houver nova imagem selecionada, faz o upload
        if (selectedImageFile) {
          await uploadImageMutation.mutateAsync({
            id: noticeToEdit.id,
            file: selectedImageFile,
          });
        }
      } else {
        // 1. Cria o aviso
        const createdNotice = await createMutation.mutateAsync(data);

        // 2. Se houver imagem selecionada, envia logo em seguida
        if (selectedImageFile) {
          await uploadImageMutation.mutateAsync({
            id: createdNotice.id,
            file: selectedImageFile,
          });
        }
      }

      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
      reset();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(
          err.code === 'CONTENT_POLICY_VIOLATION' && err.message
            ? err.message
            : getErrorMessage(err.code, err.message)
        );
      } else {
        setErrorMessage('Ocorreu um erro ao salvar o comunicado. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {noticeToEdit ? 'Editar Aviso Geral' : 'Novo Aviso Geral'}
              </h2>
              <p className="text-xs text-slate-500">
                Comunicado oficial visível para todos os alunos no Mural.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95"
            aria-label="Fechar formulário"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Banner de Feedback / Moderação */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Remetente e Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Remetente Oficial
              </label>
              <select
                {...register('remetente')}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="">Selecione...</option>
                <option value="Diretoria ETEC">Diretoria ETEC</option>
                <option value="Coordenação">Coordenação</option>
                <option value="Administração da Plataforma">Administração da Plataforma</option>
              </select>
              {errors.remetente && (
                <span className="text-xs font-bold text-red-500">{errors.remetente.message}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Badge de Destaque
              </label>
              <select
                {...register('badgeDestaque')}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="">Selecione...</option>
                <option value="Urgente">Urgente (Vermelho)</option>
                <option value="Informativo">Informativo (Azul)</option>
                <option value="Evento">Evento (Verde)</option>
              </select>
              {errors.badgeDestaque && (
                <span className="text-xs font-bold text-red-500">{errors.badgeDestaque.message}</span>
              )}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Título do Comunicado
            </label>
            <input
              type="text"
              {...register('titulo')}
              placeholder="Ex: Semana Acadêmica de Tecnologia e Inovação"
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-slate-800 dark:text-slate-200"
            />
            {errors.titulo && (
              <span className="text-xs font-bold text-red-500">{errors.titulo.message}</span>
            )}
          </div>

          {/* Mensagem */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Conteúdo / Mensagem
            </label>
            <textarea
              {...register('mensagem')}
              placeholder="Digite todos os detalhes e orientações do aviso..."
              rows={4}
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none font-medium text-slate-800 dark:text-slate-200"
            ></textarea>
            {errors.mensagem && (
              <span className="text-xs font-bold text-red-500">{errors.mensagem.message}</span>
            )}
          </div>

          {/* Seção de Imagem de Destaque (Cartaz / Banner) */}
          <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Imagem de Destaque (Cartaz / Banner)
              </label>
              <span className="text-xs text-slate-400 font-medium">Máximo: 5 MB</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Imagem Já Existente (no modo de edição) */}
            {existingImageUrl && !imagePreviewUrl && (
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Cartaz cadastrado atualmente
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Substitua enviando uma nova imagem ou remova abaixo.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-xs"
                    >
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveExistingImage}
                      disabled={removeImageMutation.isPending}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-200/60 dark:border-rose-900"
                      title="Excluir imagem atual"
                      aria-label="Excluir imagem atual"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-2 flex items-center justify-center">
                  <img
                    src={existingImageUrl}
                    alt="Cartaz atual"
                    className="max-h-48 w-auto mx-auto object-contain rounded-lg shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* Preview da Nova Imagem Selecionada */}
            {imagePreviewUrl && selectedImageFile && (
              <div className="p-3.5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {selectedImageFile.name}
                    </p>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {(selectedImageFile.size / 1024).toFixed(0)} KB • Pronta para envio
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveSelectedImage}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors bg-white border border-rose-200/60 shadow-xs"
                      title="Remover seleção"
                      aria-label="Remover seleção"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950/60 border border-primary/20 p-2 flex items-center justify-center">
                  <img
                    src={imagePreviewUrl}
                    alt="Nova imagem"
                    className="max-h-48 w-auto mx-auto object-contain rounded-lg shadow-xs"
                  />
                </div>
              </div>
            )}

            {/* Área de Seleção de Imagem (quando não há imagem selecionada ou existente) */}
            {!existingImageUrl && !imagePreviewUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all bg-slate-50/50 dark:bg-slate-900/30 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/30 transition-all shadow-sm mb-2">
                  {isCompressing ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isCompressing ? 'Otimizando imagem...' : 'Clique para selecionar um cartaz ou banner'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Formatos aceitos: JPG, PNG ou WEBP (até 5 MB)
                </p>
              </button>
            )}
          </div>

          {/* Seção de Links Institucionais (Até 2 links) */}
          <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                Links Institucionais e Documentos (Até 2)
              </label>
              <button
                type="button"
                onClick={() => appendLink({ titulo: '', url: '' })}
                disabled={linkFields.length >= 2}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Link
              </button>
            </div>

            {linkFields.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 font-medium">
                Nenhum link adicionado. Você pode incluir até 2 links externos (ex: formulários, editais ou cronogramas).
              </div>
            ) : (
              <div className="space-y-3">
                {linkFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Link #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Remover link"
                        aria-label="Remover link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <input
                          type="text"
                          {...register(`links.${index}.titulo`)}
                          placeholder="Título (ex: Edital Oficial)"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                        />
                        {errors.links?.[index]?.titulo && (
                          <span className="text-[11px] font-bold text-red-500 block">
                            {errors.links[index]?.titulo?.message}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <input
                          type="url"
                          {...register(`links.${index}.url`)}
                          placeholder="URL (https://...)"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium"
                        />
                        {errors.links?.[index]?.url && (
                          <span className="text-[11px] font-bold text-red-500 block">
                            {errors.links[index]?.url?.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé com Ações */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isCompressing}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-w-[140px] text-sm shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : isCompressing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Otimizando...</span>
                </>
              ) : (
                'Salvar Aviso'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
