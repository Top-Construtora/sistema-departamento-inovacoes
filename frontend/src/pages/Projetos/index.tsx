import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Calendar,
  Search,
  FolderOpen
} from 'lucide-react';
import { Projeto, StatusProjeto } from '../../types';
import { projetoService } from '../../services';
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

type FilterType = 'TODOS' | StatusProjeto;

export function Projetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('TODOS');
  const navigate = useNavigate();

  useEffect(() => {
    loadProjetos();
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
    </div>
  );
}
