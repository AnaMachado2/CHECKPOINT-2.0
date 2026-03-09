import api from '@/lib/api';

export interface Game {
  id_jogo: number;
  nm_jogo: string;
  genero: string;
  classificacao: string;
  dt_jogo: string;
  id_usuario: number;
  tem_imagem: boolean;
}

export interface CreateGameData {
  nm_jogo: string;
  genero: string;
  classificacao: string;
  dt_jogo?: string;
  img_jogo?: File;
}

export const gamesService = {
  async getAll(): Promise<Game[]> {
    const response = await api.get<Game[]>('/api/jogos');
    return response.data;
  },

  async getById(id: number): Promise<Game> {
    const response = await api.get<Game>(`/api/jogos/${id}`);
    return response.data;
  },

  getImageUrl(id: number): string {
    return `${api.defaults.baseURL}/api/jogos/${id}/imagem`;
  },

  async create(data: CreateGameData): Promise<Game> {
    const formData = new FormData();
    formData.append('nm_jogo', data.nm_jogo);
    formData.append('genero', data.genero);
    formData.append('classificacao', data.classificacao);
    if (data.dt_jogo) formData.append('dt_jogo', data.dt_jogo);
    if (data.img_jogo) formData.append('img_jogo', data.img_jogo);

    const response = await api.post<Game>('/api/jogos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async update(id: number, data: Partial<CreateGameData>): Promise<Game> {
    const formData = new FormData();
    if (data.nm_jogo) formData.append('nm_jogo', data.nm_jogo);
    if (data.genero) formData.append('genero', data.genero);
    if (data.classificacao) formData.append('classificacao', data.classificacao);
    if (data.dt_jogo) formData.append('dt_jogo', data.dt_jogo);
    if (data.img_jogo) formData.append('img_jogo', data.img_jogo);

    const response = await api.put<Game>(`/api/jogos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/jogos/${id}`);
  },
};
