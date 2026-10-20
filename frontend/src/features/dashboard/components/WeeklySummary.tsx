import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClassEvents } from '../../class-admin/hooks/useClassEvents';

/**
 * Calcula os próximos 5 dias letivos (dias úteis: segunda a sexta) a partir de uma data de referência.
 * - Se hoje for sábado ou domingo, o 1º dia letivo é a próxima segunda-feira.
 * - Se hoje for dia de semana, hoje é o 1º dia letivo e contamos os próximos 4 dias úteis.
 */
function getNextFiveSchoolDays(referenceDate: Date = new Date()): Date[] {
  const schoolDays: Date[] = [];
  const current = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  while (schoolDays.length < 5) {
    const dayOfWeek = current.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      schoolDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return schoolDays;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getEventLocalDateStr(dataHoraLimite: string): string {
  const d = new Date(dataHoraLimite);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function WeeklySummary() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 5;

  // Cálculo rigoroso dos próximos 5 dias letivos
  const { startDate, endDate, schoolDayKeys } = useMemo(() => {
    const days = getNextFiveSchoolDays();
    const firstDay = days[0];
    const lastDay = days[days.length - 1];

    const start = new Date(
      firstDay.getFullYear(),
      firstDay.getMonth(),
      firstDay.getDate(),
      0,
      0,
      0,
      0
    ).toISOString();

    const end = new Date(
      lastDay.getFullYear(),
      lastDay.getMonth(),
      lastDay.getDate(),
      23,
      59,
      59,
      999
    ).toISOString();

    const keys = new Set(days.map(formatDateKey));

    return {
      startDate: start,
      endDate: end,
      schoolDayKeys: keys,
    };
  }, []);

  const { data: response, isLoading } = useClassEvents(startDate, endDate);

  const getEventStyles = (category: string) => {
    if (category === 'Prova')
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        border: 'border-rose-100 dark:border-rose-900',
        text: 'text-rose-600 dark:text-rose-400',
        hoverBg: 'group-hover:bg-rose-500',
        badgeBg: 'bg-rose-100 dark:bg-rose-900/40',
        badgeText: 'text-rose-700 dark:text-rose-300',
      };
    if (category === 'Trabalho')
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-100 dark:border-blue-900',
        text: 'text-blue-600 dark:text-blue-400',
        hoverBg: 'group-hover:bg-blue-500',
        badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
        badgeText: 'text-blue-700 dark:text-blue-300',
      };
    if (category === 'Aviso')
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        border: 'border-purple-100 dark:border-purple-900',
        text: 'text-purple-600 dark:text-purple-400',
        hoverBg: 'group-hover:bg-purple-500',
        badgeBg: 'bg-purple-100 dark:bg-purple-900/40',
        badgeText: 'text-purple-700 dark:text-purple-300',
      };
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-100 dark:border-amber-900',
      text: 'text-amber-600 dark:text-amber-400',
      hoverBg: 'group-hover:bg-amber-500',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
      badgeText: 'text-amber-700 dark:text-amber-300',
    };
  };

  // Filtra eventos garantindo que sua data local pertença exclusivamente ao conjunto dos 5 dias letivos calculados
  const filteredEvents = useMemo(() => {
    const rawEvents = response?.data || [];
    return rawEvents.filter((event) => {
      const eventDateKey = getEventLocalDateStr(event.dataHoraLimite);
      return schoolDayKeys.has(eventDateKey);
    });
  }, [response?.data, schoolDayKeys]);

  const total = filteredEvents.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Próximos 5 Dias Letivos
        </h3>
        <Link
          to="/app/minha-turma"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Ver turma completa &rarr;
        </Link>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="glass-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5 animate-pulse"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : paginatedEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 glass-card rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 font-medium">
            Nenhum evento letivo para os próximos 5 dias úteis.
          </div>
        ) : (
          paginatedEvents.map((event) => {
            const styles = getEventStyles(event.categoria);
            const dateObj = new Date(event.dataHoraLimite);
            const dayStr = dateObj.getDate().toString().padStart(2, '0');
            const monthStr = dateObj
              .toLocaleString('pt-BR', { month: 'short' })
              .toUpperCase()
              .replace('.', '');
            const time = dateObj.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={event.id}
                onClick={() => navigate(`/app/minha-turma/evento/${event.id}`)}
                className="glass-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5 group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center shrink-0 shadow-sm transition-colors ${styles.bg} ${styles.border} ${styles.text} ${styles.hoverBg} group-hover:text-white`}
                >
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    {monthStr}
                  </span>
                  <span className="text-xl sm:text-2xl font-black leading-none mt-0.5">
                    {dayStr}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${styles.badgeBg} ${styles.badgeText}`}
                    >
                      {event.categoria}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {time}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                    {event.materia}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {event.descricao || (
                      <span className="italic">Sem descrição</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && !isLoading && (
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            &larr; Anterior
          </button>

          <span className="text-xs font-bold text-slate-500">
            Página{' '}
            <span className="text-slate-900 dark:text-white">{currentPage}</span> de{' '}
            {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Próxima &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
