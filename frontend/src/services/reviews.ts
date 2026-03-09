import api from '@/lib/api';

export interface Review {
  id_avaliacao: number;
  id_jogo: number;
  id_usuario: number;
  nm_usuario: string; // Nome do usuário que fez a avaliação (vem do JOIN)
  nota: number;
  comentario: string;
  dt_avaliacao: string; // Data do comentário, que é usada como data da avaliação
}

interface CreateReviewData {
  id_jogo: number;
  id_usuario: number; // Não é estritamente necessário no POST, mas incluímos
  nota: number;
  comentario: string;
}

interface UpdateReviewData {
  nota: number;
  comentario: string;
}

export const reviewsService = {
  // 1. BUSCAR AVALIAÇÕES POR JOGO (GET /api/avaliacoes/jogo/{id_jogo})
  getByGame: async (gameId: number): Promise<Review[]> => {
    const response = await api.get(`/api/avaliacoes/jogo/${gameId}`);
    // Mapeamos dt_comentario para dt_avaliacao para padronização no frontend
    return response.data.map((r: any) => ({
        ...r, 
        dt_avaliacao: r.dt_comentario 
    })) as Review[];
  },

  // 2. CRIAR AVALIAÇÃO (POST /api/avaliacoes)
  create: async (data: CreateReviewData): Promise<Review> => {
    // A rota POST usa o token para pegar o id_usuario, então removemos de 'data' se necessário
    const { id_usuario, ...postData } = data;
    const response = await api.post('/api/avaliacoes', postData);
    const { avaliacao } = response.data;
    return {
        ...avaliacao,
        dt_avaliacao: avaliacao.dt_comentario,
    } as Review;
  },

  // 3. ATUALIZAR AVALIAÇÃO (PUT /api/avaliacoes/{id})
  update: async (id: number, data: UpdateReviewData): Promise<Review> => {
    const response = await api.put(`/api/avaliacoes/${id}`, data);
    const { avaliacao } = response.data;
    return {
        ...avaliacao,
        dt_avaliacao: avaliacao.dt_comentario,
    } as Review;
  },

  // 4. DELETAR AVALIAÇÃO (DELETE /api/avaliacoes/{id})
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/avaliacoes/${id}`);
  },
};
