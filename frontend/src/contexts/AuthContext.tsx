import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, LoginDTO } from '../types';
import { authService } from '../services';

interface AuthContextData {
  usuario: Usuario | null;
  loading: boolean;
  login: (data: LoginDTO) => Promise<Usuario>;
  logout: () => void;
  isAuthenticated: boolean;
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

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        login,
        logout,
        isAuthenticated: !!usuario,
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
