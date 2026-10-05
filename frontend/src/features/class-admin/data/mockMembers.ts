import { ClassMember } from '../types';

export const MOCK_CLASS_MEMBERS: ClassMember[] = [
  {
    id: 'usr-1',
    name: 'Wallace Moreira (Você)',
    email: 'wallace@prumo.com',
    role: 'leader',
    joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'usr-2',
    name: 'Ana Beatriz Ferreira',
    email: 'ana.ferreira@aluno.prumo.com',
    role: 'leader',
    joinedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'usr-3',
    name: 'Carlos Eduardo Silva',
    email: 'carlos.silva@aluno.prumo.com',
    role: 'student',
    joinedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'usr-4',
    name: 'Mariana Costa Sousa',
    email: 'mariana.sousa@aluno.prumo.com',
    role: 'student',
    joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'usr-5',
    name: 'João Pedro Alves',
    email: 'joao.alves@aluno.prumo.com',
    role: 'student',
    joinedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'usr-6',
    name: 'Roberto Carlos Silva',
    email: 'roberto@aluno.prumo.com',
    role: 'student',
    joinedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'usr-7',
    name: 'Julia Mendes',
    email: 'julia@aluno.prumo.com',
    role: 'student',
    joinedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  }
];
