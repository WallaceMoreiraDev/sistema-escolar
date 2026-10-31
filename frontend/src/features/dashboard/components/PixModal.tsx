import { createPortal } from 'react-dom';
import { useState } from 'react';
import { Lightbulb, X, Copy, Check } from 'lucide-react';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PixModal({ isOpen, onClose }: PixModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('26e27102-12bc-49dd-8eec-68229f88c129');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar chave PIX:', err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Overlay Escuro */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Container do Modal */}
      <div className="relative w-full max-w-md max-h-[88vh] flex flex-col bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="flex-none p-5 sm:p-6 pb-4 border-b border-slate-100 text-center relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors z-10"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Apoie o Projeto</h2>
        </div>

        {/* Corpo Rolável */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Propósito */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Destino do Valor</span>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              100% destinado ao registro e renovação anual do domínio oficial da plataforma Prumo (prumoescolar.com.br).
            </p>
          </div>

          {/* QR Code Oficial */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="p-2 bg-white rounded-xl shadow-inner border border-slate-100">
              <img 
                src="/pix-qr-code.png" 
                alt="QR Code PIX" 
                className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-lg"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-2.5 font-medium text-center">
              Aponte a câmera do seu banco para o QR Code
            </span>
          </div>

          {/* Dica de Identificação */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-left">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Dica de Identificação</span>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed font-medium">
              Para sabermos que o seu PIX é uma contribuição do Prumo, <strong>adicione R$ 0,11 (onze centavos)</strong> ao final do valor transferido. Por exemplo: transfira <strong>R$ 2,11</strong>, <strong>R$ 5,11</strong> ou <strong>R$ 10,11</strong>.
            </p>
          </div>

          {/* Dados do PIX */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Recebedor</label>
              <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm">
                Wallace Moreira da Silva
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Banco</label>
              <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs sm:text-sm">
                Nubank (Nu Pagamentos S.A.)
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Chave PIX (Aleatória)</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-semibold text-xs truncate">
                  26e27102-12bc-49dd-8eec-68229f88c129
                </div>
                <button 
                  type="button"
                  onClick={handleCopy}
                  className={`px-3.5 py-2.5 flex items-center gap-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shrink-0 ${
                    copied 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm' 
                      : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                  }`}
                  title="Copiar Chave PIX"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Chave</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="flex-none p-4 sm:p-5 border-t border-slate-100 flex justify-center bg-slate-50/50 rounded-b-2xl sm:rounded-b-3xl">
          <button 
            type="button"
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all active:scale-95 text-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
