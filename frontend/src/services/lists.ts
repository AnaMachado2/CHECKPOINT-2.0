import api from '@/lib/api';

/**
 * Interface que representa uma lista de jogos.
 * Usada para saída das rotas de Listagem e Busca por Usuário.
 * A rota 'getById' (Buscar por ID) retorna a estrutura 'jogos' mais detalhada.
 */
export interface GameList {
  id_lista: number;
  nm_lista: string;
  id_usuario: number;
  lista_jogos?: number[]; // Lista de IDs de jogos (presente na listagem)
  nm_usuario?: string;
  total_jogos?: number;
  jogos?: Array<{
    id_jogo: number;
    nm_jogo: string;
    genero?: string;
    dt_jogo?: string;
    tem_imagem?: boolean;
    // O PDF sugere 'img_jogo' mas a interface 'GameList' original usa campos de Game mais simples.
    // Vamos manter a estrutura original para compatibilidade com o que parece ser um objeto de Jogo.
  }>;
}

/**
 * Interface para os dados de entrada (Body) na criação de uma nova lista.
 * POST /api/listas
 */
export interface CreateListData {
  nm_lista: string;
  lista_jogos: number[];
}

/**
 * Serviço que encapsula as chamadas à API para a gestão de Listas.
 */
export const listsService = {
  /**
   * GET /api/listas (Público)
   * Lista todas as listas públicas. Retorna um array de GameList.
   */
  async getAll(): Promise<GameList[]> {
    const response = await api.get<GameList[]>('/api/listas');
    return response.data;
  },

  /**
   * GET /api/listas/{id} (Público)
   * Busca uma lista específica, incluindo os detalhes completos dos jogos.
   */
  async getById(id: number): Promise<GameList> {
    const response = await api.get<GameList>(`/api/listas/${id}`);
    return response.data;
  },

  /**
   * GET /api/listas/usuario/{id_usuario} (Público)
   * Busca todas as listas de um usuário específico. Retorna um array de GameList.
   */
  async getByUser(userId: number): Promise<GameList[]> {
    const response = await api.get<GameList[]>(`/api/listas/usuario/${userId}`);
    return response.data;
  },

  /**
   * POST /api/listas (Auth)
   * Cria uma nova lista. Requer token de autenticação.
   * @param data Objeto contendo o nome da lista e um array de IDs de jogos.
   */
  async create(data: CreateListData): Promise<GameList> {
    const response = await api.post<GameList>('/api/listas', data);
    return response.data;
  },

  /**
   * PUT /api/listas/{id} (Auth)
   * Atualiza nome e/ou lista de jogos completa. Requer token e o usuário deve ser o dono.
   * @param id ID da lista a ser atualizada.
   * @param data Dados opcionais para atualização (nm_lista e/ou lista_jogos).
   */
  async update(id: number, data: { nm_lista?: string; lista_jogos?: number[] }): Promise<GameList> {
    const response = await api.put<GameList>(`/api/listas/${id}`, data);
    return response.data;
  },

  /**
   * POST /api/listas/{id}/jogos (Auth)
   * Adiciona um jogo a uma lista. Requer token de autenticação.
   * @param listId ID da lista.
   * @param gameId ID do jogo a ser adicionado.
   * O corpo da requisição é { "id_jogo": gameId }.
   */
  async addGame(listId: number, gameId: number): Promise<void> {
    // A documentação exige { "id_jogo": 12 } no body
    await api.post(`/api/listas/${listId}/jogos`, { id_jogo: gameId }); 
  },

  /**
   * DELETE /api/listas/{id}/jogos/{id_jogo} (Auth)
   * Remove um jogo de uma lista. Requer token de autenticação.
   * @param listId ID da lista.
   * @param gameId ID do jogo a ser removido.
   */
  async removeGame(listId: number, gameId: number): Promise<void> {
    // O endpoint completo inclui o ID do jogo na URL
    await api.delete(`/api/listas/${listId}/jogos/${gameId}`);
  },

  /**
   * DELETE /api/listas/{id} (Auth)
   * Deleta uma lista inteira. Requer token e o usuário deve ser o dono.
   * @param id ID da lista a ser deletada.
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/api/listas/${id}`);
  },
};
