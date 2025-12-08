import { useState, useEffect, FormEvent } from 'react';
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
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../../components/ui';
import {
  SistemaAcesso,
  Credencial,
  CreateCredencialDTO,
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
  COMUNICACAO: 'Comunicacao',
  ANALYTICS: 'Analytics',
  CLOUD: 'Cloud',
  BANCO_DADOS: 'Banco de Dados',
  API_EXTERNA: 'API Externa',
  FERRAMENTA_INTERNA: 'Ferramenta Interna',
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

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCredencialDTO>({
    login: '',
    senha: '',
    ambiente: AmbienteCredencial.PRODUCAO,
  });

  // Senha revelada
  const [senhasReveladas, setSenhasReveladas] = useState<Record<string, string>>({});
  const [loadingSenha, setLoadingSenha] = useState<string | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

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

  async function handleRevelarSenha(credencialId: string) {
    if (senhasReveladas[credencialId]) {
      // Se ja esta revelada, esconder
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
    } catch (error) {
      console.error('Erro ao revelar senha:', error);
    } finally {
      setLoadingSenha(null);
    }
  }

  async function handleCopiarSenha(credencialId: string) {
    const senha = senhasReveladas[credencialId];
    if (!senha) return;

    await navigator.clipboard.writeText(senha);
    setCopiadoId(credencialId);
    setTimeout(() => setCopiadoId(null), 2000);
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
                      <div className={styles.credencialField}>
                        <label>Login</label>
                        <div className={styles.fieldValue}>
                          <code>{credencial.login}</code>
                        </div>
                      </div>

                      <div className={styles.credencialField}>
                        <label>Senha</label>
                        <div className={styles.senhaField}>
                          <code>
                            {senhasReveladas[credencial.id] || '••••••••••••'}
                          </code>
                          <div className={styles.senhaActions}>
                            <button
                              onClick={() => handleRevelarSenha(credencial.id)}
                              disabled={loadingSenha === credencial.id}
                            >
                              {loadingSenha === credencial.id ? (
                                '...'
                              ) : senhasReveladas[credencial.id] ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                            {senhasReveladas[credencial.id] && (
                              <button onClick={() => handleCopiarSenha(credencial.id)}>
                                {copiadoId === credencial.id ? (
                                  <Check size={16} />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
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
    </div>
  );
}
