import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, Download, Share, PlusSquare, X, Monitor, PlusCircle } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAInstallPrompt() {
  const { isInstalled, isIOS, hasNativePrompt, installApp } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  // Se o aplicativo já estiver instalado no dispositivo, não exibe o prompt
  if (isInstalled) {
    return null;
  }

  const handleAction = () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (hasNativePrompt) {
      installApp();
    } else {
      setShowDesktopModal(true);
    }
  };

  return (
    <>
      <div className="w-full p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm flex flex-col gap-3 transition-all animate-in fade-in duration-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
              Instalar Prumo no Celular
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Acesse tarefas e avisos em tela cheia com 1 toque.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAction}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition-all text-xs active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Instalar Aplicativo</span>
        </button>
      </div>

      {/* Modal Explicativo para Usuários do iOS (Safari) */}
      {showIOSModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowIOSModal(false)}
          >
            <div
              className="glass-panel w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/30 p-6 flex flex-col relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                Instalar no iPhone / iPad
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Siga estes 2 passos simples no Safari para adicionar o Prumo à sua tela de início:
              </p>

              <div className="space-y-3.5 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Share className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    <strong className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      1. Toque em Compartilhar
                    </strong>
                    Na barra de navegação inferior do Safari, toque no ícone de compartilhamento.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    <strong className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      2. Adicionar à Tela de Início
                    </strong>
                    Role a lista de opções para baixo e toque em &quot;Adicionar à Tela de Início&quot;.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 text-center"
              >
                Entendi
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Modal Informativo para Navegadores Desktop sem Prompt Automático */}
      {showDesktopModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowDesktopModal(false)}
          >
            <div
              className="glass-panel w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/30 p-6 flex flex-col relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowDesktopModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Monitor className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                Instalar no Computador
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Para instalar o Prumo no seu computador como um aplicativo de área de trabalho:
              </p>

              <div className="space-y-3.5 mb-6">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    <strong className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      Ícone na Barra de Endereços
                    </strong>
                    Clique no ícone de instalação (<strong className="text-primary font-bold">+</strong> ou ícone de monitor) localizado no canto direito da barra de endereços do seu navegador.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDesktopModal(false)}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 text-center"
              >
                Entendi
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
