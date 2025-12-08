import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts';
import { authService } from '../../services';
import { PerfilUsuario } from '../../types';
import styles from './styles.module.css';

type Mode = 'login' | 'register';

export function Login() {
  const { login, isAuthenticated, usuario } = useAuth();
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nomeInputRef = useRef<HTMLInputElement>(null);
  const brandingRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [setor, setSetor] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isAuthenticated) {
      if (mode === 'login' && emailInputRef.current) {
        emailInputRef.current.focus();
      } else if (mode === 'register' && nomeInputRef.current) {
        nomeInputRef.current.focus();
      }
    }
  }, [isAuthenticated, mode]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (brandingRef.current) {
      const rect = brandingRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
    }
  }

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setError('');
    setSuccess('');
    setEmail('');
    setSenha('');
    setNome('');
    setSetor('');
  }

  if (isAuthenticated && usuario) {
    const destino = usuario.perfil === PerfilUsuario.EXTERNO
      ? '/chamados'
      : '/dashboard';
    return <Navigate to={destino} replace />;
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usuarioLogado = await login({ email, senha });
      const destino = usuarioLogado.perfil === PerfilUsuario.EXTERNO
        ? '/chamados'
        : '/dashboard';
      navigate(destino);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await authService.register({ nome, email, senha, setor: setor || undefined });
      setSuccess('Conta criada com sucesso! Faça login para continuar.');
      setTimeout(() => {
        switchMode('login');
        setEmail(email);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
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
                <h2 className={styles.cardTitle}>
                  {mode === 'login' ? 'Bem-vindo!' : 'Criar Conta'}
                </h2>
                <p className={styles.cardSubtitle}>
                  {mode === 'login'
                    ? 'Entre com suas credenciais para acessar'
                    : 'Preencha os dados para se cadastrar'}
                </p>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className={styles.form}>
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
              ) : (
                <form onSubmit={handleRegister} className={styles.form}>
                  {error && (
                    <div className={styles.errorBox}>
                      <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className={styles.successBox}>
                      <CheckCircle size={18} className={styles.successIcon} />
                      <span>{success}</span>
                    </div>
                  )}

                  <div className={styles.inputGroup}>
                    <label htmlFor="nome" className={styles.label}>
                      Nome completo
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        ref={nomeInputRef}
                        id="nome"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome completo"
                        className={styles.input}
                        required
                        autoComplete="name"
                      />
                      <User size={18} className={styles.inputIcon} />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="register-email" className={styles.label}>
                      E-mail
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        id="register-email"
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
                    <label htmlFor="setor" className={styles.label}>
                      Setor <span className={styles.optional}>(opcional)</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        id="setor"
                        type="text"
                        value={setor}
                        onChange={(e) => setSetor(e.target.value)}
                        placeholder="Ex: Engenharia, Comercial..."
                        className={styles.input}
                        autoComplete="organization"
                      />
                      <Building2 size={18} className={styles.inputIcon} />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="register-password" className={styles.label}>
                      Senha
                    </label>
                    <div className={`${styles.inputWrapper} ${styles.passwordWrapper}`}>
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className={styles.input}
                        required
                        minLength={6}
                        autoComplete="new-password"
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
                    disabled={loading || !!success}
                    className={styles.submitButton}
                  >
                    <span>
                      {loading ? (
                        <>
                          <Loader2 size={18} className={styles.spinner} />
                          Criando conta...
                        </>
                      ) : (
                        'Criar conta'
                      )}
                    </span>
                  </button>
                </form>
              )}

              {/* Toggle entre login e registro */}
              <div className={styles.modeToggle}>
                {mode === 'login' ? (
                  <p>
                    Não tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className={styles.modeToggleButton}
                    >
                      Cadastre-se
                    </button>
                  </p>
                ) : (
                  <p>
                    Já tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className={styles.modeToggleButton}
                    >
                      Entrar
                    </button>
                  </p>
                )}
              </div>

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
