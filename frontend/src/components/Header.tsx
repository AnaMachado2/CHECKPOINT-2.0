// components/Header.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import { LoginModal, RegisterModal } from "@/components/AuthModals";

export const Header = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginSuccess = () => setUser(authService.getCurrentUser());
  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  useEffect(() => {
    authService.initializeAuth();
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#0a1f17] border-b border-[#0d241a] z-50">
        <div className="px-6 lg:px-12 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 overflow-hidden flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

            <span className="font-pixel text-2xl text-[#f0f7f4] tracking-tight">
              Checkpoint
            </span>
          </Link>


          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-3">
            <Link
              to="/games"
              className="px-5 py-2.5 rounded-lg text-[#f0f7f4] font-medium bg-[#0d241a]/70 hover:bg-[#2dd4bf] hover:text-black transition-all duration-300"
            >
              Jogos
            </Link>
            <Link
              to="/lists"
              className="px-5 py-2.5 rounded-lg text-[#f0f7f4] font-medium bg-[#0d241a]/70 hover:bg-[#2dd4bf] hover:text-black transition-all duration-300"
            >
              Listas
            </Link>
            {user && (
              <Link
                to={`/profile/${user.id_usuario}`}
                className="px-5 py-2.5 rounded-lg text-[#f0f7f4] font-medium bg-[#0d241a]/70 hover:bg-[#2dd4bf] hover:text-black transition-all duration-300"
              >
                Perfil
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3 bg-[#0d241a] border border-[#2dd4bf]/40 rounded-lg px-4 py-2">
                  <User className="w-4 h-4 text-[#2dd4bf]" />
                  <span className="text-[#f0f7f4] font-medium text-sm">{user.nm_usuario}</span>
                  {user.tipo_usuario === "admin" && (
                    <span className="bg-[#2dd4bf] text-black text-xs px-2 py-0.5 rounded-full font-bold">
                      ADMIN
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-[#f0f7f4] hover:text-white p-2"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                {/* BOTÃO ENTRAR AGORA EM TEAL */}
                <Button
                  onClick={() => setLoginOpen(true)}
                  variant="ghost"
                  className="text-[#f0f7f4] hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 px-5 py-2 text-sm font-medium rounded-lg transition-all"
                >
                  Entrar
                </Button>

                <Button
                  onClick={() => setRegisterOpen(true)}
                  className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold px-6 py-2.5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
                >
                  Criar Conta
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-[#f0f7f4] hover:text-[#2dd4bf]"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a1f17] border-t border-[#0d241a]">
            <div className="px-6 py-6 space-y-4">
              <Link to="/games" className="block text-[#f0f7f4] text-lg font-medium py-3 hover:text-[#2dd4bf]">Jogos</Link>
              <Link to="/lists" className="block text-[#f0f7f4] text-lg font-medium py-3 hover:text-[#2dd4bf]">Listas</Link>
              {user && <Link to={`/profile/${user.id_usuario}`} className="block text-[#f0f7f4] text-lg font-medium py-3 hover:text-[#2dd4bf]">Perfil</Link>}
              {!user && (
                <>
                  <Button
                    onClick={() => { setLoginOpen(true); setMobileMenuOpen(false); }}
                    className="w-full border border-[#2dd4bf] text-[#2dd4bf] hover:bg-[#2dd4bf] hover:text-black font-bold py-5 text-lg rounded-lg transition-all"
                  >
                    Entrar
                  </Button>
                  <Button
                    onClick={() => { setRegisterOpen(true); setMobileMenuOpen(false); }}
                    className="w-full bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold py-5 text-lg rounded-lg"
                  >
                    Criar Conta
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }} onLoginSuccess={handleLoginSuccess} />
      <RegisterModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }} />
    </>
  );
};
