// src/services/users.ts (CÓDIGO COMPLETO CORRIGIDO)
import api from '@/lib/api';

export interface UserProfile {
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  // CORRIGIDO: Tornar tipo_usuario obrigatório para satisfazer a tipagem ProfileUser no componente Profile.tsx
  tipo_usuario: 'user' | 'admin'; 
  dt_cadastro?: string;
}

export interface UserReview {
  id_avaliacao: number;
  id_jogo: number;
  nm_jogo: string;
  nota: number;
  comentario: string;
  dt_avaliacao: string;
}

export const usersService = {
  // Buscar usuário por ID
  getById: async (id: string | number): Promise<UserProfile> => {
    const response = await api.get(`/api/usuarios/${id}`);
    return response.data;
  },

  // Buscar avaliações do usuário
  getReviews: async (userId: string | number): Promise<UserReview[]> => {
    try {
      const response = await api.get(`/api/avaliacoes/usuario/${userId}`); 
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      if (error.response?.status === 404) return [];
      console.error('Erro ao buscar avaliações:', error); 
      return [];
    }
  },

  // MÉTODO CORRIGIDO E PADRONIZADO → agora se chama "update"
  update: async (
    id: string | number,
    data: Partial<{
      nm_usuario: string;
      email_usuario: string;
      senha?: string;
    }>
  ): Promise<UserProfile> => {
    const response = await api.put(`/api/usuarios/${id}`, data);
    // Atualiza localStorage se for o usuário logado.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (Number(user.id_usuario) === Number(id)) {
          // Nota: O backend precisa garantir que response.data tem tipo_usuario
          const updatedUser = { ...user, ...response.data };
          localStorage.setItem('user', JSON.stringify(updatedUser)); // Atualiza o usuário no localStorage.
        }
      } catch (e) {
        console.warn('Erro ao atualizar usuário no localStorage');
      }
    }

    return response.data;
  },

  // NOVO: Adiciona o método 'delete' para suportar a funcionalidade de Admin em Profile.tsx
  async delete(id: number): Promise<void> {
    await api.delete(`/api/usuarios/${id}`);
  },

  // Mantive o antigo nome também (opcional) – assim não quebra nada que já usa
  updateProfile: async (id: string | number, data: Partial<UserProfile>) => {
    return usersService.update(id, data);
  },
};
