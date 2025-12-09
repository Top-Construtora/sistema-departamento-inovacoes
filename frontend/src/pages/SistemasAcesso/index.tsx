import { useState, useEffect, useMemo, FormEvent, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ExternalLink,
  Server,
  Cloud,
  Database,
  Code,
  BookOpen,
  Wrench,
  Link2,
  Search,
  Globe,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  Layers,
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../../components/ui';
import { SistemaAcesso, TipoSistemaAcesso, CreateSistemaAcessoDTO, Usuario, Credencial } from '../../types';
import { sistemaAcessoService, usuarioService } from '../../services';
import styles from './styles.module.css';

const tipoLabels: Partial<Record<TipoSistemaAcesso, string>> = {
  PLATAFORMA_CURSO: 'Plataforma de Curso',
  DESENVOLVIMENTO: 'Desenvolvimento',
  INFRA: 'Infraestrutura',
  CLOUD: 'Cloud',
  BANCO_DADOS: 'Banco de Dados',
  API_EXTERNA: 'API Externa',
  FERRAMENTA_INTERNA: 'Ferramenta Interna',
  SISTEMA_EXTERNO: 'Sistema Externo',
  SISTEMA_INTERNO: 'Sistema Interno',
  OUTRO: 'Outro',
};

const tipoIcons: Partial<Record<TipoSistemaAcesso, typeof Server>> = {
  PLATAFORMA_CURSO: BookOpen,
  DESENVOLVIMENTO: Code,
  INFRA: Server,
  CLOUD: Cloud,
  BANCO_DADOS: Database,
  API_EXTERNA: Link2,
  FERRAMENTA_INTERNA: Wrench,
  SISTEMA_EXTERNO: Globe,
  SISTEMA_INTERNO: Layers,
  OUTRO: Server,
};

const tipoColors: Partial<Record<TipoSistemaAcesso, string>> = {
  PLATAFORMA_CURSO: '#8b5cf6',    // Roxo
  DESENVOLVIMENTO: '#3b82f6',     // Azul
  INFRA: '#6b7280',               // Cinza
  CLOUD: '#06b6d4',               // Ciano
  BANCO_DADOS: '#ef4444',         // Vermelho
  API_EXTERNA: '#14b8a6',         // Teal
  FERRAMENTA_INTERNA: '#f97316',  // Laranja
  SISTEMA_EXTERNO: '#64748b',     // Slate/Cinza azulado
  SISTEMA_INTERNO: '#ec4899',     // Rosa
  OUTRO: '#78716c',               // Marrom/Cinza
};

export function SistemasAcesso() {
  const navigate = useNavigate();
  const [sistemas, setSistemas] = useState<SistemaAcesso[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Credenciais por sistema (primeira credencial de cada)
  const [credenciaisPorSistema, setCredenciaisPorSistema] = useState<Record<string, Credencial | null>>({});

  // Senhas reveladas e copiadas
  const [senhasReveladas, setSenhasReveladas] = useState<Record<string, string>>({});
  const [loadingSenha, setLoadingSenha] = useState<string | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [loginCopiado, setLoginCopiado] = useState<string | null>(null);
  const senhaTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Form state
  const [formData, setFormData] = useState<CreateSistemaAcessoDTO>({
    nome: '',
    url: '',
    tipo: TipoSistemaAcesso.OUTRO,
    observacoes: '',
    instrucoes_acesso: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadSistemas();
    loadUsuarios();
  }, []);

  // Limpa timers quando o componente desmonta
  useEffect(() => {
    return () => {
      Object.values(senhaTimers.current).forEach(clearTimeout);
    };
  }, []);

  async function loadSistemas() {
    try {
      setLoading(true);
      const data = await sistemaAcessoService.listar();
      setSistemas(data);

      // Carregar primeira credencial de cada sistema
      const credenciais: Record<string, Credencial | null> = {};
      await Promise.all(
        data.map(async (sistema) => {
          try {
            const creds = await sistemaAcessoService.listarCredenciais(sistema.id);
            credenciais[sistema.id] = creds.length > 0 ? creds[0] : null;
          } catch {
            credenciais[sistema.id] = null;
          }
        })
      );
      setCredenciaisPorSistema(credenciais);
    } catch (error) {
      console.error('Erro ao carregar sistemas:', error);
    } finally {
      setLoading(false);
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
      await sistemaAcessoService.criar(formData);
      setFormData({
        nome: '',
        url: '',
        tipo: TipoSistemaAcesso.OUTRO,
        observacoes: '',
        instrucoes_acesso: '',
      });
      setIsFormOpen(false);
      loadSistemas();
    } catch (error) {
      console.error('Erro ao criar sistema:', error);
    } finally {
      setFormLoading(false);
    }
  }

  // Ordem dos tipos para agrupamento
  const ordemTipos: TipoSistemaAcesso[] = [
    TipoSistemaAcesso.PLATAFORMA_CURSO,
    TipoSistemaAcesso.DESENVOLVIMENTO,
    TipoSistemaAcesso.CLOUD,
    TipoSistemaAcesso.INFRA,
    TipoSistemaAcesso.BANCO_DADOS,
    TipoSistemaAcesso.API_EXTERNA,
    TipoSistemaAcesso.FERRAMENTA_INTERNA,
    TipoSistemaAcesso.SISTEMA_INTERNO,
    TipoSistemaAcesso.SISTEMA_EXTERNO,
    TipoSistemaAcesso.OUTRO,
  ];

  // Filtrar e ordenar sistemas por tipo
  const sistemasFiltrados = useMemo(() => {
    const filtrados = sistemas.filter((sistema) => {
      const matchBusca = sistema.nome.toLowerCase().includes(busca.toLowerCase()) ||
        sistema.observacoes?.toLowerCase().includes(busca.toLowerCase());
      const matchTipo = !filtroTipo || sistema.tipo === filtroTipo;
      return matchBusca && matchTipo;
    });

    // Ordenar por tipo (ordem definida) e depois por nome
    return filtrados.sort((a, b) => {
      const ordemA = ordemTipos.indexOf(a.tipo);
      const ordemB = ordemTipos.indexOf(b.tipo);
      if (ordemA !== ordemB) return ordemA - ordemB;
      return a.nome.localeCompare(b.nome);
    });
  }, [sistemas, busca, filtroTipo]);

  // Verifica se tem filtros ativos
  const hasActiveFilters = busca || filtroTipo;

  function getInitials(nome: string): string {
    return nome.split(' ').slice(0, 2).map(n => n.charAt(0).toUpperCase()).join('');
  }

  const ocultarSenhaAutomaticamente = useCallback((credencialId: string) => {
    if (senhaTimers.current[credencialId]) {
      clearTimeout(senhaTimers.current[credencialId]);
    }
    senhaTimers.current[credencialId] = setTimeout(() => {
      setSenhasReveladas((prev) => {
        const { [credencialId]: _, ...rest } = prev;
        return rest;
      });
    }, 30000);
  }, []);

  async function handleRevelarSenha(e: React.MouseEvent, credencialId: string) {
    e.stopPropagation();
    if (senhasReveladas[credencialId]) {
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

  async function handleCopiarSenha(e: React.MouseEvent, credencialId: string) {
    e.stopPropagation();
    const senha = senhasReveladas[credencialId];
    if (!senha) {
      setLoadingSenha(credencialId);
      try {
        const senhaRevelada = await sistemaAcessoService.revelarSenha(credencialId);
        await navigator.clipboard.writeText(senhaRevelada);
        setCopiadoId(credencialId);
        setTimeout(() => setCopiadoId(null), 2000);
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

  async function handleCopiarLogin(e: React.MouseEvent, credencialId: string, login: string) {
    e.stopPropagation();
    await navigator.clipboard.writeText(login);
    setLoginCopiado(credencialId);
    setTimeout(() => setLoginCopiado(null), 2000);
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Carregando sistemas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Sistemas & Acessos</h1>
          <p className={styles.subtitle}>
            Catalogo de sistemas e plataformas do departamento
          </p>
        </div>

        <button className={styles.newButton} onClick={() => setIsFormOpen(true)}>
          <Plus size={18} />
          Novo Sistema
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar sistemas..."
            className={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          {Object.entries(tipoLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {sistemasFiltrados.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Server size={36} />
          </div>
          <h3 className={styles.emptyTitle}>
            {hasActiveFilters ? 'Nenhum sistema encontrado' : 'Nenhum sistema cadastrado'}
          </h3>
          <p className={styles.emptyText}>
            {hasActiveFilters
              ? 'Tente ajustar os filtros ou o termo de busca'
              : 'Adicione sistemas ao catalogo para gerenciar acessos'}
          </p>
          {!hasActiveFilters && (
            <button className={styles.emptyButton} onClick={() => setIsFormOpen(true)}>
              <Plus size={18} />
              Novo Sistema
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sistema</th>
                <th>Login</th>
                <th>Senha</th>
                <th>Tipo</th>
                <th>Responsavel</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sistemasFiltrados.map((sistema) => {
                const Icon = tipoIcons[sistema.tipo] || Server;
                const color = tipoColors[sistema.tipo] || '#6b7280';
                const credencial = credenciaisPorSistema[sistema.id];

                return (
                  <tr
                    key={sistema.id}
                    className={styles.tableRow}
                    onClick={() => navigate(`/sistemas-acesso/${sistema.id}`)}
                  >
                    <td>
                      <div className={styles.sistemaCell}>
                        <div
                          className={styles.sistemaIcon}
                          style={{ background: `${color}20`, color }}
                        >
                          <Icon size={18} />
                        </div>
                        <div className={styles.sistemaInfo}>
                          <span className={styles.sistemaNome}>{sistema.nome}</span>
                          {sistema.observacoes && (
                            <span className={styles.sistemaDesc}>
                              {sistema.observacoes.substring(0, 50)}
                              {sistema.observacoes.length > 50 ? '...' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {credencial ? (
                        <div className={styles.credencialCell}>
                          <code>{credencial.login}</code>
                          <button
                            className={`${styles.miniBtn} ${loginCopiado === credencial.id ? styles.copied : ''}`}
                            onClick={(e) => handleCopiarLogin(e, credencial.id, credencial.login)}
                            title="Copiar login"
                          >
                            {loginCopiado === credencial.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        <span className={styles.semCredencial}>-</span>
                      )}
                    </td>
                    <td>
                      {credencial ? (
                        <div className={styles.credencialCell}>
                          {loadingSenha === credencial.id ? (
                            <Loader2 size={14} className={styles.spinner} />
                          ) : senhasReveladas[credencial.id] ? (
                            <code>{senhasReveladas[credencial.id]}</code>
                          ) : (
                            <span className={styles.senhaMasked}>••••••••</span>
                          )}
                          <button
                            className={styles.miniBtn}
                            onClick={(e) => handleRevelarSenha(e, credencial.id)}
                            disabled={loadingSenha === credencial.id}
                            title={senhasReveladas[credencial.id] ? 'Ocultar' : 'Revelar'}
                          >
                            {senhasReveladas[credencial.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          <button
                            className={`${styles.miniBtn} ${copiadoId === credencial.id ? styles.copied : ''}`}
                            onClick={(e) => handleCopiarSenha(e, credencial.id)}
                            disabled={loadingSenha === credencial.id}
                            title="Copiar senha"
                          >
                            {copiadoId === credencial.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        <span className={styles.semCredencial}>-</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={styles.tipoBadge}
                        style={{ background: `${color}20`, color }}
                      >
                        {tipoLabels[sistema.tipo]}
                      </span>
                    </td>
                    <td>
                      {sistema.responsavel ? (
                        <div className={styles.responsavelCell}>
                          <div className={styles.responsavelAvatar}>
                            {getInitials(sistema.responsavel.nome)}
                          </div>
                          <span>{sistema.responsavel.nome.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className={styles.semCredencial}>-</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        {sistema.url && (
                          <a
                            href={sistema.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={styles.actionBtn}
                            title="Abrir URL"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de novo sistema */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Novo Sistema"
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Nome do sistema"
            required
          />

          <Input
            label="URL"
            type="url"
            value={formData.url || ''}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://..."
          />

          <Select
            label="Tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoSistemaAcesso })}
            options={Object.entries(tipoLabels).map(([value, label]) => ({ value, label }))}
          />

          <Select
            label="Responsavel"
            value={formData.responsavel_id || ''}
            onChange={(e) => setFormData({ ...formData, responsavel_id: e.target.value || undefined })}
            options={[
              { value: '', label: 'Selecione...' },
              ...usuarios.map((u) => ({ value: u.id, label: u.nome })),
            ]}
          />

          <div className={styles.textareaWrapper}>
            <label>Observacoes</label>
            <textarea
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Descricao breve do sistema..."
              rows={3}
            />
          </div>

          <div className={styles.textareaWrapper}>
            <label>Instrucoes de Acesso</label>
            <textarea
              value={formData.instrucoes_acesso || ''}
              onChange={(e) => setFormData({ ...formData, instrucoes_acesso: e.target.value })}
              placeholder="Como solicitar acesso, passos necessarios..."
              rows={4}
            />
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={formLoading}>
              Criar Sistema
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
