import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { ClassSidebar } from './components/ClassSidebar'
import { useClassEvents } from '../class-admin/hooks/useClassEvents'

const FILTERS = ['TUDO', 'PROVAS', 'TRABALHOS', 'TAREFAS', 'LEMBRETES']
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export function CalendarPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'SUMMARY' | 'MONTH_GRID'>('SUMMARY')
  const [activeFilter, setActiveFilter] = useState('TUDO')
  const [mobilePage, setMobilePage] = useState(1)
  
  // Estado para o Tooltip flutuante do desktop
  const [hoveredEvent, setHoveredEvent] = useState<any | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  
  const { data: response, isLoading } = useClassEvents(1, 100);
  const realEvents = response?.data || [];

  const getCalendarEventStyles = (category: string) => {
    if (category === 'Prova') return { type: 'PROVAS', label: 'PROVA', colorClass: 'text-rose-600', bgClass: 'bg-rose-500/10', dotClass: 'bg-rose-500', borderClass: 'border-l-rose-500' };
    if (category === 'Trabalho') return { type: 'TRABALHOS', label: 'TRABALHO', colorClass: 'text-blue-600', bgClass: 'bg-blue-500/10', dotClass: 'bg-blue-500', borderClass: 'border-l-blue-500' };
    if (category === 'Lembrete') return { type: 'LEMBRETES', label: 'LEMBRETE', colorClass: 'text-purple-600', bgClass: 'bg-purple-500/10', dotClass: 'bg-purple-500', borderClass: 'border-l-purple-500' };
    return { type: 'TAREFAS', label: 'TAREFA', colorClass: 'text-amber-600', bgClass: 'bg-amber-500/10', dotClass: 'bg-amber-500', borderClass: 'border-l-amber-500' };
  };

  // Estado real do calendário focado no hoje
  const today = new Date()
  const [selectedMobileDay, setSelectedMobileDay] = useState<number | null>(today.getDate())
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const handleMobileDaySelect = (day: number) => {
    setSelectedMobileDay(day);
    setMobilePage(1);
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Navegação
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  
  // GERAÇÃO DO RESUMO (Próximos 5 Dias a partir de Hoje)
  const summaryDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    // Filtra eventos reais que caem exatamente neste dia
    const dayEvents = realEvents.filter(ev => ev.dueDate.startsWith(dateStr)).map(ev => ({
      id: ev.id,
      title: ev.subject,
      description: ev.description || 'Sem descrição.',
      ...getCalendarEventStyles(ev.category)
    }));

    return {
      date: d.toISOString(),
      dayStr: d.getDate().toString().padStart(2, '0'),
      weekday: weekdays[d.getDay()],
      isToday: i === 0,
      events: dayEvents
    }
  });

  // Geração do grid do mês atual
  const firstDayOfWeek = new Date(year, month, 1).getDay() // 0 a 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const MONTH_DAYS_DYNAMIC = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfWeek + 1
    if (day < 1 || day > daysInMonth) return null
    
    const currentMonthStr = (month + 1).toString().padStart(2, '0');
    const currentDayStr = day.toString().padStart(2, '0');
    const dateStr = `${year}-${currentMonthStr}-${currentDayStr}`;

    const dayEvents = realEvents.filter(ev => ev.dueDate.startsWith(dateStr)).map(ev => ({
      id: ev.id,
      title: ev.subject,
      description: ev.description || 'Sem descrição.',
      ...getCalendarEventStyles(ev.category)
    }));

    const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
    return { day, events: dayEvents, isToday }
  })

  // Remove semanas vazias do final do array
  const weeksNeeded = Math.ceil((firstDayOfWeek + daysInMonth) / 7)
  const renderedDays = MONTH_DAYS_DYNAMIC.slice(0, weeksNeeded * 7)

  return (
    <>
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Cabeçalho Fixo */}
        <header className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Minha Turma</h1>
        
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            3º Ano - Desenvolvimento de Sistemas
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Sala 14 - Bloco B
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Manhã
          </div>
        </div>
      </header>

      {/* VIEW 1: RESUMO (Calendário 5 Colunas) */}
      {viewMode === 'SUMMARY' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Próximos 5 Dias</h2>
            <button 
              onClick={() => setViewMode('MONTH_GRID')}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-5 py-2.5 rounded-xl shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Ver Mês Completo
            </button>
          </div>
          
          {/* VISÃO DESKTOP: Grid 5 Colunas */}
          <div className="hidden md:grid grid-cols-5 gap-6">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={`sk-desk-${i}`} className="flex flex-col gap-4 animate-pulse">
                  <div className="text-center pb-3 border-b-2 border-slate-200 dark:border-slate-800">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto mb-2"></div>
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-12 mx-auto"></div>
                  </div>
                  <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>
              ))
            ) : summaryDays.map(day => (
              <div key={day.date} className="flex flex-col gap-4">
                <div className={`text-center pb-3 border-b-2 transition-colors ${day.isToday ? 'border-primary' : 'border-slate-200 dark:border-slate-800'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${day.isToday ? 'text-primary' : 'text-slate-500'}`}>{day.weekday}</p>
                  <p className={`text-3xl font-black mt-1 ${day.isToday ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{day.dayStr}</p>
                </div>
                
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {day.events.length > 0 ? (
                    day.events.map(event => (
                      <div 
                        key={event.id} 
                        onClick={(e) => { e.stopPropagation(); navigate(`evento/${event.id}`) }}
                        className={`p-4 rounded-2xl border-l-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm glass-card ${event.borderClass} ${event.bgClass}`}
                      >
                        <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider mb-3 ${event.colorClass} bg-white/50 dark:bg-slate-900/50 shadow-sm`}>
                          {event.label}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2">{event.title}</p>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">{event.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="h-24 rounded-2xl border-2 border-dashed border-slate-200/70 dark:border-slate-800/70 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50">
                      Livre
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* VISÃO MOBILE: Linha do Tempo Focada (Pula dias vazios) */}
          <div className="flex flex-col md:hidden gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`sk-mob-${i}`} className="flex flex-col gap-3 animate-pulse">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
                  <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>
              ))
            ) : (
              <>
                {summaryDays.filter(day => day.events.length > 0).map(day => (
                  <div key={`mob-${day.date}`} className="flex flex-col gap-3">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${day.isToday ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>
                      {day.isToday && <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>}
                      {day.weekday}, {day.dayStr}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {day.events.map(event => (
                        <div 
                          key={event.id} 
                          onClick={(e) => { e.stopPropagation(); navigate(`evento/${event.id}`) }}
                          className={`glass-card p-5 rounded-2xl border-l-4 cursor-pointer shadow-sm active:scale-[0.98] transition-transform ${event.borderClass} ${event.bgClass}`}
                        >
                          <div className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider mb-2 ${event.colorClass} bg-white/60 dark:bg-slate-900/60`}>
                            {event.label}
                          </div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{event.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {summaryDays.every(d => d.events.length === 0) && (
                  <div className="p-8 text-center text-slate-500 glass-card rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 font-medium">
                    Nenhum evento para os próximos 5 dias.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: GRADE MENSAL */}
      {viewMode === 'MONTH_GRID' && (
        <div className="animate-in fade-in duration-500">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <button 
              onClick={() => setViewMode('SUMMARY')}
              className="flex w-fit items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Voltar para Resumo
            </button>

            {/* Controle de Mês Funcional */}
            <div className="flex items-center gap-2 sm:gap-4 self-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              <div className="relative">
                <div className="px-4 py-2 text-base sm:text-lg font-black text-slate-800 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2">
                  {MONTH_NAMES[month]} {year}
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                {/* Select Nativo Invisível (Funciona 100% das vezes em qualquer navegador) */}
                <select 
                  value={`${year}-${month}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split('-');
                    setCurrentDate(new Date(parseInt(y), parseInt(m), 1));
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  {/* Gerando opções de 2024 até 2028 */}
                  {Array.from({ length: 5 * 12 }, (_, i) => {
                    const optYear = 2024 + Math.floor(i / 12);
                    const optMonth = i % 12;
                    return (
                      <option key={`${optYear}-${optMonth}`} value={`${optYear}-${optMonth}`}>
                        {MONTH_NAMES[optMonth]} {optYear}
                      </option>
                    )
                  })}
                </select>
              </div>

              <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 pb-4 hide-scrollbar">
            {FILTERS.map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeFilter === f 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f === 'TUDO' ? 'Todos os Eventos' : f}
              </button>
            ))}
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden mt-2">
            <div className="grid grid-cols-7 bg-slate-100/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-center py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800">
              {renderedDays.map((dayObj, index) => {
                if (!dayObj) return <div key={`empty-${index}`} className="bg-white/60 dark:bg-slate-900/60 p-2 md:p-3 min-h-[80px] md:min-h-[160px]"></div>;
                
                const filteredEvents = dayObj.events.filter(e => activeFilter === 'TUDO' || e.type === activeFilter);
                const isSelectedOnMobile = selectedMobileDay === dayObj.day;

                return (
                  <div 
                    key={dayObj.day} 
                    onClick={() => handleMobileDaySelect(dayObj.day)}
                    className={`bg-white dark:bg-slate-900 p-1.5 md:p-3 min-h-[80px] md:min-h-[160px] transition-colors cursor-pointer md:cursor-default relative flex flex-col gap-2 overflow-hidden
                      ${dayObj.isToday ? 'bg-primary/5 dark:bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                      ${isSelectedOnMobile ? 'ring-2 ring-inset ring-primary md:ring-0' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-bold flex items-center justify-center w-7 h-7 rounded-full ${dayObj.isToday ? 'bg-primary text-white shadow-sm' : 'text-slate-700 dark:text-slate-300'}`}>
                        {dayObj.day}
                      </span>
                    </div>
                    
                    {/* VISÃO DESKTOP: limitador de altura com scroll customizado para quando houver muitos eventos */}
                    <div className="hidden md:flex flex-col gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                      {filteredEvents.map(event => (
                        <div 
                          key={event.id} 
                          onClick={(e) => { e.stopPropagation(); navigate(`evento/${event.id}`) }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                            setHoveredEvent(event);
                          }}
                          onMouseLeave={() => setHoveredEvent(null)}
                          className={`text-xs font-bold px-2.5 py-2 rounded-xl border-l-[3px] ${event.colorClass} ${event.bgClass} ${event.borderClass} cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all leading-tight line-clamp-3 shrink-0`}
                        >
                          <span className="opacity-75 mr-1 font-extrabold text-[10px]">[{event.label.slice(0,3)}]</span>
                          {event.title}
                        </div>
                      ))}
                    </div>

                    <div className="flex md:hidden flex-wrap justify-center gap-1.5 mt-auto pb-1">
                      {filteredEvents.map(event => (
                        <div key={event.id} className={`w-2 h-2 rounded-full ${event.dotClass}`}></div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="md:hidden mt-8 mb-10">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Eventos do dia {selectedMobileDay}
            </h3>
            <div className="flex flex-col gap-3">
              {(() => {
                const dayObj = renderedDays.find(d => d && d.day === selectedMobileDay);
                const dayEvents = dayObj ? dayObj.events.filter(e => activeFilter === 'TUDO' || e.type === activeFilter) : [];
                const limit = 4;
                const totalPages = Math.ceil(dayEvents.length / limit);
                const paginatedEvents = dayEvents.slice((mobilePage - 1) * limit, mobilePage * limit);

                if (dayEvents.length === 0) {
                  return (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500 font-medium bg-slate-50/50 dark:bg-slate-900/50">
                      Nenhum evento programado para este dia.
                    </div>
                  );
                }

                return (
                  <>
                    {paginatedEvents.map(event => (
                      <div 
                        key={event.id} 
                        onClick={(e) => { e.stopPropagation(); navigate(`evento/${event.id}`) }}
                        className={`glass-card p-4 rounded-2xl border-l-4 cursor-pointer active:scale-[0.98] transition-transform ${event.borderClass} ${event.bgClass}`}
                      >
                        <div className={`text-xs font-bold mb-2 ${event.colorClass}`}>{event.label}</div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{event.title}</p>
                      </div>
                    ))}
                    
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center p-3 mt-2 border-t border-slate-200 dark:border-slate-800/50">
                        <button 
                          onClick={() => setMobilePage(p => Math.max(1, p - 1))}
                          disabled={mobilePage === 1}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors"
                        >
                          &larr; Anterior
                        </button>
                        <span className="text-xs font-bold text-slate-500">
                          Página <span className="text-slate-900 dark:text-white">{mobilePage}</span> de {totalPages}
                        </span>
                        <button 
                          onClick={() => setMobilePage(p => Math.min(totalPages, p + 1))}
                          disabled={mobilePage === totalPages}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors"
                        >
                          Próxima &rarr;
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

        </div>
      )}

        <div className="mt-12">
          <ClassSidebar />
        </div>
      </div>

      {/* TOOLTIP FLUTUANTE GLOBAL (Evita problemas de overflow e clipping) */}
      {hoveredEvent && (
        <div 
          className="fixed z-50 p-4 rounded-xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-700 w-64 pointer-events-none transition-opacity animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y - 8}px`,
            transform: 'translate(-50%, -100%)' // Centraliza no eixo X e joga totalmente pra cima do card
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${hoveredEvent.colorClass} bg-slate-100 dark:bg-slate-800`}>
              {hoveredEvent.label}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-tight">{hoveredEvent.title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed">{hoveredEvent.description}</p>
          
          {/* Triângulo do Tooltip */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[99%] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-slate-200 dark:border-t-slate-700"></div>
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[90%] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-white/80 dark:border-t-slate-900/80 backdrop-blur-md"></div>
        </div>
      )}

      {/* MODAL DE DETALHES DO EVENTO */}
      <Outlet />
    </>
  )
}
