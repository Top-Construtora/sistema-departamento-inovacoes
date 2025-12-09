import { useState, useEffect, useMemo, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Calendar,
  Search,
  FolderOpen,
  Plus,
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../../components/ui';
import { Projeto, StatusProjeto, TipoProjeto, NivelRisco, CreateProjetoDTO, Usuario } from '../../types';
import { projetoService, usuarioService } from '../../services';
import styles from './styles.module.css';

const statusLabels: Record<StatusProjeto, string> = {
  IDEIA: 'Ideia',
  EM_ANALISE: 'Em Análise',
  EM_DESENVOLVIMENTO: 'Em Desenvolvimento',
  EM_TESTES: 'Em Testes',
  EM_PRODUCAO: 'Em Produção',
  ARQUIVADO: 'Arquivado',
};

const statusColors: Record<StatusProjeto, string> = {
  IDEIA: '#6b7280',
  EM_ANALISE: '#8b5cf6',
  EM_DESENVOLVIMENTO: '#3b82f6',
  EM_TESTES: '#f59e0b',
  EM_PRODUCAO: '#22c55e',
  ARQUIVADO: '#374151',
};

const statusProgress: Record<StatusProjeto, number> = {
  IDEIA: 10,
  EM_ANALISE: 25,
  EM_DESENVOLVIMENTO: 50,
  EM_TESTES: 75,
  EM_PRODUCAO: 100,
  ARQUIVADO: 100,
};

const tipoLabels: Record<TipoProjeto, string> = {
  SISTEMA_INTERNO: 'Sistema Interno',
  AUTOMACAO: 'Automação',
  PESQUISA: 'Pesquisa',
  INTEGRACAO: 'Integração',
  MELHORIA: 'Melhoria',
  OUTRO: 'Outro',
};

const riscoLabels: Record<NivelRisco, string> = {
  BAIXO: 'Baixo',
  MEDIO: 'Médio',
  ALTO: 'Alto',
};

type FilterType = 'TODOS' | StatusProjeto;

export function Projetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('TODOS');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const navigate = useNavigate();

  // Modal de novo projeto
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProjetoDTO>({
    nome: '',
    descricao: '',
    objetivo: '',
    tipo: TipoProjeto.OUTRO,
    status: StatusProjeto.IDEIA,
    risco: NivelRisco.BAIXO,
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    loadProjetos();
    loadUsuarios();
  }, []);

  async function loadProjetos() {
    try {
      const data = await projetoService.listar();
      setProjetos(data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
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
      // Converte tags de string para array
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const projetoCriado = await projetoService.criar({
        ...formData,
        tags,
      });

      // Reseta o formulário
      setFormData({
        nome: '',
        descricao: '',
        objetivo: '',
        tipo: TipoProjeto.OUTRO,
        status: StatusProjeto.IDEIA,
        risco: NivelRisco.BAIXO,
        tags: [],
      });
      setTagsInput('');
      setIsFormOpen(false);
      loadProjetos();

      // Navega para o projeto criado
      navigate(`/projetos/${projetoCriado.id}`);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    } finally {
      setFormLoading(false);
    }
  }

  // Filtragem de projetos
  const filteredProjetos = useMemo(() => {
    return projetos.filter((projeto) => {
      const matchesSearch = projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projeto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projeto.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'TODOS' || projeto.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projetos, searchTerm, statusFilter]);

  // Contagem por status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { TODOS: projetos.length };
    Object.keys(statusLabels).forEach((status) => {
      counts[status] = projetos.filter((p) => p.status === status).length;
    });
    return counts;
  }, [projetos]);

  // Estatísticas
  const stats = useMemo(() => {
    const emDesenvolvimento = projetos.filter(p => p.status === 'EM_DESENVOLVIMENTO').length;
    const emProducao = projetos.filter(p => p.status === 'EM_PRODUCAO').length;
    const emTestes = projetos.filter(p => p.status === 'EM_TESTES').length;
    return { emDesenvolvimento, emProducao, emTestes };
  }, [projetos]);

  // Obter iniciais do líder
  function getLeaderInitials(nome: string): string {
    return nome.split(' ').slice(0, 2).map(n => n.charAt(0).toUpperCase()).join('');
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <span className={styles.loadingText}>Carregando projetos...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Projetos</h1>
            <p className={styles.subtitle}>
              Gerencie todos os projetos do departamento
            </p>
          </div>
          <button className={styles.newButton} onClick={() => setIsFormOpen(true)}>
            <Plus size={18} />
            Novo Projeto
          </button>
        </div>

        {/* Controles de busca e filtro */}
        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar projetos..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filters}>
            <button
              className={`${styles.filterButton} ${statusFilter === 'TODOS' ? styles.active : ''}`}
              onClick={() => setStatusFilter('TODOS')}
            >
              Todos
              <span className={styles.filterCount}>{statusCounts.TODOS}</span>
            </button>
            {Object.entries(statusLabels).slice(0, 4).map(([status, label]) => (
              <button
                key={status}
                className={`${styles.filterButton} ${statusFilter === status ? styles.active : ''}`}
                onClick={() => setStatusFilter(status as FilterType)}
              >
                {label}
                <span className={styles.filterCount}>{statusCounts[status]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className={styles.stats}>
          <div className={styles.statBadge}>
            <span className={styles.statDot} style={{ background: '#3b82f6' }} />
            <span>Em Desenvolvimento</span>
            <span className={styles.statValue}>{stats.emDesenvolvimento}</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statDot} style={{ background: '#f59e0b' }} />
            <span>Em Testes</span>
            <span className={styles.statValue}>{stats.emTestes}</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statDot} style={{ background: '#22c55e' }} />
            <span>Em Produção</span>
            <span className={styles.statValue}>{stats.emProducao}</span>
          </div>
        </div>
      </div>

      {/* Grid de Projetos ou Empty State */}
      {filteredProjetos.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FolderOpen size={36} />
          </div>
          <h3 className={styles.emptyTitle}>
            {searchTerm || statusFilter !== 'TODOS'
              ? 'Nenhum projeto encontrado'
              : 'Nenhum projeto cadastrado'}
          </h3>
          <p className={styles.emptyText}>
            {searchTerm || statusFilter !== 'TODOS'
              ? 'Tente ajustar os filtros ou o termo de busca'
              : 'Quando novos projetos forem adicionados, eles aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredProjetos.map((projeto) => (
            <div
              key={projeto.id}
              className={styles.card}
              style={{ '--status-color': statusColors[projeto.status] } as React.CSSProperties}
              onClick={() => navigate(`/projetos/${projeto.id}`)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrapper}>
                  <div className={styles.cardIcon}>
                    <FolderKanban size={20} />
                  </div>
                </div>
                <span
                  className={styles.cardStatus}
                  style={{
                    background: `${statusColors[projeto.status]}20`,
                    color: statusColors[projeto.status]
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: statusColors[projeto.status]
                    }}
                  />
                  {statusLabels[projeto.status]}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{projeto.nome}</h3>

              {projeto.descricao && (
                <p className={styles.cardDescricao}>
                  {projeto.descricao.substring(0, 100)}
                  {projeto.descricao.length > 100 ? '...' : ''}
                </p>
              )}

              {/* Barra de Progresso */}
              <div className={styles.cardProgress}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Progresso</span>
                  <span className={styles.progressValue}>{statusProgress[projeto.status]}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${statusProgress[projeto.status]}%` }}
                  />
                </div>
              </div>

              <div className={styles.cardMeta}>
                {projeto.lider && (
                  <div className={styles.cardMetaItem}>
                    <div className={styles.leaderAvatar}>
                      {getLeaderInitials(projeto.lider.nome)}
                    </div>
                    <span>{projeto.lider.nome.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                )}

                {projeto.data_inicio && (
                  <div className={styles.cardMetaItem}>
                    <Calendar size={14} />
                    <span>{new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>

              {projeto.tags && projeto.tags.length > 0 && (
                <div className={styles.cardTags}>
                  {projeto.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                  {projeto.tags.length > 3 && (
                    <span className={styles.tagMore}>+{projeto.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de novo projeto */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Novo Projeto"
        size="lg"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nome do Projeto"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Digite o nome do projeto"
            required
          />

          <div className={styles.formRow}>
            <Select
              label="Tipo"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoProjeto })}
              options={Object.entries(tipoLabels).map(([value, label]) => ({ value, label }))}
            />

            <Select
              label="Status Inicial"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusProjeto })}
              options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
            />
          </div>

          <div className={styles.formRow}>
            <Select
              label="Responsável"
              value={formData.lider_id || ''}
              onChange={(e) => setFormData({ ...formData, lider_id: e.target.value || undefined })}
              options={[
                { value: '', label: 'Selecione...' },
                ...usuarios.map((u) => ({ value: u.id, label: u.nome })),
              ]}
            />

            <Select
              label="Nível de Risco"
              value={formData.risco}
              onChange={(e) => setFormData({ ...formData, risco: e.target.value as NivelRisco })}
              options={Object.entries(riscoLabels).map(([value, label]) => ({ value, label }))}
            />
          </div>

          <div className={styles.formRow}>
            <Input
              label="Data de Início"
              type="date"
              value={formData.data_inicio || ''}
              onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
            />

            <Input
              label="Previsão de Conclusão"
              type="date"
              value={formData.data_fim_prevista || ''}
              onChange={(e) => setFormData({ ...formData, data_fim_prevista: e.target.value })}
            />
          </div>

          <div className={styles.textareaWrapper}>
            <label>Descrição</label>
            <textarea
              value={formData.descricao || ''}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o projeto de forma breve..."
              rows={3}
            />
          </div>

          <div className={styles.textareaWrapper}>
            <label>Objetivo</label>
            <textarea
              value={formData.objetivo || ''}
              onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
              placeholder="Qual o objetivo principal do projeto?"
              rows={2}
            />
          </div>

          <Input
            label="Tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Separe as tags por vírgula (ex: API, Backend, Automação)"
          />

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={formLoading}>
              Criar Projeto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
