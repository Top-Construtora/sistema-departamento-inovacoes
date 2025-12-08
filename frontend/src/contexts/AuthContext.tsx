import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, LoginDTO } from '../types';
import { authService } from '../services';

interface AuthContextData {
  usuario: Usuario | null;
  loading: boolean;
  login: (data: LoginDTO) => Promise<Usuario>;
  logout: () => void;
  definirNovaSenha: (novaSenha: string) => Promise<Usuario>;
  isAuthenticated: boolean;
  deveTrocarSenha: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsuario = authService.getUsuario();
    if (storedUsuario) {
      setUsuario(storedUsuario);
    }
    setLoading(false);
  }, []);

  async function login(data: LoginDTO): Promise<Usuario> {
    const response = await authService.login(data);
    setUsuario(response.usuario);
    return response.usuario;
  }

  function logout() {
    setUsuario(null);
    authService.logout();
  }

  async function definirNovaSenha(novaSenha: string): Promise<Usuario> {
    const response = await authService.definirNovaSenha(novaSenha);
    setUsuario(response.usuario);
    return response.usuario;
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        login,
        logout,
        definirNovaSenha,
        isAuthenticated: !!usuario,
        deveTrocarSenha: !!usuario?.deve_trocar_senha,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
