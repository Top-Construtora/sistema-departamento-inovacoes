import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users,
  Edit3,
  Power,
  KeyRound,
  X,
  Shield,
  Crown,
  UserCheck,
  Briefcase,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { Usuario, PerfilUsuario } from '../../types';
import { usuarioService } from '../../services';
import styles from './styles.module.css';

const perfilLabels: Record<PerfilUsuario, string> = {
  LIDER: 'Líder',
  ANALISTA: 'Analista',
  EXTERNO: 'Externo',
};

type FilterType = 'TODOS' | 'LIDER' | 'ANALISTA' | 'EXTERNO' | 'ATIVOS' | 'INATIVOS';

interface EditModalData {
  id: string;
  nome: string;
  perfil: PerfilUsuario;
  setor: string;
}

interface CreateModalData {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  setor: string;
}

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('TODOS');

  // Modal states
  const [editModal, setEditModal] = useState<EditModalData | null>(null);
  const [passwordModal, setPasswordModal] = useState<{ id: string; nome: string } | null>(null);
  const [createModal, setCreateModal] = useState<CreateModalData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    try {
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar usuários
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.setor?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      if (filter === 'ATIVOS') {
        matchesFilter = usuario.ativo;
      } else if (filter === 'INATIVOS') {
        matchesFilter = !usuario.ativo;
      } else if (filter !== 'TODOS') {
        matchesFilter = usuario.perfil === filter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [usuarios, searchTerm, filter]);

  // Estatísticas
  const stats = useMemo(() => {
    const lideres = usuarios.filter(u => u.perfil === 'LIDER').length;
    const analistas = usuarios.filter(u => u.perfil === 'ANALISTA').length;
    const externos = usuarios.filter(u => u.perfil === 'EXTERNO').length;
    const ativos = usuarios.filter(u => u.ativo).length;
    return { lideres, analistas, externos, ativos, total: usuarios.length };
  }, [usuarios]);

  // Handlers
  async function handleToggleStatus(usuario: Usuario) {
    try {
      await usuarioService.alterarStatus(usuario.id, !usuario.ativo);
      setUsuarios(prev => prev.map(u =>
        u.id === usuario.id ? { ...u, ativo: !u.ativo } : u
      ));
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do usuário');
    }
  }

  async function handleSaveEdit() {
    if (!editModal) return;
    setSaving(true);
    try {
      const updated = await usuarioService.atualizar(editModal.id, {
        nome: editModal.nome,
        perfil: editModal.perfil,
        setor: editModal.setor || null,
      });
      setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u));
      setEditModal(null);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!passwordModal || !newPassword) return;
    if (newPassword.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      await usuarioService.resetarSenha(passwordModal.id, newPassword);
      alert('Senha resetada com sucesso!');
      setPasswordModal(null);
      setNewPassword('');
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      alert('Erro ao resetar senha');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateUser() {
    if (!createModal) return;
    if (!createModal.nome || !createModal.email || !createModal.senha) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    if (createModal.senha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      const novoUsuario = await usuarioService.criar({
        nome: createModal.nome,
        email: createModal.email,
        senha: createModal.senha,
        perfil: createModal.perfil,
        setor: createModal.setor || undefined,
      });
      setUsuarios(prev => [...prev, novoUsuario]);
      setCreateModal(null);
      setShowPassword(false);
      alert('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar usuário');
    } finally {
      setSaving(false);
    }
  }

  function openCreateModal() {
    setCreateModal({
      nome: '',
      email: '',
      senha: '',
      perfil: PerfilUsuario.EXTERNO,
      setor: '',
    });
    setShowPassword(false);
  }

  function getInitials(nome: string): string {
    return nome.split(' ').slice(0, 2).map(n => n.charAt(0).toUpperCase()).join('');
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Carregando usuários...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Usuários</h1>
            <p className={styles.subtitle}>
              Gerencie os usuários e permissões do sistema
            </p>
          </div>
          <button className={styles.btnCreate} onClick={openCreateModal}>
            <Plus size={18} />
            Novo Usuário
          </button>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div
            className={`${styles.statCard} ${styles.statCardTotal} ${filter === 'TODOS' ? styles.active : ''}`}
            onClick={() => setFilter('TODOS')}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Users size={20} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardLideres} ${filter === 'LIDER' ? styles.active : ''}`}
            onClick={() => setFilter(filter === 'LIDER' ? 'TODOS' : 'LIDER')}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Crown size={20} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.lideres}</span>
            <span className={styles.statLabel}>Líderes</span>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardAnalistas} ${filter === 'ANALISTA' ? styles.active : ''}`}
            onClick={() => setFilter(filter === 'ANALISTA' ? 'TODOS' : 'ANALISTA')}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <UserCheck size={20} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.analistas}</span>
            <span className={styles.statLabel}>Analistas</span>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardExternos} ${filter === 'EXTERNO' ? styles.active : ''}`}
            onClick={() => setFilter(filter === 'EXTERNO' ? 'TODOS' : 'EXTERNO')}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Briefcase size={20} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.externos}</span>
            <span className={styles.statLabel}>Externos</span>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardAtivos} ${filter === 'ATIVOS' ? styles.active : ''}`}
            onClick={() => setFilter(filter === 'ATIVOS' ? 'TODOS' : 'ATIVOS')}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <UserCheck size={20} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.ativos}</span>
            <span className={styles.statLabel}>Ativos</span>
          </div>
        </div>

        {/* Controles */}
        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar usuários..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filters}>
            <button
              className={`${styles.filterButton} ${filter === 'TODOS' ? styles.active : ''}`}
              onClick={() => setFilter('TODOS')}
            >
              Todos
              <span className={styles.filterCount}>{stats.total}</span>
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'ATIVOS' ? styles.active : ''}`}
              onClick={() => setFilter('ATIVOS')}
            >
              Ativos
              <span className={styles.filterCount}>{stats.ativos}</span>
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'INATIVOS' ? styles.active : ''}`}
              onClick={() => setFilter('INATIVOS')}
            >
              Inativos
              <span className={styles.filterCount}>{stats.total - stats.ativos}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabela ou Empty State */}
      {filteredUsuarios.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Users size={36} />
          </div>
          <h3 className={styles.emptyTitle}>
            {searchTerm || filter !== 'TODOS'
              ? 'Nenhum usuário encontrado'
              : 'Nenhum usuário cadastrado'}
          </h3>
          <p className={styles.emptyText}>
            {searchTerm || filter !== 'TODOS'
              ? 'Tente ajustar os filtros ou o termo de busca'
              : 'Quando novos usuários forem cadastrados, eles aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Setor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        {getInitials(usuario.nome)}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{usuario.nome}</span>
                        <span className={styles.userEmail}>{usuario.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.perfilBadge} ${styles[usuario.perfil.toLowerCase()]}`}>
                      <Shield size={12} />
                      {perfilLabels[usuario.perfil]}
                    </span>
                  </td>
                  <td>{usuario.setor || '-'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${usuario.ativo ? styles.ativo : styles.inativo}`}>
                      <span className={styles.statusDot} />
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.actionButton} ${styles.edit}`}
                        title="Editar usuário"
                        onClick={() => setEditModal({
                          id: usuario.id,
                          nome: usuario.nome,
                          perfil: usuario.perfil,
                          setor: usuario.setor || '',
                        })}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.toggle}`}
                        title={usuario.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                        onClick={() => handleToggleStatus(usuario)}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.password}`}
                        title="Resetar senha"
                        onClick={() => setPasswordModal({ id: usuario.id, nome: usuario.nome })}
                      >
                        <KeyRound size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Edição */}
      {editModal && (
        <div className={styles.modalOverlay} onClick={() => setEditModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Editar Usuário</h3>
              <button className={styles.modalClose} onClick={() => setEditModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nome</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editModal.nome}
                  onChange={(e) => setEditModal({ ...editModal, nome: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Perfil</label>
                <select
                  className={styles.formSelect}
                  value={editModal.perfil}
                  onChange={(e) => setEditModal({ ...editModal, perfil: e.target.value as PerfilUsuario })}
                >
                  <option value="LIDER">Líder</option>
                  <option value="ANALISTA">Analista</option>
                  <option value="EXTERNO">Externo</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Setor</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editModal.setor}
                  onChange={(e) => setEditModal({ ...editModal, setor: e.target.value })}
                  placeholder="Ex: Engenharia, Comercial..."
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setEditModal(null)}>
                Cancelar
              </button>
              <button
                className={styles.btnSave}
                onClick={handleSaveEdit}
                disabled={saving || !editModal.nome}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reset de Senha */}
      {passwordModal && (
        <div className={styles.modalOverlay} onClick={() => setPasswordModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Resetar Senha</h3>
              <button className={styles.modalClose} onClick={() => { setPasswordModal(null); setNewPassword(''); }}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                Definir nova senha para <strong style={{ color: '#f8fafc' }}>{passwordModal.nome}</strong>
              </p>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nova Senha</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => { setPasswordModal(null); setNewPassword(''); }}>
                Cancelar
              </button>
              <button
                className={styles.btnSave}
                onClick={handleResetPassword}
                disabled={saving || newPassword.length < 6}
              >
                {saving ? 'Salvando...' : 'Resetar Senha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar Usuário */}
      {createModal && (
        <div className={styles.modalOverlay} onClick={() => setCreateModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Novo Usuário</h3>
              <button className={styles.modalClose} onClick={() => { setCreateModal(null); setShowPassword(false); }}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nome *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={createModal.nome}
                  onChange={(e) => setCreateModal({ ...createModal, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email *</label>
                <input
                  type="email"
                  className={styles.formInput}
                  value={createModal.email}
                  onChange={(e) => setCreateModal({ ...createModal, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Senha *</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={styles.formInput}
                    value={createModal.senha}
                    onChange={(e) => setCreateModal({ ...createModal, senha: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Perfil</label>
                <select
                  className={styles.formSelect}
                  value={createModal.perfil}
                  onChange={(e) => setCreateModal({ ...createModal, perfil: e.target.value as PerfilUsuario })}
                >
                  <option value="EXTERNO">Externo</option>
                  <option value="ANALISTA">Analista</option>
                  <option value="LIDER">Líder</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Setor</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={createModal.setor}
                  onChange={(e) => setCreateModal({ ...createModal, setor: e.target.value })}
                  placeholder="Ex: Engenharia, Comercial..."
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => { setCreateModal(null); setShowPassword(false); }}>
                Cancelar
              </button>
              <button
                className={styles.btnSave}
                onClick={handleCreateUser}
                disabled={saving || !createModal.nome || !createModal.email || createModal.senha.length < 6}
              >
                {saving ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
