import { Link } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Lock, 
  FileText, 
  Mail, 
  Trash2, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos visuais de fundo (Glows sutis) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Navegação Superior */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
            Lei nº 13.709/2018 (LGPD)
          </span>
        </div>

        {/* Card Principal */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-xl space-y-8 sm:space-y-10">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-slate-200/60 dark:border-slate-800/60 text-center sm:text-left">
            <img
              src="/pwa-192x192.png"
              alt="Prumo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-md object-contain bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 p-1 shrink-0"
            />
            <div className="space-y-1 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <Shield className="w-3.5 h-3.5" />
                Segurança & Privacidade
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight break-words">
                Política de Privacidade e Proteção de Dados (LGPD)
              </h1>
              <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 font-medium">
                Prumo - Plataforma Escolar • Diretrizes oficiais de transparência e tratamento de dados
              </p>
            </div>
          </div>

          {/* Introdução */}
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              A <strong>Prumo - Plataforma Escolar</strong> foi idealizada e desenvolvida com compromisso absoluto
              para com a privacidade, transparência e segurança de todos os estudantes, líderes e administradores escolares.
              Esta Política formaliza o tratamento ético de dados conforme as disposições da <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD)</strong>.
            </p>
          </div>

          {/* Seções Estruturadas */}
          <div className="space-y-6 sm:space-y-8">
            {/* Seção 1 */}
            <div className="space-y-3 p-4 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  1. Controlador e Encarregado dos Dados (DPO)
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-0 sm:pl-12 space-y-2">
                <p>
                  A plataforma <strong>Prumo</strong> atua como controladora dos dados estritamente no âmbito do fornecimento das funcionalidades escolares do aplicativo.
                </p>
                <p>
                  Para quaisquer esclarecimentos, exercício dos direitos dos titulares ou solicitações relativas à privacidade, o Encarregado pelo Tratamento de Dados Pessoais (DPO) pode ser contatado diretamente pelo e-mail oficial:
                </p>
                <div className="pt-2 w-full">
                  <a
                    href="mailto:wallace.msilva0805@gmail.com"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-primary font-semibold text-xs sm:text-sm hover:underline shadow-sm max-w-full"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">wallace.msilva0805@gmail.com</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-auto sm:ml-1 shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            {/* Seção 2 */}
            <div className="space-y-3 p-4 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  2. Bases Legais (Art. 7º e 14 da LGPD)
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-0 sm:pl-12 space-y-2">
                <p>
                  O tratamento de dados pessoais no Prumo é respaldado exclusivamente pelas seguintes hipóteses legais da LGPD:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1 sm:pl-2 font-medium">
                  <li>
                    <strong>Execução de finalidade pedagógica e organizacional:</strong> Para viabilizar a rotina acadêmica, gestão de entregas de trabalhos, mural de avisos e calendário de avaliações.
                  </li>
                  <li>
                    <strong>Consentimento inequívoco do titular:</strong> Fornecido no momento do primeiro acesso via autenticação segura com a conta Google.
                  </li>
                  <li>
                    <strong>Melhor interesse do estudante (Art. 14 da LGPD):</strong> Todo e qualquer dado coletado é tratado com foco exclusivo no suporte às atividades acadêmicas do próprio discente.
                  </li>
                </ul>
              </div>
            </div>

            {/* Seção 3 */}
            <div className="space-y-3 p-4 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  3. Minimização e Coleta Estrita de Dados
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-0 sm:pl-12 space-y-3">
                <p>
                  Seguindo com rigor o princípio da <em>minimização</em> estabelecido no Art. 6º, III da LGPD, a plataforma coleta apenas o estritamente necessário para sua operação:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Dados Coletados
                    </span>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <li>• Nome completo (fornecido pelo Google OAuth)</li>
                      <li>• E-mail institucional/pessoal (Google)</li>
                      <li>• Identificador de turma e papel (Aluno/Líder)</li>
                      <li>• Registros de avisos e eventos criados</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
                    <span className="font-bold text-rose-500 block mb-1 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 shrink-0" /> O que NÃO Coletamos
                    </span>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <li>• NUNCA coletamos CPF ou RG</li>
                      <li>• NUNCA coletamos dados biométricos ou fotos</li>
                      <li>• NUNCA coletamos dados de cartões ou pagamentos</li>
                      <li>• NUNCA rastreamos localização em tempo real (GPS)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 4 */}
            <div className="space-y-3 p-4 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  4. Finalidade e Não Compartilhamento
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-0 sm:pl-12 space-y-2">
                <p>
                  Os dados são processados com o objetivo exclusivo de identificar o aluno perante seus colegas de turma, exibir avisos pedagógicos no mural coletivo e sincronizar o calendário de provas e trabalhos.
                </p>
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 font-medium text-xs sm:text-sm leading-relaxed">
                  <strong>Compromisso Inegociável:</strong> Os dados dos usuários <strong>JAMAIS</strong> são vendidos, alugados, cedidos ou compartilhados com quaisquer terceiros, agências de publicidade, corretores de dados ou parceiros comerciais. A plataforma não exibe anúncios publicitários direcionados nem realiza criação de perfil comportamental para fins comerciais.
                </div>
              </div>
            </div>

            {/* Seção 5 */}
            <div className="space-y-3 p-4 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  5. Armazenamento Seguro e Auto-Expurgo de Arquivos
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-0 sm:pl-12 space-y-2">
                <p>
                  Os dados residem em infraestrutura de banco de dados protegida com criptografia em trânsito (TLS/HTTPS) e em repouso, com regras estritas de segurança em nível de linha (Row Level Security - RLS).
                </p>
                <p>
                  Para preservar a privacidade e otimizar recursos, a plataforma adota a seguinte política de retenção:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1 sm:pl-2">
                  <li>
                    <strong>Retenção Restrita ao Período Letivo:</strong> Informações de turmas e eventos permanecem ativas durante a vigência do ano ou semestre acadêmico.
                  </li>
                  <li>
                    <strong>Auto-Expurgo de Anexos Físicos:</strong> Anexos e arquivos submetidos para auxílio em atividades possuem <strong>política de expurgo automático permanente após 7 dias</strong> contados do prazo final de entrega da respectiva atividade.
                  </li>
                </ul>
              </div>
            </div>

            {/* Seção 6 */}
            <div className="space-y-3 p-4 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  6. Direitos do Titular (Art. 18 da LGPD)
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-0 sm:pl-12 space-y-2">
                <p>
                  Em conformidade com a LGPD, o titular de dados ou seu responsável legal tem garantido a qualquer momento:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1 sm:pl-2 font-medium">
                  <li>Confirmação da existência de tratamento e acesso aos dados pessoais armazenados;</li>
                  <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                  <li>Eliminação dos dados pessoais tratados mediante consentimento (exclusão definitiva de conta);</li>
                  <li>Revogação do consentimento a qualquer instante, sem prejuízo da legalidade do tratamento anterior.</li>
                </ul>
                <p className="pt-2 leading-relaxed">
                  Para exercer qualquer desses direitos, basta enviar uma mensagem ao Encarregado pelo e-mail{' '}
                  <a href="mailto:wallace.msilva0805@gmail.com" className="text-primary font-bold underline break-all">
                    wallace.msilva0805@gmail.com
                  </a>
                  . A solicitação será processada com prioridade em conformidade com os prazos legais.
                </p>
              </div>
            </div>
          </div>

          {/* Rodapé Interno do Card */}
          <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span>Última atualização: Outubro de 2026</span>
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-bold text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Retornar à plataforma Prumo
            </Link>
          </div>
        </div>

        {/* Rodapé da Página */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-4">
          Prumo - Plataforma Escolar • Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
