import { ClassEvent } from '../types';

export const MOCK_CLASS_EVENTS: ClassEvent[] = Array.from({ length: 20 }).map((_, i) => {
  const date = new Date();
  
  // Vamos concentrar os primeiros 8 eventos no dia atual, e 3 amanhã, pra forçar o scroll
  if (i < 8) {
    date.setDate(date.getDate()); // Hoje
  } else if (i < 11) {
    date.setDate(date.getDate() + 1); // Amanhã
  } else {
    date.setDate(date.getDate() + (i - 8)); // Outros dias espalhados
  }
  
  // Setando horários variados no dia
  date.setHours(7 + (i % 14), (i * 15) % 60, 0, 0);

  return {
    id: `evt-${i + 1}`,
    subject: ['Matemática', 'Física', 'Desenvolvimento de Sistemas', 'Banco de Dados', 'Inglês', 'Química'][i % 6],
    category: (['Prova', 'Trabalho', 'Tarefa'] as const)[i % 3],
    dueDate: date.toISOString(),
    description: `Descrição detalhada do evento ${i + 1}. Estudar capítulos e preparar material.`,
    createdAt: new Date().toISOString(),
  };
});
