import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  User,
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  Edit3,
  Loader2,
  Shield,
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../../components/ui';
import {
  SistemaAcesso,
  Credencial,
  CreateCredencialDTO,
  CreateSistemaAcessoDTO,
  AmbienteCredencial,
  TipoSistemaAcesso,
  Usuario,
} from '../../types';
import { sistemaAcessoService, usuarioService } from '../../services';
import styles from './styles.module.css';

const tipoLabels: Record<TipoSistemaAcesso, string> = {
  PLATAFORMA_CURSO: 'Plataforma de Curso',
  DESENVOLVIMENTO: 'Desenvolvimento',
  INFRA: 'Infraestrutura',
  COMUNICACAO: 'Comunicação',
  ANALYTICS: 'Analytics',
  CLOUD: 'Cloud',
  BANCO_DADOS: 'Banco de Dados',
  API_EXTERNA: 'API Externa',
  FERRAMENTA_INTERNA: 'Ferramenta Interna',
  SISTEMA_EXTERNO: 'Sistema Externo',
  SISTEMA_INTERNO: 'Sistema Interno',
  OUTRO: 'Outro',
};

const ambienteLabels: Record<AmbienteCredencial, string> = {
  PRODUCAO: 'Producao',
  HOMOLOGACAO: 'Homologacao',
  DESENVOLVIMENTO: 'Desenvolvimento',
};

const ambienteColors: Record<AmbienteCredencial, string> = {
  PRODUCAO: '#ef4444',
  HOMOLOGACAO: '#f59e0b',
  DESENVOLVIMENTO: '#22c55e',
};

export function SistemaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sistema, setSistema] = useState<SistemaAcesso | null>(null);
  const [credenciais, setCredenciais] = useState<Credencial[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Modal states - Credencial
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCredencialDTO>({
    login: '',
    senha: '',
    ambiente: AmbienteCredencial.PRODUCAO,
  });

  // Modal states - Sistema (editar/excluir)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editData, setEditData] = useState<CreateSistemaAcessoDTO>({
    nome: '',
    url: '',
    tipo: TipoSistemaAcesso.OUTRO,
    observacoes: '',
    instrucoes_acesso: '',
  });

  // Senha revelada
  const [senhasReveladas, setSenhasReveladas] = useState<Record<string, string>>({});
  const [loadingSenha, setLoadingSenha] = useState<string | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [loginCopiado, setLoginCopiado] = useState<string | null>(null);
  const senhaTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (id) {
      loadSistema();
      loadCredenciais();
      loadUsuarios();
    }
  }, [id]);

  async function loadSistema() {
    try {
      setLoading(true);
      const data = await sistemaAcessoService.buscarPorId(id!);
      setSistema(data);
    } catch (error) {
      console.error('Erro ao carregar sistema:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCredenciais() {
    try {
      const data = await sistemaAcessoService.listarCredenciais(id!);
      setCredenciais(data);
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
    }
  }

  async function loadUsuarios() {
    try {
      const data = await usuarioService.listarInternos();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuarios:', error);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);

    try {
      await sistemaAcessoService.criarCredencial(id!, formData);
      setFormData({
        login: '',
        senha: '',
        ambiente: AmbienteCredencial.PRODUCAO,
      });
      setIsFormOpen(false);
      loadCredenciais();
    } catch (error) {
      console.error('Erro ao criar credencial:', error);
    } finally {
      setFormLoading(false);
    }
  }

  // Limpa timers quando o componente desmonta
  useEffect(() => {
    return () => {
      Object.values(senhaTimers.current).forEach(clearTimeout);
    };
  }, []);

  const ocultarSenhaAutomaticamente = useCallback((credencialId: string) => {
    // Limpa timer anterior se existir
    if (senhaTimers.current[credencialId]) {
      clearTimeout(senhaTimers.current[credencialId]);
    }

    // Oculta a senha apos 30 segundos
    senhaTimers.current[credencialId] = setTimeout(() => {
      setSenhasReveladas((prev) => {
        const { [credencialId]: _, ...rest } = prev;
        return rest;
      });
    }, 30000);
  }, []);

  async function handleRevelarSenha(credencialId: string) {
    if (senhasReveladas[credencialId]) {
      // Se ja esta revelada, esconder e limpar timer
      if (senhaTimers.current[credencialId]) {
        clearTimeout(senhaTimers.current[credencialId]);
        delete senhaTimers.current[credencialId];
      }
      setSenhasReveladas((prev) => {
        const { [credencialId]: _, ...rest } = prev;
        return rest;
      });
      return;
    }

    setLoadingSenha(credencialId);
    try {
      const senha = await sistemaAcessoService.revelarSenha(credencialId);
      setSenhasReveladas((prev) => ({ ...prev, [credencialId]: senha }));
      ocultarSenhaAutomaticamente(credencialId);
    } catch (error) {
      console.error('Erro ao revelar senha:', error);
    } finally {
      setLoadingSenha(null);
    }
  }

  async function handleCopiarSenha(credencialId: string) {
    const senha = senhasReveladas[credencialId];
    if (!senha) {
      // Se a senha nao esta revelada, revela e copia
      setLoadingSenha(credencialId);
      try {
        const senhaRevelada = await sistemaAcessoService.revelarSenha(credencialId);
        await navigator.clipboard.writeText(senhaRevelada);
        setCopiadoId(credencialId);
        setTimeout(() => setCopiadoId(null), 2000);
        // Nao revela visualmente, apenas copia
      } catch (error) {
        console.error('Erro ao copiar senha:', error);
      } finally {
        setLoadingSenha(null);
      }
      return;
    }

    await navigator.clipboard.writeText(senha);
    setCopiadoId(credencialId);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  async function handleCopiarLogin(credencialId: string, login: string) {
    await navigator.clipboard.writeText(login);
    setLoginCopiado(credencialId);
    setTimeout(() => setLoginCopiado(null), 2000);
  }

  async function handleExcluirCredencial(credencialId: string) {
    if (!confirm('Tem certeza que deseja excluir esta credencial?')) return;

    try {
      await sistemaAcessoService.excluirCredencial(credencialId);
      loadCredenciais();
    } catch (error) {
      console.error('Erro ao excluir credencial:', error);
    }
  }

  function handleOpenEdit() {
    if (sistema) {
      setEditData({
        nome: sistema.nome,
        url: sistema.url || '',
        tipo: sistema.tipo,
        observacoes: sistema.observacoes || '',
        instrucoes_acesso: sistema.instrucoes_acesso || '',
        responsavel_id: sistema.responsavel_id || undefined,
      });
      setIsEditOpen(true);
    }
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    setEditLoading(true);

    try {
      await sistemaAcessoService.atualizar(id!, editData);
      setIsEditOpen(false);
      loadSistema();
    } catch (error) {
      console.error('Erro ao atualizar sistema:', error);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);

    try {
      await sistemaAcessoService.excluir(id!);
      navigate('/sistemas-acesso');
    } catch (error) {
      console.error('Erro ao excluir sistema:', error);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  if (!sistema) {
    return (
      <div className={styles.notFound}>
        <AlertCircle size={48} />
        <h2>Sistema nao encontrado</h2>
        <Button onClick={() => navigate('/sistemas-acesso')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/sistemas-acesso')}>
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div className={styles.headerActions}>
          <Button variant="ghost" size="sm" onClick={handleOpenEdit}>
            <Edit3 size={16} />
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 size={16} />
            Excluir
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.main}>
          <div className={styles.titleSection}>
            <div className={styles.titleHeader}>
              <h1 className={styles.title}>{sistema.nome}</h1>
              {sistema.url && (
                <a
                  href={sistema.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.urlLink}
                >
                  <ExternalLink size={18} />
                  Acessar
                </a>
              )}
            </div>
            <span className={styles.tipo}>{tipoLabels[sistema.tipo]}</span>
          </div>

          {sistema.observacoes && (
            <div className={styles.section}>
              <h3>Descricao</h3>
              <p>{sistema.observacoes}</p>
            </div>
          )}

          {sistema.instrucoes_acesso && (
            <div className={styles.section}>
              <h3>Instrucoes de Acesso</h3>
              <div className={styles.instrucoes}>{sistema.instrucoes_acesso}</div>
            </div>
          )}

          {/* Credenciais */}
          <div className={styles.credenciaisSection}>
            <div className={styles.credenciaisHeader}>
              <h3>
                <Key size={20} />
                Credenciais
              </h3>
              <Button size="sm" onClick={() => setIsFormOpen(true)}>
                <Plus size={16} />
                Nova Credencial
              </Button>
            </div>

            {credenciais.length === 0 ? (
              <div className={styles.emptyCredenciais}>
                <Key size={32} />
                <p>Nenhuma credencial cadastrada</p>
              </div>
            ) : (
              <div className={styles.credenciaisList}>
                {credenciais.map((credencial) => (
                  <div key={credencial.id} className={styles.credencialCard}>
                    <div className={styles.credencialHeader}>
                      <div className={styles.credencialInfo}>
                        {credencial.descricao && (
                          <span className={styles.credencialDescricao}>
                            {credencial.descricao}
                          </span>
                        )}
                        <span
                          className={styles.ambiente}
                          style={{
                            background: `${ambienteColors[credencial.ambiente]}20`,
                            color: ambienteColors[credencial.ambiente],
                          }}
                        >
                          {ambienteLabels[credencial.ambiente]}
                        </span>
                      </div>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleExcluirCredencial(credencial.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className={styles.credencialBody}>
                      {/* Campo Login */}
                      <div className={styles.credencialField}>
                        <label>Login</label>
                        <div className={styles.fieldWithCopy}>
                          <code>{credencial.login}</code>
                          <button
                            className={`${styles.copyButton} ${loginCopiado === credencial.id ? styles.copied : ''}`}
                            onClick={() => handleCopiarLogin(credencial.id, credencial.login)}
                            title="Copiar login"
                          >
                            {loginCopiado === credencial.id ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Campo Senha - Redesenhado */}
                      <div className={styles.credencialField}>
                        <label>
                          <Shield size={12} />
                          Senha
                        </label>
                        <div className={`${styles.senhaContainer} ${senhasReveladas[credencial.id] ? styles.revealed : ''}`}>
                          <div className={styles.senhaContent}>
                            {loadingSenha === credencial.id ? (
                              <div className={styles.senhaLoading}>
                                <Loader2 size={16} className={styles.spinner} />
                                <span>Carregando...</span>
                              </div>
                            ) : senhasReveladas[credencial.id] ? (
                              <code className={styles.senhaText}>
                                {senhasReveladas[credencial.id]}
                              </code>
                            ) : (
                              <span className={styles.senhaMasked}>
                                ••••••••••••
                              </span>
                            )}
                          </div>
                          <div className={styles.senhaActions}>
                            <button
                              className={`${styles.senhaBtn} ${styles.viewBtn}`}
                              onClick={() => handleRevelarSenha(credencial.id)}
                              disabled={loadingSenha === credencial.id}
                              title={senhasReveladas[credencial.id] ? 'Ocultar senha' : 'Revelar senha'}
                            >
                              {senhasReveladas[credencial.id] ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                            <button
                              className={`${styles.senhaBtn} ${styles.copyBtn} ${copiadoId === credencial.id ? styles.copied : ''}`}
                              onClick={() => handleCopiarSenha(credencial.id)}
                              disabled={loadingSenha === credencial.id}
                              title={copiadoId === credencial.id ? 'Copiado!' : 'Copiar senha'}
                            >
                              {copiadoId === credencial.id ? (
                                <Check size={16} />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                        {senhasReveladas[credencial.id] && (
                          <span className={styles.senhaTimer}>
                            A senha sera ocultada automaticamente em 30s
                          </span>
                        )}
                      </div>

                      {(credencial.usuario_referente || credencial.usuario_referente_nome) && (
                        <div className={styles.credencialField}>
                          <label>Usuario Referente</label>
                          <div className={styles.fieldValue}>
                            <User size={14} />
                            {credencial.usuario_referente?.nome || credencial.usuario_referente_nome}
                          </div>
                        </div>
                      )}

                      {credencial.observacoes && (
                        <div className={styles.credencialObs}>
                          {credencial.observacoes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3>Informacoes</h3>

            {sistema.responsavel && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Responsavel</span>
                <span className={styles.infoValue}>
                  <User size={14} />
                  {sistema.responsavel.nome}
                </span>
              </div>
            )}

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tipo</span>
              <span className={styles.infoValue}>{tipoLabels[sistema.tipo]}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Credenciais</span>
              <span className={styles.infoValue}>{credenciais.length}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Criado em</span>
              <span className={styles.infoValue}>
                {new Date(sistema.data_criacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de nova credencial */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Nova Credencial"
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Descricao"
            value={formData.descricao || ''}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Ex: Acesso Admin, API Key..."
          />

          <Input
            label="Login"
            value={formData.login}
            onChange={(e) => setFormData({ ...formData, login: e.target.value })}
            placeholder="Usuario ou email de acesso"
            required
          />

          <Input
            label="Senha"
            type="password"
            value={formData.senha}
            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            placeholder="Senha de acesso"
            required
          />

          <Select
            label="Ambiente"
            value={formData.ambiente}
            onChange={(e) => setFormData({ ...formData, ambiente: e.target.value as AmbienteCredencial })}
            options={Object.entries(ambienteLabels).map(([value, label]) => ({ value, label }))}
          />

          <Select
            label="Usuario Referente"
            value={formData.usuario_referente_id || ''}
            onChange={(e) => setFormData({ ...formData, usuario_referente_id: e.target.value || undefined })}
            options={[
              { value: '', label: 'Nenhum' },
              ...usuarios.map((u) => ({ value: u.id, label: u.nome })),
            ]}
          />

          <Input
            label="Ou nome do usuario"
            value={formData.usuario_referente_nome || ''}
            onChange={(e) => setFormData({ ...formData, usuario_referente_nome: e.target.value })}
            placeholder="Se nao for usuario do sistema..."
          />

          <div className={styles.textareaWrapper}>
            <label>Observacoes</label>
            <textarea
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informacoes adicionais..."
              rows={3}
            />
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={formLoading}>
              Criar Credencial
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de editar sistema */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Sistema"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className={styles.form}>
          <Input
            label="Nome"
            value={editData.nome}
            onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
            placeholder="Nome do sistema"
            required
          />

          <Input
            label="URL"
            type="url"
            value={editData.url || ''}
            onChange={(e) => setEditData({ ...editData, url: e.target.value })}
            placeholder="https://..."
          />

          <Select
            label="Tipo"
            value={editData.tipo}
            onChange={(e) => setEditData({ ...editData, tipo: e.target.value as TipoSistemaAcesso })}
            options={Object.entries(tipoLabels).map(([value, label]) => ({ value, label }))}
          />

          <Select
            label="Responsável"
            value={editData.responsavel_id || ''}
            onChange={(e) => setEditData({ ...editData, responsavel_id: e.target.value || undefined })}
            options={[
              { value: '', label: 'Selecione...' },
              ...usuarios.map((u) => ({ value: u.id, label: u.nome })),
            ]}
          />

          <div className={styles.textareaWrapper}>
            <label>Observações</label>
            <textarea
              value={editData.observacoes || ''}
              onChange={(e) => setEditData({ ...editData, observacoes: e.target.value })}
              placeholder="Descrição do sistema..."
              rows={3}
            />
          </div>

          <div className={styles.textareaWrapper}>
            <label>Instruções de Acesso</label>
            <textarea
              value={editData.instrucoes_acesso || ''}
              onChange={(e) => setEditData({ ...editData, instrucoes_acesso: e.target.value })}
              placeholder="Como acessar o sistema..."
              rows={3}
            />
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={editLoading}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Excluir Sistema"
        size="sm"
      >
        <div className={styles.deleteConfirm}>
          <AlertCircle size={48} className={styles.deleteIcon} />
          <p>Tem certeza que deseja excluir o sistema <strong>{sistema.nome}</strong>?</p>
          <p className={styles.deleteWarning}>
            Esta ação não pode ser desfeita. Todas as credenciais associadas também serão excluídas.
          </p>
          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
              Excluir Sistema
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
