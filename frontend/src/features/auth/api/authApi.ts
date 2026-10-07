const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface UserSessionData {
  id: string;
  nome: string;
  email: string;
  role: string;
  turma: {
    id: string;
    nome_oficial: string;
  } | null;
}

export const authApi = {
  async getMe(token: string): Promise<UserSessionData> {
    const res = await fetch(`${API_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Falha ao obter dados do usuário');
    }

    const data = await res.json();
    return data.data as UserSessionData;
  },

  async updateProfile(token: string, nome: string): Promise<UserSessionData> {
    const res = await fetch(`${API_URL}/api/me/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nome })
    });

    if (!res.ok) {
      throw new Error('Falha ao atualizar perfil');
    }

    const data = await res.json();
    return data.data as UserSessionData;
  }
};
