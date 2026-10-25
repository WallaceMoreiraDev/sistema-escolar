import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { EventForm } from './EventForm';
import { EventList } from './EventList';
import { EventDTO } from '@shared/types';

interface EventManagementSectionProps {
  turmaId?: string;
}

export function EventManagementSection({ turmaId }: EventManagementSectionProps = {}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventDTO | null>(null);

  const handleOpenNew = () => {
    setEventToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event: EventDTO) => {
    setEventToEdit(event);
    setIsFormOpen(true);
  };

  return (
    <section className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Gestão de Eventos
          </h2>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Evento
        </button>
      </div>

      <div className="space-y-8">
        <EventForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          eventToEdit={eventToEdit}
          turmaId={turmaId}
        />
        <EventList onEdit={handleEdit} turmaId={turmaId} />
      </div>
    </section>
  );
}
