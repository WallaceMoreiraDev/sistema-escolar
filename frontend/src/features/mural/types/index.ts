export interface Notice {
  id: string;
  sender: string;
  badge: 'Urgente' | 'Informativo' | 'Evento';
  title: string;
  message: string;
  date: string;
  createdAt: string;
}
