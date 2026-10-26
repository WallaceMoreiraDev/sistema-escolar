import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  fileName?: string;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  fileName,
}: ImageLightboxModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex flex-col justify-between bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Barra Superior */}
      <div
        className="flex items-center justify-between w-full max-w-7xl mx-auto z-10 py-2 px-1 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 overflow-hidden mr-4">
          <p
            className="font-bold text-sm sm:text-base text-slate-100 truncate"
            title={fileName || 'Imagem'}
          >
            {fileName || 'Visualização de Imagem'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {imageUrl && (
            <a
              href={imageUrl}
              download={fileName || 'imagem'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-1.5 transition-colors"
              title="Baixar imagem"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar</span>
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Área Central com a Imagem */}
      <div
        className="flex-1 flex items-center justify-center w-full min-h-0 py-3"
        onClick={onClose}
      >
        <img
          src={imageUrl}
          alt={fileName || 'Imagem'}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] max-w-[95vw] object-contain rounded-lg shadow-2xl transition-all"
        />
      </div>

      {/* Dica Inferior Sutil */}
      <div className="text-center pb-1 text-slate-400 text-[11px] sm:text-xs">
        Pressione <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-slate-300 font-mono text-[10px]">Esc</kbd> ou clique fora da imagem para fechar
      </div>
    </div>,
    document.body
  );
}
