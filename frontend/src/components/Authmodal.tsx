// components/AuthModals.tsx
import { useState } from "react";
import { X, Mail, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onLoginSuccess }: LoginModalProps) => {
  const [formData, setFormData] = useState({
    email_usuario: '',
    senha_usuario: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.email_usuario || !formData.senha_usuario) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await authService.login(formData);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });
      onLoginSuccess();
      onClose();
      setFormData({ email_usuario: '', senha_usuario: '' });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-glass border-2 border-[#2dd4bf]/30 rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2dd4bf]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#2dd4bf]" />
          </div>
          <h2 className="font-pixel text-xl text-[#2dd4bf] mb-2">Bem-vindo de volta!</h2>
          <p className="text-muted-foreground text-sm">Entre para continuar sua jornada</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={formData.email_usuario}
                onChange={(e) => setFormData({ ...formData, email_usuario: e.target.value })}
                className="pl-10 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-0"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                value={formData.senha_usuario}
                onChange={(e) => setFormData({ ...formData, senha_usuario: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="pl-10 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-0"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#2dd4bf] hover:bg-[#0d9488] font-semibold text-black"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Não tem uma conta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-[#2dd4bf] hover:text-[#0d9488] font-semibold transition-colors"
            >
              Registre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const [formData, setFormData] = useState({
    nm_usuario: '',
    email_usuario: '',
    senha_usuario: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.nm_usuario || !formData.email_usuario || !formData.senha_usuario) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (formData.senha_usuario.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter no mínimo 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData);
      toast({
        title: "Conta criada com sucesso!",
        description: "Agora você pode fazer login",
      });
      setFormData({ nm_usuario: '', email_usuario: '', senha_usuario: '' });
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: error.message || "Email já cadastrado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-glass border-2 border-[#2dd4bf]/30 rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2dd4bf]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-[#2dd4bf]" />
          </div>
          <h2 className="font-pixel text-xl text-[#2dd4bf] mb-2">Crie sua conta</h2>
          <p className="text-muted-foreground text-sm">Junte-se à comunidade Checkpoint</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Nome de Usuário
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={formData.nm_usuario}
                onChange={(e) => setFormData({ ...formData, nm_usuario: e.target.value })}
                className="pl-10 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-0"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={formData.email_usuario}
                onChange={(e) => setFormData({ ...formData, email_usuario: e.target.value })}
                className="pl-10 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-0"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                value={formData.senha_usuario}
                onChange={(e) => setFormData({ ...formData, senha_usuario: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="pl-10 focus-visible:ring-[#2dd4bf] focus-visible:ring-offset-0"
                placeholder="••••••••"
              />
            </div>
            <p className="text-muted-foreground text-xs mt-1">Mínimo de 6 caracteres</p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#2dd4bf] hover:bg-[#0d9488] font-semibold text-black"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#2dd4bf] hover:text-[#0d9488] font-semibold transition-colors"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
