import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type User, type LoginData, type RegisterData } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data);
      setUser(response.usuario);
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo, ${response.usuario.nm_usuario}!`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.response?.data?.erro || 'Credenciais inválidas',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authService.register(data);
      toast({
        title: 'Cadastro realizado com sucesso',
        description: 'Agora você pode fazer login',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.response?.data?.erro || 'Erro ao criar conta',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast({
      title: 'Logout realizado',
      description: 'Até logo!',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
