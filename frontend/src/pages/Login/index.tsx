import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts';
import { PerfilUsuario } from '../../types';
import styles from './styles.module.css';

export function Login() {
  const { login, isAuthenticated, usuario } = useAuth();
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const brandingRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isAuthenticated && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isAuthenticated]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (brandingRef.current) {
      const rect = brandingRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
    }
  }

  if (isAuthenticated && usuario) {
    const destino = usuario.perfil === PerfilUsuario.EXTERNO
      ? '/meus-chamados'
      : '/dashboard';
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usuarioLogado = await login({ email, senha });
      const destino = usuarioLogado.perfil === PerfilUsuario.EXTERNO
        ? '/meus-chamados'
        : '/dashboard';
      navigate(destino);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* Luz ambiente de fundo */}
      <div className={styles.ambientLight} />

      {/* Partículas flutuantes */}
      <div className={styles.particles}>
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
      </div>

      {/* Conteúdo */}
      <div className={styles.content}>
        {/* Lado esquerdo - Branding */}
        <div
          ref={brandingRef}
          className={styles.brandingSide}
          onMouseMove={handleMouseMove}
        >
          {/* Glow que segue o mouse */}
          <div
            className={styles.mouseGlow}
            style={{
              left: mousePos.x,
              top: mousePos.y,
            }}
          />

          {/* Logo no topo esquerdo */}
          <div className={styles.logoHeader}>
            <div className={styles.logoContainer}>
              <img src="/images/logo.png" alt="GIO" />
            </div>
          </div>

          {/* Título centralizado */}
          <div className={styles.brandingCenter}>
            <h1 className={styles.brandingTitle}>
              <span className={styles.titleWhite}>Inovações e </span>
              <span className={styles.titleGradient}>Tecnologia</span>
            </h1>
            <p className={styles.brandingSubtitle}>
              Plataforma interna do Departamento de Inovações e Tecnologia
            </p>
          </div>

        </div>

        {/* Lado direito - Formulário */}
        <div className={styles.formSide}>
          <div className={styles.formWrapper}>
            {/* Logo mobile */}
            <div className={styles.mobileLogo}>
              <div className={styles.mobileLogoIcon}>
                <img src="/images/logo.png" alt="Logo" />
              </div>
              <span className={styles.mobileLogoText}>GIO</span>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Bem-vindo!</h2>
                <p className={styles.cardSubtitle}>Entre com suas credenciais para acessar</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                {error && (
                  <div className={styles.errorBox}>
                    <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>
                    E-mail
                  </label>
                  <div className={styles.inputWrapper}>
                    <input
                      ref={emailInputRef}
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className={styles.input}
                      required
                      autoComplete="email"
                    />
                    <Mail size={18} className={styles.inputIcon} />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Senha
                  </label>
                  <div className={`${styles.inputWrapper} ${styles.passwordWrapper}`}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Digite sua senha"
                      className={styles.input}
                      required
                      autoComplete="current-password"
                    />
                    <Lock size={18} className={styles.inputIcon} />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitButton}
                >
                  <span>
                    {loading ? (
                      <>
                        <Loader2 size={18} className={styles.spinner} />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </span>
                </button>
              </form>

              <div className={styles.cardFooter}>
                <p>Inovações e Tecnologia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
