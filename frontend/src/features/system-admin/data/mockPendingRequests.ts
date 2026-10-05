export interface PendingRequest {
  id: string;
  requesterName: string;
  year: string;
  shift: string;
  course: string;
  room?: string;
  justification?: string;
  createdAt: string;
}

export const MOCK_PENDING_REQUESTS: PendingRequest[] = [
  {
    id: 'req-1',
    requesterName: 'João Pedro da Silva',
    year: '3',
    shift: 'Manhã',
    course: 'Desenvolvimento de Sistemas',
    room: 'Lab 04',
    justification: 'Sou representante e nossa turma precisa acessar a plataforma urgente para organizar o TCC.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'req-2',
    requesterName: 'Maria Clara Souza',
    year: '1',
    shift: 'Tarde',
    course: 'Administração',
    justification: 'A professora pediu para criarmos.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'req-3',
    requesterName: 'Lucas Oliveira',
    year: '2',
    shift: 'Noite',
    course: 'Logística',
    room: 'Sala 12',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  }
];
