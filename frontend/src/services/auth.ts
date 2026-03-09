// services/auth.ts
import api from '@/lib/api';

export interface RegisterData {
  nm_usuario: string;
  email_usuario: string;
  senha_usuario: string;
}

export interface LoginData {
  email_usuario: string;
  senha_usuario: string;
}

export interface User {
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  tipo_usuario: 'user' | 'admin';
}

export interface LoginResponse {
  mensagem: string;
  token: string;
  usuario: User;
}

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/api/auth/registrar', data);
    return response.data;
  },

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', data);
    
    // Salva token e usuário no localStorage
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.usuario));
    
    // Configura o token no header do axios para futuras requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/';
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  // Inicializa o token no axios se já estiver autenticado
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },
};
