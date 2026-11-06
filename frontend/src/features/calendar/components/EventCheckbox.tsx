import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useToggleEventCompletion } from '../../class-admin/hooks/useClassEvents';

interface EventCheckboxProps {
  eventId: string;
  concluida?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EventCheckbox({
  eventId,
  concluida = false,
  className = '',
  size = 'md',
}: EventCheckboxProps) {
  const toggleMutation = useToggleEventCompletion();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMutation.mutate(eventId);
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSize = iconSizes[size] || iconSizes.md;

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`group/chk p-1.5 rounded-full transition-all flex items-center justify-center shrink-0 cursor-pointer active:scale-90 ${
        concluida
          ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${className}`}
      title={concluida ? 'Tarefa concluída (clique para reabrir)' : 'Marcar como concluída'}
      aria-label={concluida ? 'Marcar tarefa como pendente' : 'Marcar tarefa como concluída'}
    >
      {concluida ? (
        <CheckCircle2
          className={`${iconSize} fill-emerald-100 dark:fill-emerald-950/50 stroke-[2.2] animate-in zoom-in-75 duration-150`}
        />
      ) : (
        <Circle
          className={`${iconSize} stroke-[1.8] group-hover/chk:stroke-emerald-500 transition-colors`}
        />
      )}
    </button>
  );
}
