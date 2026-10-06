// Simula uma chamada de API para buscar e atualizar o perfil do usuário
export const profileApi = {
  getProfile: async () => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedName = localStorage.getItem('@prumo:userName');
    
    if (!storedName) {
      throw new Error('NOT_FOUND');
    }
    
    return { name: storedName };
  },

  updateProfile: async (data: { name: string }) => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 600));
    
    localStorage.setItem('@prumo:userName', data.name);
    return { success: true, data };
  }
};
