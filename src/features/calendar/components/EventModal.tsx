import { useNavigate, useParams } from 'react-router-dom'

// Mock de dados para simular o fetch do evento específico
const MOCK_EVENTS = [
  { id: 1, type: 'PROVAS', label: 'PROVA', title: 'Física Moderna', dateStr: 'Hoje • 08h00', description: 'Estudar capítulos 4 e 5. Foco em volume.', subject: 'Física', colorClass: 'text-rose-600', bgClass: 'bg-rose-500/10', borderClass: 'border-l-rose-500' },
  { id: 2, type: 'TRABALHOS', label: 'TRABALHO', title: 'Era Vargas (Entrega PDF)', dateStr: 'Daqui 2 dias • 23h59', description: 'Enviar pelo Teams. Máx 10 páginas.', subject: 'História', colorClass: 'text-blue-600', bgClass: 'bg-blue-500/10', borderClass: 'border-l-blue-500' },
  { id: 3, type: 'TAREFAS', label: 'TAREFA', title: 'Exercícios Pág. 45', dateStr: 'Daqui 3 dias • 07h00', description: 'Resolver ímpares. Visto no início da aula.', subject: 'Física', colorClass: 'text-amber-600', bgClass: 'bg-amber-500/10', borderClass: 'border-l-amber-500' },
  // Simulando eventos criados pelo mês
  { id: 10, type: 'PROVAS', label: 'PROVA', title: 'Física Moderna', dateStr: 'Terça, 10 Set • 08h00', description: 'Conteúdo de física moderna completo.', subject: 'Física', colorClass: 'text-rose-600', bgClass: 'bg-rose-500/10', borderClass: 'border-l-rose-500' },
  { id: 11, type: 'TRABALHOS', label: 'TRABALHO', title: 'Química Orgânica', dateStr: 'Domingo, 15 Set • 23h59', description: 'Relatório.', subject: 'Química', colorClass: 'text-blue-600', bgClass: 'bg-blue-500/10', borderClass: 'border-l-blue-500' },
  { id: 12, type: 'TAREFAS', label: 'TAREFA', title: 'Exercícios Pág. 45', dateStr: 'Segunda, 26 Set • 14h00', description: 'Fixação de matéria.', subject: 'Física', colorClass: 'text-amber-600', bgClass: 'bg-amber-500/10', borderClass: 'border-l-amber-500' },
]

export function EventModal() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  // Encontra o evento baseado no deep link
  const event = MOCK_EVENTS.find(e => e.id === Number(id))
  
  const onClose = () => {
    // Retorna para o dashboard da turma (CalendarPage) desmontando o modal
    navigate('/app/calendario')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700/30"
        onClick={e => e.stopPropagation()} // Previne fechar ao clicar dentro do modal
      >
        {event ? (
          <>
            {/* Cabeçalho do Modal */}
            <div className={`p-6 border-b border-slate-200/50 dark:border-slate-800/50 ${event.bgClass}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`inline-flex px-3 py-1 rounded-xl text-xs font-bold tracking-widest bg-white/80 dark:bg-slate-900/80 shadow-sm ${event.colorClass}`}>
                  {event.label}
                </div>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all bg-white/40 dark:bg-slate-800/40 rounded-full hover:bg-white dark:hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-sm cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">{event.title}</h2>
              <p className="text-sm font-bold mt-3 text-slate-700 dark:text-slate-300 flex items-center gap-2 bg-white/30 dark:bg-slate-900/30 w-fit px-3 py-1.5 rounded-lg shadow-sm">
                <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {event.subject}
              </p>
            </div>
            
            {/* Corpo do Modal */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Data Limite / Realização
                </h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm inline-block">
                  {event.dateStr}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                  Descrição Detalhada
                </h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  {event.description}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  Anexos e Arquivos
                </h4>
                <div className="flex items-center gap-4 p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all cursor-pointer group bg-white/50 dark:bg-slate-800/50">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">material_de_apoio.pdf</span>
                    <span className="text-xs font-medium text-slate-500 mt-0.5">Documento PDF • 2.4 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* TRATAMENTO DE ERRO: 404 Empty State (De acordo com as regras de Deep Linking) */
          <div className="p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 h-[400px]">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-sm border border-rose-100 dark:border-rose-900/50">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Evento Não Encontrado</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-10 leading-relaxed font-medium">
              Este evento foi deletado ou está indisponível para a sua turma no momento.
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
  )
}
