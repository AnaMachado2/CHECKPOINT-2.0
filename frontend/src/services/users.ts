// src/services/users.ts (CÓDIGO COMPLETO CORRIGIDO COM NOVAS FUNCIONALIDADES)
import api from '@/lib/api';

export interface UserProfile {
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  tipo_usuario: 'user' | 'admin'; 
  dt_cadastro?: string;
  foto_perfil?: string; // Novo campo
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

  // Atualizar usuário
  update: async (
    id: string | number,
    data: Partial<{
      nm_usuario: string;
      email_usuario: string;
      senha?: string;
      foto_perfil?: string | File; // Adicionado suporte para foto_perfil
    }>
  ): Promise<UserProfile> => {
    // Verificar se usa FormData ou JSON
    let payload: any = data;
    let headers = {};

    if (data.foto_perfil instanceof File) {
      payload = new FormData();
      if (data.nm_usuario) payload.append('nm_usuario', data.nm_usuario);
      if (data.email_usuario) payload.append('email_usuario', data.email_usuario);
      if (data.senha) payload.append('senha', data.senha);
      payload.append('foto_perfil', data.foto_perfil);
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    const response = await api.put(`/api/usuarios/${id}`, payload, { headers });
    
    // Atualiza localStorage se for o usuário logado.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (Number(user.id_usuario) === Number(id)) {
          const updatedUser = { ...user, ...response.data };
          localStorage.setItem('user', JSON.stringify(updatedUser)); // Atualiza o usuário no localStorage.
        }
      } catch (e) {
        console.warn('Erro ao atualizar usuário no localStorage');
      }
    }

    return response.data;
  },

  // DELETE
  async delete(id: number): Promise<void> {
    await api.delete(`/api/usuarios/${id}`);
  },

  // ============ FUNCIONALIDADES DE SEGUIDORES ============
  
  followUser: async (id: number): Promise<void> => {
    await api.post(`/api/usuarios/${id}/seguir`);
  },

  unfollowUser: async (id: number): Promise<void> => {
    await api.delete(`/api/usuarios/${id}/seguir`);
  },

  checkIsFollowing: async (id: number): Promise<boolean> => {
    try {
      const response = await api.get(`/api/usuarios/${id}/isFollowing`);
      return response.data.isFollowing;
    } catch {
      return false;
    }
  },

  getFollowers: async (id: number): Promise<UserProfile[]> => {
    try {
      const response = await api.get(`/api/usuarios/${id}/seguidores`);
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  getFollowing: async (id: number): Promise<UserProfile[]> => {
    try {
      const response = await api.get(`/api/usuarios/${id}/seguindo`);
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  // Mantive o antigo nome também
  updateProfile: async (id: string | number, data: Partial<UserProfile>) => {
    return usersService.update(id, data);
  },
};
