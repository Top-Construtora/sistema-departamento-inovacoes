import { useState } from 'react';
import { Eye, EyeOff, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts';
import styles from './styles.module.css';

export function DefinirSenhaModal() {
  const { deveTrocarSenha, definirNovaSenha, usuario } = useAuth();
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  if (!deveTrocarSenha) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await definirNovaSenha(senha);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao definir senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <KeyRound size={32} />
          </div>
          <h2 className={styles.title}>Definir Nova Senha</h2>
          <p className={styles.subtitle}>
            Olá, <strong>{usuario?.nome.split(' ')[0]}</strong>! Por segurança, defina uma nova senha para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Lock size={16} />
              Nova Senha
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showSenha ? 'text' : 'password'}
                className={styles.input}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoFocus
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowSenha(!showSenha)}
              >
                {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Lock size={16} />
              Confirmar Senha
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showConfirmar ? 'text' : 'password'}
                className={styles.input}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Digite a senha novamente"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmar(!showConfirmar)}
              >
                {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {erro && <p className={styles.erro}>{erro}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || senha.length < 6 || senha !== confirmarSenha}
          >
            {loading ? 'Salvando...' : 'Definir Senha e Continuar'}
          </button>
        </form>

        <p className={styles.info}>
          Esta é uma medida de segurança para proteger sua conta.
        </p>
      </div>
    </div>
  );
}
