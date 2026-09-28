import { ClassEvent } from '../types';

export const MOCK_CLASS_EVENTS: ClassEvent[] = Array.from({ length: 12 }).map((_, i) => {

  const date = new Date();
  date.setDate(date.getDate() + (i + 1));
  
  // Setando horários fixos (08:00, 14:30, 23:59) para não ficar igual à hora atual do PC
  const hours = [8, 14, 23][i % 3];
  const minutes = [0, 30, 59][i % 3];
  date.setHours(hours, minutes, 0, 0);

  return {
    id: `evt-${i + 1}`,
    subject: ['Matemática', 'Física', 'História', 'Geografia', 'Inglês', 'Biologia'][i % 6],
    category: (['Prova', 'Trabalho', 'Tarefa'] as const)[i % 3],
    dueDate: date.toISOString(),
    description: `Descrição detalhada do evento ${i + 1}. Estudar capítulos e preparar material.`,
    createdAt: new Date().toISOString(),
  };
});
