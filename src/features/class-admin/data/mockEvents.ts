import { ClassEvent } from '../types';

export const MOCK_CLASS_EVENTS: ClassEvent[] = Array.from({ length: 12 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + (i + 1));
  return {
    id: `evt-${i + 1}`,
    subject: ['Matemática', 'Física', 'História', 'Geografia', 'Inglês', 'Biologia'][i % 6],
    category: (['Prova', 'Trabalho', 'Tarefa'] as const)[i % 3],
    dueDate: date.toISOString(),
    description: `Descrição detalhada do evento ${i + 1}. Estudar capítulos e preparar material.`,
    createdAt: new Date().toISOString(),
  };
});
