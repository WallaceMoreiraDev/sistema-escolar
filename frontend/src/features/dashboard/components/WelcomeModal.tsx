import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Info, 
  LayoutDashboard, 
  Calendar, 
  Megaphone, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Mail,
  Heart
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Overlay Escuro com Blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Container do Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Cabeçalho Fixo */}
        <div className="flex-none p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary/5 via-transparent to-transparent relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                Seja bem-vindo(a) ao Prumo!
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Por Wallace Moreira da Silva • 1º DS Manhã (ETEC Dep. Ary de Camargo Pedroso)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Scroll Suave */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-700 text-sm leading-relaxed">
          
          {/* Origem da Plataforma */}
          <div className="space-y-3 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Como nasceu a ideia do Prumo
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Fala pessoal! Meu nome é Wallace Moreira da Silva, sou do 1º DS manhã da Etec Dep. Ary de Camargo Pedroso. Gostaria de dar as boas-vindas a vocês e explicar um pouco mais sobre o que o Prumo pode oferecer e como ele nasceu!
            </p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              A ideia do Prumo nasceu quando percebi que enfrentávamos problemas com organização escolar, pois usamos o WhatsApp para organizar tudo (avisos, tarefas, trabalhos, tudo...) e é muito ruim porque as mensagens vão subindo e é totalmente despadronizado. Tentamos até utilizar outras ferramentas como Excel ou Trello, porém não funcionou porque não eram adaptadas à rotina escolar. O Prumo busca organizar essa rotina com uma interface intuitiva e fluída.
            </p>
          </div>

          {/* Diferença com o NSA (Card de Destaque) */}
          <div className="p-4 sm:p-5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-3.5 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Aviso Importante: Relação com o NSA
              </h4>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-medium">
                Gostaria de deixar claro: <strong>o Prumo NÃO SUBSTITUI o NSA Escolar</strong>. O NSA ainda é a plataforma oficial da escola utilizada para registros fixos como grade horária, notas e contato oficial com professores.
              </p>
            </div>
          </div>

          {/* Funcionalidades da Plataforma (Grid de Cards) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              O que você encontra por aqui
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dashboard */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Resumo dos próximos 5 dias letivos, últimos avisos do mural geral e links úteis da sala.
                </p>
              </div>

              {/* Minha Turma */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Calendar className="w-4 h-4" />
                  <span>Minha Turma</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Calendário de tarefas colocado pelos representantes, listagem de membros da sala e links úteis completos.
                </p>
              </div>

              {/* Mural Geral */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Megaphone className="w-4 h-4" />
                  <span>Mural Geral</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Avisos gerais para todas as turmas, gerenciados pela administração (no momento, por mim).
                </p>
              </div>

              {/* Painel Turma */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Painel Turma (Representantes)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Onde os líderes gerenciam eventos, prazos, membros, código de convite e links úteis da turma.
                </p>
              </div>
            </div>
          </div>

          {/* Privacidade e LGPD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Privacidade & Compromisso LGPD
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sobre privacidade que é super importante: a plataforma não possui nenhum tipo de anúncio e não há planos a respeito disso. Também não vendemos dados de ninguém (fiquem tranquilos), respeitamos a LGPD e vocês podem conferir no rodapé do menu em &quot;Privacidade & LGPD&quot;.
              </p>
            </div>
          </div>

          {/* Dica de Instalação PWA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/20 flex items-start gap-3.5 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                Instale no seu Celular (PWA)
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                <strong>ÚLTIMA COISA:</strong> Não se esqueçam de transformar o Prumo em um app no celular de vocês! Cada aparelho tem uma forma, mas em geral: procure os três pontinhos (no Chrome) ou o ícone de compartilhar (no Safari/iPhone) e clique em <em>&quot;Adicionar à tela de início&quot;</em>. Ele virará um app direto na tela inicial, sem precisar abrir o navegador.
              </p>
            </div>
          </div>

          {/* Contato e Encerramento */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-primary">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Agradecimento & Contato
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              É isso, espero que gostem! Vocês podem entrar em contato comigo para sugerir novas ideias ou comunicar problemas pelo e-mail{' '}
              <a 
                href="mailto:wallace.msilva0805@gmail.com" 
                className="text-white font-bold underline hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                wallace.msilva0805@gmail.com
              </a>{' '}
              ou até mesmo pessoalmente no intervalo. Afinal, esta é uma versão inicial e ainda temos muito pela frente. Um ótimo final de ano letivo a todos vocês!
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs font-bold text-slate-400">
              Wallace Moreira da Silva — 1º DS Manhã
            </div>
          </div>

        </div>

        {/* Rodapé Fixo */}
        <div className="flex-none p-4 sm:p-5 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs sm:text-sm"
          >
            Vamos Começar!
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
