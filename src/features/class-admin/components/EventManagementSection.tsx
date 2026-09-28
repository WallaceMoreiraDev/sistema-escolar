import { useState } from 'react';
import { EventForm } from './EventForm';
import { EventList } from './EventList';
import { ClassEvent } from '../types';

export function EventManagementSection() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ClassEvent | null>(null);

  const handleOpenNew = () => {
    setEventToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event: ClassEvent) => {
    setEventToEdit(event);
    setIsFormOpen(true);
  };

  return (
    <section className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Eventos</h2>
        </div>
        
        <button 
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Novo Evento
        </button>
      </div>

      <div className="space-y-8">
        <EventForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          eventToEdit={eventToEdit}
        />
        <EventList onEdit={handleEdit} />
      </div>
    </section>
  );
}
