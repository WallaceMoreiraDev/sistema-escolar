import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Maximize2,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { EventAttachmentDTO } from '@shared/types';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { eventApi } from '../api/eventApi';
import { formatFileSize } from '../utils/attachmentUtils';
import { ImageLightboxModal } from '@/components/ui/ImageLightboxModal';

interface AttachmentImagePreviewProps {
  eventId: string;
  anexo: EventAttachmentDTO;
  canDelete?: boolean;
  onDelete?: () => void;
}

export function AttachmentImagePreview({
  eventId,
  anexo,
  canDelete = false,
  onDelete,
}: AttachmentImagePreviewProps) {
  const { session } = useAuth();
  const token = session?.access_token;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const {
    data: downloadUrl,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['attachment-signed-url', eventId, anexo.id],
    queryFn: async () => {
      if (!token) throw new Error('Não autenticado');
      const res = await eventApi.getAttachmentDownloadUrl(token, eventId, anexo.id);
      return res.data?.downloadUrl || null;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 50, // 50 minutos de cache para URL assinada
  });

  return (
    <>
      <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden transition-colors w-full">
        {/* Barra superior de informações e ações */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/70 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-slate-900 dark:text-white truncate" title={anexo.nomeArquivo}>
                {anexo.nomeArquivo}
              </p>
              <span className="text-slate-400 text-[11px] block">
                {formatFileSize(anexo.tamanhoBytes)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {downloadUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-primary/10 hover:bg-primary/20 text-primary rounded-lg flex items-center gap-1.5 transition-colors"
                title="Visualizar imagem em tela cheia"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Tela Cheia</span>
              </button>
            )}

            {canDelete && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="Excluir imagem"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Área de Preview da Imagem */}
        <div className="p-3 bg-slate-50/40 dark:bg-slate-900/40 flex items-center justify-center min-h-[160px] w-full">
          {isLoading ? (
            <div className="h-44 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs font-semibold">Carregando visualização da imagem...</span>
            </div>
          ) : isError || !downloadUrl ? (
            <div className="p-4 text-center text-amber-600 dark:text-amber-400 text-xs flex flex-col items-center gap-1">
              <AlertCircle className="w-5 h-5 mb-1" />
              <span>Não foi possível carregar a prévia da imagem.</span>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar arquivo
                </a>
              )}
            </div>
          ) : (
            <div
              className="relative group w-full flex items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-900/5 dark:bg-black/20 p-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              title="Clique para ampliar em tela cheia"
            >
              <img
                src={downloadUrl}
                alt={anexo.nomeArquivo}
                className="max-h-64 max-w-full w-auto object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.01]"
                loading="lazy"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-md"
                title="Abrir em tela cheia"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Tela Cheia</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal de Tela Cheia */}
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageUrl={downloadUrl || null}
        fileName={anexo.nomeArquivo}
      />
    </>
  );
}
