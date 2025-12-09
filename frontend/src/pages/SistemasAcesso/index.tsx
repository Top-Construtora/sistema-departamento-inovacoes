import { useState, useEffect, useMemo, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ExternalLink,
  Server,
  Cloud,
  Database,
  Code,
  BookOpen,
  MessageSquare,
  BarChart,
  Wrench,
  Link2,
  Search,
  Layers,
  Globe
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../../components/ui';
import { SistemaAcesso, TipoSistemaAcesso, CreateSistemaAcessoDTO, Usuario } from '../../types';
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

const tipoIcons: Record<TipoSistemaAcesso, typeof Server> = {
  PLATAFORMA_CURSO: BookOpen,
  DESENVOLVIMENTO: Code,
  INFRA: Server,
  COMUNICACAO: MessageSquare,
  ANALYTICS: BarChart,
  CLOUD: Cloud,
  BANCO_DADOS: Database,
  API_EXTERNA: Link2,
  FERRAMENTA_INTERNA: Wrench,
  SISTEMA_EXTERNO: Globe,
  SISTEMA_INTERNO: Layers,
  OUTRO: Server,
};

const tipoColors: Record<TipoSistemaAcesso, string> = {
  PLATAFORMA_CURSO: '#8b5cf6',
  DESENVOLVIMENTO: '#3b82f6',
  INFRA: '#6b7280',
  COMUNICACAO: '#22c55e',
  ANALYTICS: '#f59e0b',
  CLOUD: '#06b6d4',
  BANCO_DADOS: '#ec4899',
  API_EXTERNA: '#14b8a6',
  FERRAMENTA_INTERNA: '#f97316',
  SISTEMA_EXTERNO: '#0ea5e9',
  SISTEMA_INTERNO: '#a855f7',
  OUTRO: '#6b7280',
};

export function SistemasAcesso() {
  const navigate = useNavigate();
  const [sistemas, setSistemas] = useState<SistemaAcesso[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

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

  async function loadSistemas() {
    try {
      setLoading(true);
      const data = await sistemaAcessoService.listar();
      setSistemas(data);
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

  // Filtrar sistemas
  const sistemasFiltrados = useMemo(() => {
    return sistemas.filter((sistema) => {
      const matchBusca = sistema.nome.toLowerCase().includes(busca.toLowerCase()) ||
        sistema.observacoes?.toLowerCase().includes(busca.toLowerCase());
      const matchTipo = !filtroTipo || sistema.tipo === filtroTipo;
      return matchBusca && matchTipo;
    });
  }, [sistemas, busca, filtroTipo]);

  // Agrupar por tipo
  const sistemasPorTipo = useMemo(() => {
    return sistemasFiltrados.reduce((acc, sistema) => {
      const tipo = sistema.tipo;
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(sistema);
      return acc;
    }, {} as Record<TipoSistemaAcesso, SistemaAcesso[]>);
  }, [sistemasFiltrados]);

  // Estatisticas
  const stats = useMemo(() => {
    const total = sistemas.length;
    const desenvolvimento = sistemas.filter(s => s.tipo === 'DESENVOLVIMENTO').length;
    const cloud = sistemas.filter(s => s.tipo === 'CLOUD').length;
    const infra = sistemas.filter(s => s.tipo === 'INFRA').length;
    const bancoDados = sistemas.filter(s => s.tipo === 'BANCO_DADOS').length;
    return { total, desenvolvimento, cloud, infra, bancoDados };
  }, [sistemas]);

  // Verifica se tem filtros ativos
  const hasActiveFilters = busca || filtroTipo;

  function getInitials(nome: string): string {
    return nome.split(' ').slice(0, 2).map(n => n.charAt(0).toUpperCase()).join('');
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

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div
          className={`${styles.statCard} ${styles.statCardTotal} ${!filtroTipo ? styles.active : ''}`}
          onClick={() => setFiltroTipo('')}
        >
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <Layers size={16} />
            </div>
          </div>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>

        <div
          className={`${styles.statCard} ${styles.statCardDev} ${filtroTipo === 'DESENVOLVIMENTO' ? styles.active : ''}`}
          onClick={() => setFiltroTipo(filtroTipo === 'DESENVOLVIMENTO' ? '' : 'DESENVOLVIMENTO')}
        >
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <Code size={16} />
            </div>
          </div>
          <span className={styles.statValue}>{stats.desenvolvimento}</span>
          <span className={styles.statLabel}>Desenvolvimento</span>
        </div>

        <div
          className={`${styles.statCard} ${styles.statCardCloud} ${filtroTipo === 'CLOUD' ? styles.active : ''}`}
          onClick={() => setFiltroTipo(filtroTipo === 'CLOUD' ? '' : 'CLOUD')}
        >
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <Cloud size={16} />
            </div>
          </div>
          <span className={styles.statValue}>{stats.cloud}</span>
          <span className={styles.statLabel}>Cloud</span>
        </div>

        <div
          className={`${styles.statCard} ${styles.statCardInfra} ${filtroTipo === 'INFRA' ? styles.active : ''}`}
          onClick={() => setFiltroTipo(filtroTipo === 'INFRA' ? '' : 'INFRA')}
        >
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <Server size={16} />
            </div>
          </div>
          <span className={styles.statValue}>{stats.infra}</span>
          <span className={styles.statLabel}>Infraestrutura</span>
        </div>

        <div
          className={`${styles.statCard} ${styles.statCardData} ${filtroTipo === 'BANCO_DADOS' ? styles.active : ''}`}
          onClick={() => setFiltroTipo(filtroTipo === 'BANCO_DADOS' ? '' : 'BANCO_DADOS')}
        >
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>
              <Database size={16} />
            </div>
          </div>
          <span className={styles.statValue}>{stats.bancoDados}</span>
          <span className={styles.statLabel}>Banco de Dados</span>
        </div>
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
        <div className={styles.content}>
          {Object.entries(sistemasPorTipo).map(([tipo, sistemasDoTipo]) => {
            const Icon = tipoIcons[tipo as TipoSistemaAcesso];
            const color = tipoColors[tipo as TipoSistemaAcesso];

            return (
              <div key={tipo} className={styles.section}>
                <div className={styles.sectionHeader} style={{ borderColor: color }}>
                  <div className={styles.sectionIcon} style={{ background: `${color}20`, color }}>
                    <Icon size={18} />
                  </div>
                  <h2 className={styles.sectionTitle}>{tipoLabels[tipo as TipoSistemaAcesso]}</h2>
                  <span className={styles.sectionCount}>{sistemasDoTipo.length}</span>
                </div>

                <div className={styles.grid}>
                  {sistemasDoTipo.map((sistema) => (
                    <div
                      key={sistema.id}
                      className={styles.card}
                      style={{ '--card-color': color } as React.CSSProperties}
                      onClick={() => navigate(`/sistemas-acesso/${sistema.id}`)}
                    >
                      <div className={styles.cardHeader}>
                        <div
                          className={styles.cardIcon}
                          style={{ background: `${color}20`, color }}
                        >
                          <Icon size={24} />
                        </div>
                        {sistema.url && (
                          <a
                            href={sistema.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={styles.externalLink}
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>

                      <h3 className={styles.cardTitle}>{sistema.nome}</h3>

                      {sistema.observacoes && (
                        <p className={styles.cardDescription}>
                          {sistema.observacoes.substring(0, 100)}
                          {sistema.observacoes.length > 100 ? '...' : ''}
                        </p>
                      )}

                      <div className={styles.cardFooter}>
                        {sistema.responsavel ? (
                          <div className={styles.responsavel}>
                            <div className={styles.responsavelAvatar}>
                              {getInitials(sistema.responsavel.nome)}
                            </div>
                            <span>{sistema.responsavel.nome.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <span className={styles.responsavel}>Sem responsavel</span>
                        )}

                        {sistema.url && (
                          <span className={styles.urlBadge}>
                            <Globe size={12} />
                            URL
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
