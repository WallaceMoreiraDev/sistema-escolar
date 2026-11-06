import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  MapPin,
  Clock,
  KeyRound,
  PlusCircle,
  Filter,
  Users,
  ChevronDown,
  X,
  RotateCcw,
  Calendar,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { ClassSidebar } from './components/ClassSidebar';
import { useClassEvents } from '../class-admin/hooks/useClassEvents';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { JoinClassModal } from '@/features/dashboard/components/JoinClassModal';
import { CreateClassModal } from '@/features/dashboard/components/CreateClassModal';
import { EventCheckbox } from './components/EventCheckbox';
import { SubgrupoTurma, GrupoDestinatario } from '@shared/types';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

type FilterType = 'TUDO' | 'PROVAS' | 'TRABALHOS' | 'TAREFAS' | 'AVISOS';
type FilterStatus = 'ALL' | 'PENDING' | 'COMPLETED';

interface CalendarEventDisplay {
  id: string;
  title: string;
  description: string;
  concluida?: boolean;
  grupoDestinatario?: GrupoDestinatario;
  type: string;
  label: string;
  colorClass: string;
  bgClass: string;
  dotClass: string;
  borderClass: string;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const { user, updateSubgrupo, isLoading: isAuthLoading } = useAuth();
  const turma = user?.turma;

  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'SUMMARY' | 'MONTH_GRID'>('SUMMARY');
  const [typeFilter, setTypeFilter] = useState<FilterType>('TUDO');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

  // Estados dos Menus
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDivisionOpen, setIsDivisionOpen] = useState(false);
  const [isUpdatingSubgrupo, setIsUpdatingSubgrupo] = useState(false);

  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const divisionPopoverRef = useRef<HTMLDivElement>(null);

  const [mobilePage, setMobilePage] = useState(1);

  // Estado para o Tooltip flutuante do desktop
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEventDisplay | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Estado real do calendário focado no hoje
  const today = new Date();
  const [selectedMobileDay, setSelectedMobileDay] = useState<number | null>(today.getDate());
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fechar menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterPopoverRef.current &&
        !filterPopoverRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
      if (
        divisionPopoverRef.current &&
        !divisionPopoverRef.current.contains(event.target as Node)
      ) {
        setIsDivisionOpen(false);
      }
    }
    if (isFilterOpen || isDivisionOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen, isDivisionOpen]);

  // Atualização do subgrupo do aluno
  const handleSubgrupoChange = async (novoSubgrupo: SubgrupoTurma) => {
    try {
      setIsUpdatingSubgrupo(true);
      await updateSubgrupo(novoSubgrupo);
    } catch (err) {
      console.error('Falha ao atualizar divisão da turma:', err);
    } finally {
      setIsUpdatingSubgrupo(false);
    }
  };

  // Navegação de mês
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  // Inteligência Temporal e Consulta de Eventos (respeitando o limite de 45 dias)
  const summaryStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  ).toISOString();
  const summaryEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 10,
    23,
    59,
    59,
    999
  ).toISOString();

  const monthStart = new Date(year, month, 1, 0, 0, 0, 0).toISOString();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

  const queryStart = viewMode === 'SUMMARY' ? summaryStart : monthStart;
  const queryEnd = viewMode === 'SUMMARY' ? summaryEnd : monthEnd;

  const { data: response, isLoading } = useClassEvents(queryStart, queryEnd);
  const realEvents = response?.data || [];

  const getCalendarEventStyles = (category: string) => {
    if (category === 'Prova')
      return {
        type: 'PROVAS',
        label: 'PROVA',
        colorClass: 'text-rose-600',
        bgClass: 'bg-rose-500/10',
        dotClass: 'bg-rose-500',
        borderClass: 'border-l-rose-500',
      };
    if (category === 'Trabalho')
      return {
        type: 'TRABALHOS',
        label: 'TRABALHO',
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-500/10',
        dotClass: 'bg-blue-500',
        borderClass: 'border-l-blue-500',
      };
    if (category === 'Aviso')
      return {
        type: 'AVISOS',
        label: 'AVISO',
        colorClass: 'text-purple-600',
        bgClass: 'bg-purple-500/10',
        dotClass: 'bg-purple-500',
        borderClass: 'border-l-purple-500',
      };
    return {
      type: 'TAREFAS',
      label: 'TAREFA',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-500/10',
      dotClass: 'bg-amber-500',
      borderClass: 'border-l-amber-500',
    };
  };

  const getEventLocalDateStr = (dataHoraLimite: string) => {
    const d = new Date(dataHoraLimite);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleMobileDaySelect = (day: number) => {
    setSelectedMobileDay(day);
    setMobilePage(1);
  };

  // Regra de Visibilidade do Evento (Subgrupo + Filtro de Tipo + Filtro de Status)
  const isEventVisible = (ev: {
    categoria: string;
    concluida?: boolean;
    grupoDestinatario?: GrupoDestinatario;
  }) => {
    // 1. Filtro por subgrupo do aluno
    const alunoSubgrupo = user?.subgrupoTurma || 'GERAL';
    if (alunoSubgrupo === 'TURMA_A') {
      if (
        ev.grupoDestinatario &&
        ev.grupoDestinatario !== 'TODOS' &&
        ev.grupoDestinatario !== 'TURMA_A'
      ) {
        return false;
      }
    } else if (alunoSubgrupo === 'TURMA_B') {
      if (
        ev.grupoDestinatario &&
        ev.grupoDestinatario !== 'TODOS' &&
        ev.grupoDestinatario !== 'TURMA_B'
      ) {
        return false;
      }
    }

    // 2. Filtro por tipo de evento
    if (typeFilter !== 'TUDO') {
      const styles = getCalendarEventStyles(ev.categoria);
      if (styles.type !== typeFilter) return false;
    }

    // 3. Filtro por status de conclusão
    if (statusFilter === 'PENDING' && ev.concluida) return false;
    if (statusFilter === 'COMPLETED' && !ev.concluida) return false;

    return true;
  };

  // Contagem de filtros ativos para badge
  const activeFilterCount =
    (typeFilter !== 'TUDO' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0);

  // GERAÇÃO DO RESUMO (Próximos 5 Dias a partir de Hoje)
  const summaryDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const weekdays = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ];

    // Filtra eventos reais que caem exatamente neste dia e atendem aos critérios de visibilidade
    const dayEvents = realEvents
      .filter(
        (ev) => getEventLocalDateStr(ev.dataHoraLimite) === dateStr && isEventVisible(ev)
      )
      .map((ev) => ({
        id: ev.id,
        title: ev.materia,
        description: ev.descricao || '',
        concluida: ev.concluida,
        grupoDestinatario: ev.grupoDestinatario,
        ...getCalendarEventStyles(ev.categoria),
      }));

    return {
      date: d.toISOString(),
      dayStr: d.getDate().toString().padStart(2, '0'),
      weekday: weekdays[d.getDay()],
      isToday: i === 0,
      events: dayEvents,
    };
  });

  // Geração do grid do mês atual
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 a 6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const MONTH_DAYS_DYNAMIC = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfWeek + 1;
    if (day < 1 || day > daysInMonth) return null;

    const currentMonthStr = (month + 1).toString().padStart(2, '0');
    const currentDayStr = day.toString().padStart(2, '0');
    const dateStr = `${year}-${currentMonthStr}-${currentDayStr}`;

    const dayEvents = realEvents
      .filter(
        (ev) => getEventLocalDateStr(ev.dataHoraLimite) === dateStr && isEventVisible(ev)
      )
      .map((ev) => ({
        id: ev.id,
        title: ev.materia,
        description: ev.descricao || '',
        concluida: ev.concluida,
        grupoDestinatario: ev.grupoDestinatario,
        ...getCalendarEventStyles(ev.categoria),
      }));

    const isToday =
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate();
    return { day, events: dayEvents, isToday };
  });

  // Remove semanas vazias do final do array
  const weeksNeeded = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
  const renderedDays = MONTH_DAYS_DYNAMIC.slice(0, weeksNeeded * 7);

  // ==========================================
  // RENDERIZADOR: Modal de Filtros do Calendário
  // ==========================================
  const renderFilterContent = () => (
    <>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          Filtros do Calendário
        </span>
        <button
          type="button"
          onClick={() => setIsFilterOpen(false)}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Categoria / Tipo */}
      <div className="mb-4">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Tipo de Atividade
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'TUDO' as const, label: 'Todos os tipos' },
            { id: 'PROVAS' as const, label: 'Provas' },
            { id: 'TRABALHOS' as const, label: 'Trabalhos' },
            { id: 'TAREFAS' as const, label: 'Tarefas' },
            { id: 'AVISOS' as const, label: 'Avisos' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                typeFilter === t.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status de Conclusão */}
      <div className="mb-4">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Status da Atividade
        </label>
        <div className="flex flex-col gap-2">
          {[
            { id: 'ALL' as const, label: 'Todas as atividades' },
            { id: 'PENDING' as const, label: 'Apenas pendentes' },
            { id: 'COMPLETED' as const, label: 'Apenas concluídas' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatusFilter(s.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                statusFilter === s.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ações / Limpar / Concluir */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={() => {
              setTypeFilter('TUDO');
              setStatusFilter('ALL');
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors cursor-pointer py-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
        ) : (
          <span className="text-xs text-slate-400">Nenhum filtro ativo</span>
        )}

        <button
          type="button"
          onClick={() => setIsFilterOpen(false)}
          className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Concluir
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="w-full animate-in fade-in duration-500">
        {/* Cabeçalho da Turma com Dados Reais da Sessão */}
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Minha Turma
          </h1>

          {isAuthLoading ? (
            <div className="mt-3 flex items-center gap-4 animate-pulse">
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ) : turma ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                <GraduationCap className="w-4 h-4 text-primary" />
                {turma.ano ? `${turma.ano} ` : ''}
                {turma.curso || turma.nomeOficial}
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {turma.localSala || 'Sala não definida'}
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {turma.turno || 'Turno não definido'}
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Nenhuma turma vinculada.
              </p>
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/20 dark:border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                <div className="space-y-1.5 max-w-xl">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Participe de uma Turma
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Você ainda não faz parte de nenhuma turma. Vincule-se com o código fornecido pelo seu líder ou solicite a criação de uma nova sala.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsJoinOpen(true)}
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Entrar em uma Turma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-primary" />
                    <span>Solicitar Criação de Turma</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* BARRA DE DIVISÃO DA TURMA (Abaixo dos detalhes da turma e acima do calendário) */}
        {turma && (
          <div className="relative z-40 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Divisão da Turma
                  </span>
                  {isUpdatingSubgrupo && (
                    <span className="text-[10px] text-primary font-semibold animate-pulse">
                      Salvando...
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Filtre as atividades pelo seu subgrupo
                </p>
              </div>
            </div>

            {/* Seletor Customizado de Divisão: Simples, Bonito e Compacto */}
            <div className="relative shrink-0 self-start sm:self-auto z-50" ref={divisionPopoverRef}>
              <button
                type="button"
                onClick={() => {
                  setIsDivisionOpen((prev) => !prev);
                  setIsFilterOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-primary/50 shadow-sm cursor-pointer"
              >
                <span className="text-slate-500 dark:text-slate-400 font-medium">Sua divisão:</span>
                <span className="font-bold text-primary">
                  {user?.subgrupoTurma === 'TURMA_A'
                    ? 'Turma A'
                    : user?.subgrupoTurma === 'TURMA_B'
                    ? 'Turma B'
                    : 'Sem divisão (Geral)'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isDivisionOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Menu Dropdown Simples e Elegante com z-index e sombra elevados */}
              {isDivisionOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-56 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] ring-1 ring-black/10 animate-in fade-in zoom-in-95 duration-100">
                  {[
                    { id: 'GERAL' as const, label: 'Sem divisão (Geral)' },
                    { id: 'TURMA_A' as const, label: 'Turma A' },
                    { id: 'TURMA_B' as const, label: 'Turma B' },
                  ].map((opt) => {
                    const isSelected = (user?.subgrupoTurma || 'GERAL') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          handleSubgrupoChange(opt.id);
                          setIsDivisionOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 1: RESUMO (Calendário 5 Colunas) */}
        {viewMode === 'SUMMARY' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Próximos 5 Dias
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Atividades programadas do calendário
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* BOTÃO DE FILTRO DE ATIVIDADES DO CALENDÁRIO */}
                <div className="relative z-30" ref={filterPopoverRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFilterOpen((prev) => !prev);
                      setIsDivisionOpen(false);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm cursor-pointer ${
                      activeFilterCount > 0
                        ? 'bg-primary text-white border-primary shadow-md hover:bg-primary/90'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Filter className={`w-3.5 h-3.5 ${activeFilterCount > 0 ? 'text-white' : 'text-primary'}`} />
                    <span>Filtros</span>
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] font-black flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Popover (Desktop) */}
                  {isFilterOpen && (
                    <div className="hidden sm:block absolute right-0 top-full mt-2 w-80 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                      {renderFilterContent()}
                    </div>
                  )}

                  {/* Bottom Sheet no Celular via Portal no document.body com espaçamento inferior generoso */}
                  {isFilterOpen &&
                    typeof document !== 'undefined' &&
                    createPortal(
                      <div className="sm:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
                        <div
                          className="absolute inset-0"
                          onClick={() => setIsFilterOpen(false)}
                        />
                        <div className="relative w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-28 shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200">
                          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />
                          {renderFilterContent()}
                        </div>
                      </div>,
                      document.body
                    )}
                </div>

                {/* BOTÃO VER MÊS COMPLETO */}
                <button
                  onClick={() => setViewMode('MONTH_GRID')}
                  className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl shadow-sm cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Ver Mês Completo</span>
                </button>
              </div>
            </div>

            {/* CHIPS DE FILTROS ATIVOS (FEEDBACK VISUAL CLARO) */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5 animate-in fade-in duration-200">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Filtros aplicados:
                </span>
                {typeFilter !== 'TUDO' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {typeFilter === 'PROVAS'
                      ? 'Provas'
                      : typeFilter === 'TRABALHOS'
                      ? 'Trabalhos'
                      : typeFilter === 'TAREFAS'
                      ? 'Tarefas'
                      : 'Avisos'}
                    <button
                      type="button"
                      onClick={() => setTypeFilter('TUDO')}
                      className="hover:opacity-75 cursor-pointer"
                      title="Remover filtro de tipo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {statusFilter === 'PENDING' ? 'Apenas pendentes' : 'Apenas concluídas'}
                    <button
                      type="button"
                      onClick={() => setStatusFilter('ALL')}
                      className="hover:opacity-75 cursor-pointer"
                      title="Remover filtro de status"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('TUDO');
                    setStatusFilter('ALL');
                  }}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors ml-1 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar todos
                </button>
              </div>
            )}

            {/* VISÃO DESKTOP: Grid 5 Colunas */}
            <div className="hidden md:grid grid-cols-5 gap-6">
              {isLoading && turma ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`sk-desk-${i}`}
                    className="flex flex-col gap-4 animate-pulse"
                  >
                    <div className="text-center pb-3 border-b-2 border-slate-200 dark:border-slate-800">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mx-auto mb-2" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-12 mx-auto" />
                    </div>
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  </div>
                ))
              ) : (
                summaryDays.map((day) => (
                  <div key={day.date} className="flex flex-col gap-4">
                    <div
                      className={`text-center pb-3 border-b-2 transition-colors ${
                        day.isToday
                          ? 'border-primary'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${
                          day.isToday ? 'text-primary' : 'text-slate-500'
                        }`}
                      >
                        {day.weekday}
                      </p>
                      <p
                        className={`text-3xl font-black mt-1 ${
                          day.isToday
                            ? 'text-primary'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {day.dayStr}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {day.events.length > 0 ? (
                        day.events.map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`evento/${event.id}`);
                            }}
                            className={`p-4 rounded-2xl border-l-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm glass-card ${event.borderClass} ${event.bgClass} ${
                              event.concluida ? 'opacity-55 hover:opacity-80' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${event.colorClass} bg-white/50 dark:bg-slate-900/50 shadow-sm`}
                                >
                                  {event.label}
                                </div>
                                {event.grupoDestinatario === 'TURMA_A' && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                                    Turma A
                                  </span>
                                )}
                                {event.grupoDestinatario === 'TURMA_B' && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                                    Turma B
                                  </span>
                                )}
                              </div>
                              <EventCheckbox eventId={event.id} concluida={event.concluida} size="sm" />
                            </div>
                            <p
                              className={`text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1.5 ${
                                event.concluida
                                  ? 'line-through decoration-slate-400 text-slate-500 dark:text-slate-400'
                                  : ''
                              }`}
                            >
                              {event.title}
                            </p>
                            {event.description ? (
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {event.description}
                              </p>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <div className="h-24 rounded-2xl border-2 border-dashed border-slate-200/70 dark:border-slate-800/70 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50">
                          Livre
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* VISÃO MOBILE: Linha do Tempo Focada */}
            <div className="flex flex-col md:hidden gap-6">
              {isLoading && turma ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`sk-mob-${i}`}
                    className="flex flex-col gap-3 animate-pulse"
                  >
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  </div>
                ))
              ) : (
                <>
                  {summaryDays
                    .filter((day) => day.events.length > 0)
                    .map((day) => (
                      <div key={`mob-${day.date}`} className="flex flex-col gap-3">
                        <h3
                          className={`text-sm font-bold flex items-center gap-2 ${
                            day.isToday
                              ? 'text-primary'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {day.isToday && (
                            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                          )}
                          {day.weekday}, {day.dayStr}
                        </h3>
                        <div className="flex flex-col gap-3">
                          {day.events.map((event) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`evento/${event.id}`);
                              }}
                              className={`glass-card p-4 sm:p-5 rounded-2xl border-l-4 cursor-pointer shadow-sm active:scale-[0.98] transition-all flex items-start justify-between gap-3 ${event.borderClass} ${event.bgClass} ${
                                event.concluida ? 'opacity-55 hover:opacity-80' : ''
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                  <div
                                    className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider ${event.colorClass} bg-white/60 dark:bg-slate-900/60`}
                                  >
                                    {event.label}
                                  </div>
                                  {event.grupoDestinatario === 'TURMA_A' && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                                      Turma A
                                    </span>
                                  )}
                                  {event.grupoDestinatario === 'TURMA_B' && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                                      Turma B
                                    </span>
                                  )}
                                </div>
                                <h4
                                  className={`text-base font-bold text-slate-900 dark:text-white mb-1 ${
                                    event.concluida
                                      ? 'line-through decoration-slate-400 text-slate-500 dark:text-slate-400'
                                      : ''
                                  }`}
                                >
                                  {event.title}
                                </h4>
                                {event.description ? (
                                  <p className="line-clamp-2 text-xs text-slate-500 mt-1 leading-relaxed">
                                    {event.description}
                                  </p>
                                ) : null}
                              </div>
                              <div className="shrink-0 pt-0.5">
                                <EventCheckbox eventId={event.id} concluida={event.concluida} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                  {summaryDays.every((d) => d.events.length === 0) && (
                    <div className="p-8 text-center text-slate-500 glass-card rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 font-medium">
                      Nenhum evento para os próximos 5 dias com os filtros atuais.
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <button
                onClick={() => setViewMode('SUMMARY')}
                className="flex w-fit items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Resumo</span>
              </button>

              {/* Controle de Mês Funcional */}
              <div className="flex items-center gap-2 sm:gap-4 self-center bg-white dark:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                  onClick={prevMonth}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="relative">
                  <div className="px-4 py-2 text-base sm:text-lg font-black text-slate-800 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2">
                    {MONTH_NAMES[month]} {year}
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <select
                    value={`${year}-${month}`}
                    onChange={(e) => {
                      const [y, m] = e.target.value.split('-');
                      setCurrentDate(new Date(parseInt(y), parseInt(m), 1));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {Array.from({ length: 5 * 12 }, (_, i) => {
                      const optYear = 2024 + Math.floor(i / 12);
                      const optMonth = i % 12;
                      return (
                        <option
                          key={`${optYear}-${optMonth}`}
                          value={`${optYear}-${optMonth}`}
                        >
                          {MONTH_NAMES[optMonth]} {optYear}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={nextMonth}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* BOTÃO DE FILTRO DE ATIVIDADES DO CALENDÁRIO */}
              <div className="relative z-30 self-end md:self-auto" ref={filterPopoverRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsFilterOpen((prev) => !prev);
                    setIsDivisionOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm cursor-pointer ${
                    activeFilterCount > 0
                      ? 'bg-primary text-white border-primary shadow-md hover:bg-primary/90'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Filter className={`w-3.5 h-3.5 ${activeFilterCount > 0 ? 'text-white' : 'text-primary'}`} />
                  <span>Filtros</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] font-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Popover (Desktop) */}
                {isFilterOpen && (
                  <div className="hidden sm:block absolute right-0 top-full mt-2 w-80 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                    {renderFilterContent()}
                  </div>
                )}

                {/* Bottom Sheet no Celular via Portal no document.body com espaçamento inferior generoso */}
                {isFilterOpen &&
                  typeof document !== 'undefined' &&
                  createPortal(
                    <div className="sm:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
                      <div
                        className="absolute inset-0"
                        onClick={() => setIsFilterOpen(false)}
                      />
                      <div className="relative w-full max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-28 shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200">
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />
                        {renderFilterContent()}
                      </div>
                    </div>,
                    document.body
                  )}
              </div>
            </div>

            {/* CHIPS DE FILTROS ATIVOS (FEEDBACK VISUAL CLARO) */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5 animate-in fade-in duration-200">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Filtros aplicados:
                </span>
                {typeFilter !== 'TUDO' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {typeFilter === 'PROVAS'
                      ? 'Provas'
                      : typeFilter === 'TRABALHOS'
                      ? 'Trabalhos'
                      : typeFilter === 'TAREFAS'
                      ? 'Tarefas'
                      : 'Avisos'}
                    <button
                      type="button"
                      onClick={() => setTypeFilter('TUDO')}
                      className="hover:opacity-75 cursor-pointer"
                      title="Remover filtro de tipo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {statusFilter === 'PENDING' ? 'Apenas pendentes' : 'Apenas concluídas'}
                    <button
                      type="button"
                      onClick={() => setStatusFilter('ALL')}
                      className="hover:opacity-75 cursor-pointer"
                      title="Remover filtro de status"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('TUDO');
                    setStatusFilter('ALL');
                  }}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors ml-1 cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar todos
                </button>
              </div>
            )}

            <div className="glass-panel rounded-3xl overflow-hidden mt-2">
              <div className="grid grid-cols-7 bg-slate-100/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                  <div
                    key={d}
                    className="text-center py-3 text-xs font-bold text-slate-500 uppercase tracking-widest"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800">
                {renderedDays.map((dayObj, index) => {
                  if (!dayObj)
                    return (
                      <div
                        key={`empty-${index}`}
                        className="bg-white/60 dark:bg-slate-900/60 p-2 md:p-3 min-h-[80px] md:min-h-[160px]"
                      />
                    );

                  const filteredEvents = dayObj.events;
                  const isSelectedOnMobile = selectedMobileDay === dayObj.day;

                  return (
                    <div
                      key={dayObj.day}
                      onClick={() => handleMobileDaySelect(dayObj.day)}
                      className={`bg-white dark:bg-slate-900 p-1.5 md:p-3 min-h-[80px] md:min-h-[160px] transition-colors cursor-pointer md:cursor-default relative flex flex-col gap-2 overflow-hidden
                        ${
                          dayObj.isToday
                            ? 'bg-primary/5 dark:bg-primary/5'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }
                        ${
                          isSelectedOnMobile
                            ? 'ring-2 ring-inset ring-primary md:ring-0'
                            : ''
                        }
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-sm font-bold flex items-center justify-center w-7 h-7 rounded-full ${
                            dayObj.isToday
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {dayObj.day}
                        </span>
                      </div>

                      {/* VISÃO DESKTOP */}
                      <div className="hidden md:flex flex-col gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                        {filteredEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`evento/${event.id}`);
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipPos({
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                              });
                              setHoveredEvent(event);
                            }}
                            onMouseLeave={() => setHoveredEvent(null)}
                            className={`text-xs font-bold px-2.5 py-2 rounded-xl border-l-[3px] ${event.colorClass} ${event.bgClass} ${event.borderClass} cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all leading-tight line-clamp-3 shrink-0 ${
                              event.concluida ? 'opacity-50 line-through' : ''
                            }`}
                          >
                            <span className="opacity-75 mr-1 font-extrabold text-[10px]">
                              [{event.label.slice(0, 3)}]
                            </span>
                            {event.grupoDestinatario === 'TURMA_A' && (
                              <span className="mr-1 text-[9px] px-1 py-0.2 rounded font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                A
                              </span>
                            )}
                            {event.grupoDestinatario === 'TURMA_B' && (
                              <span className="mr-1 text-[9px] px-1 py-0.2 rounded font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                B
                              </span>
                            )}
                            {event.title}
                          </div>
                        ))}
                      </div>

                      <div className="flex md:hidden flex-wrap justify-center gap-1.5 mt-auto pb-1">
                        {filteredEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`w-2 h-2 rounded-full ${event.dotClass}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:hidden mt-8 mb-10">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Eventos do dia {selectedMobileDay}
              </h3>
              <div className="flex flex-col gap-3">
                {(() => {
                  const dayObj = renderedDays.find(
                    (d) => d && d.day === selectedMobileDay
                  );
                  const dayEvents = dayObj ? dayObj.events : [];
                  const limit = 4;
                  const totalPages = Math.ceil(dayEvents.length / limit);
                  const paginatedEvents = dayEvents.slice(
                    (mobilePage - 1) * limit,
                    mobilePage * limit
                  );

                  if (dayEvents.length === 0) {
                    return (
                      <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500 font-medium bg-slate-50/50 dark:bg-slate-900/50">
                        Nenhum evento programado para este dia com os filtros atuais.
                      </div>
                    );
                  }

                  return (
                    <>
                      {paginatedEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`evento/${event.id}`);
                          }}
                          className={`glass-card p-4 rounded-2xl border-l-4 cursor-pointer active:scale-[0.98] transition-all flex items-start justify-between gap-3 ${event.borderClass} ${event.bgClass} ${
                            event.concluida ? 'opacity-55 hover:opacity-80' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                              <div className={`text-xs font-bold ${event.colorClass}`}>
                                {event.label}
                              </div>
                              {event.grupoDestinatario === 'TURMA_A' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                                  Turma A
                                </span>
                              )}
                              {event.grupoDestinatario === 'TURMA_B' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                                  Turma B
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm font-bold text-slate-900 dark:text-white leading-tight ${
                                event.concluida
                                  ? 'line-through decoration-slate-400 text-slate-500 dark:text-slate-400'
                                  : ''
                              }`}
                            >
                              {event.title}
                            </p>
                            {event.description ? (
                              <p className="line-clamp-2 text-xs text-slate-500 mt-1 leading-relaxed">
                                {event.description}
                              </p>
                            ) : null}
                          </div>
                          <div className="shrink-0 pt-0.5">
                            <EventCheckbox eventId={event.id} concluida={event.concluida} />
                          </div>
                        </div>
                      ))}

                      {totalPages > 1 && (
                        <div className="flex justify-between items-center p-3 mt-2 border-t border-slate-200 dark:border-slate-800/50">
                          <button
                            onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
                            disabled={mobilePage === 1}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            &larr; Anterior
                          </button>
                          <span className="text-xs font-bold text-slate-500">
                            Página{' '}
                            <span className="text-slate-900 dark:text-white">
                              {mobilePage}
                            </span>{' '}
                            de {totalPages}
                          </span>
                          <button
                            onClick={() =>
                              setMobilePage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={mobilePage === totalPages}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-30 hover:text-slate-900 transition-colors cursor-pointer"
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

      {/* TOOLTIP FLUTUANTE GLOBAL */}
      {hoveredEvent && (
        <div
          className="fixed z-50 p-4 rounded-xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-700 w-64 pointer-events-none transition-opacity animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 8}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${hoveredEvent.colorClass} bg-slate-100 dark:bg-slate-800`}
            >
              {hoveredEvent.label}
            </span>
            {hoveredEvent.grupoDestinatario === 'TURMA_A' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                Turma A
              </span>
            )}
            {hoveredEvent.grupoDestinatario === 'TURMA_B' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                Turma B
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-tight">
            {hoveredEvent.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed">
            {hoveredEvent.description}
          </p>

          {/* Triângulo do Tooltip */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[99%] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-slate-200 dark:border-t-slate-700" />
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[90%] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-white/80 dark:border-t-slate-900/80 backdrop-blur-md" />
        </div>
      )}

      {/* MODAL DE DETALHES DO EVENTO */}
      <Outlet />

      {/* MODAIS DE ENTRAR E CRIAR TURMA */}
      <JoinClassModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
