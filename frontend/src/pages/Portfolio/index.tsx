import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Briefcase,
  Calendar,
  Eye,
  EyeOff,
  Layers,
  TrendingUp,
  Clock,
  FolderOpen,
  Building2
} from 'lucide-react';
import {
  portfolioService,
  PortfolioProjeto,
  CategoriaPortfolio
} from '../../services/portfolioService';
import styles from './styles.module.css';

const categoriaLabels: Record<CategoriaPortfolio, string> = {
  AUTOMACAO: 'Automacao',
  SISTEMA_INTERNO: 'Sistema Interno',
  APLICATIVO: 'Aplicativo',
  INFRA: 'Infraestrutura',
  PESQUISA: 'Pesquisa',
  INTEGRACAO: 'Integracao',
  DASHBOARD: 'Dashboard',
  OUTRO: 'Outro',
};

const categoriaColors: Record<CategoriaPortfolio, string> = {
  AUTOMACAO: '#22c55e',
  SISTEMA_INTERNO: '#6366f1',
  APLICATIVO: '#8b5cf6',
  INFRA: '#f59e0b',
  PESQUISA: '#3b82f6',
  INTEGRACAO: '#ec4899',
  DASHBOARD: '#14b8a6',
  OUTRO: '#6b7280',
};

type FilterType = 'TODOS' | CategoriaPortfolio;

export function Portfolio() {
  const [projetos, setProjetos] = useState<PortfolioProjeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterType>('TODOS');

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    try {
      const data = await portfolioService.listar();
      setProjetos(data);
    } catch (error) {
      console.error('Erro ao carregar portfolio:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar projetos
  const filteredProjetos = useMemo(() => {
    return projetos.filter((projeto) => {
      const matchesSearch = projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projeto.descricao_resumida?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projeto.tecnologias?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        projeto.setores_beneficiados?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'TODOS' || projeto.categoria === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [projetos, searchTerm, categoryFilter]);

  // Contagem por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { TODOS: projetos.length };
    Object.keys(categoriaLabels).forEach((cat) => {
      counts[cat] = projetos.filter((p) => p.categoria === cat).length;
    });
    return counts;
  }, [projetos]);

  // Estatisticas
  const stats = useMemo(() => {
    const totalHoras = projetos.reduce((acc, p) => acc + (p.horas_economizadas || 0), 0);
    const totalImpacto = projetos.reduce((acc, p) => acc + (p.impacto_financeiro_estimado || 0), 0);
    const publicados = projetos.filter(p => p.publicado).length;
    return { totalHoras, totalImpacto, publicados, total: projetos.length };
  }, [projetos]);

  function formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatHours(hours: number): string {
    if (hours >= 1000) {
      return `${(hours / 1000).toFixed(1)}k`;
    }
    return hours.toString();
  }

  // Verifica se tem filtros ativos
  const hasActiveFilters = searchTerm || categoryFilter !== 'TODOS';

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Carregando portfolio...</span>
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
            <h1 className={styles.title}>Portfolio</h1>
            <p className={styles.subtitle}>
              Projetos concluidos e seus impactos na organizacao
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statCardProjetos}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FolderOpen size={18} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Projetos</span>
          </div>

          <div className={`${styles.statCard} ${styles.statCardPublicados}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Eye size={18} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.publicados}</span>
            <span className={styles.statLabel}>Publicados</span>
          </div>

          <div className={`${styles.statCard} ${styles.statCardHoras}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Clock size={18} />
              </div>
            </div>
            <span className={styles.statValue}>{formatHours(stats.totalHoras)}h</span>
            <span className={styles.statLabel}>Horas Economizadas</span>
          </div>

          <div className={`${styles.statCard} ${styles.statCardImpacto}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <TrendingUp size={18} />
              </div>
            </div>
            <span className={styles.statValue}>{formatCurrency(stats.totalImpacto)}</span>
            <span className={styles.statLabel}>Impacto Financeiro</span>
          </div>
        </div>

        {/* Search */}
        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar projetos, tecnologias, setores..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className={styles.categoryFilters}>
          <button
            className={`${styles.categoryButton} ${categoryFilter === 'TODOS' ? styles.active : ''}`}
            onClick={() => setCategoryFilter('TODOS')}
          >
            Todos
            <span className={styles.categoryCount}>{categoryCounts.TODOS}</span>
          </button>
          {Object.entries(categoriaLabels).map(([cat, label]) => (
            categoryCounts[cat] > 0 && (
              <button
                key={cat}
                className={`${styles.categoryButton} ${categoryFilter === cat ? styles.active : ''}`}
                onClick={() => setCategoryFilter(cat as FilterType)}
              >
                <span
                  className={styles.categoryDot}
                  style={{ background: categoriaColors[cat as CategoriaPortfolio] }}
                />
                {label}
                <span className={styles.categoryCount}>{categoryCounts[cat]}</span>
              </button>
            )
          ))}
        </div>
      </div>

      {/* Grid ou Empty State */}
      {filteredProjetos.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Briefcase size={36} />
          </div>
          <h3 className={styles.emptyTitle}>
            {hasActiveFilters
              ? 'Nenhum projeto encontrado'
              : 'Portfolio vazio'}
          </h3>
          <p className={styles.emptyText}>
            {hasActiveFilters
              ? 'Tente ajustar os filtros ou o termo de busca'
              : 'Quando projetos forem adicionados ao portfolio, eles aparecerao aqui'}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredProjetos.map((projeto) => (
            <div
              key={projeto.id}
              className={styles.card}
              style={{ '--category-color': categoriaColors[projeto.categoria] } as React.CSSProperties}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrapper}>
                  <div className={styles.cardIcon}>
                    <Layers size={22} />
                  </div>
                </div>
                <span
                  className={styles.cardCategory}
                  style={{
                    background: `${categoriaColors[projeto.categoria]}20`,
                    color: categoriaColors[projeto.categoria]
                  }}
                >
                  {categoriaLabels[projeto.categoria]}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{projeto.nome}</h3>

              {projeto.descricao_resumida && (
                <p className={styles.cardDescricao}>{projeto.descricao_resumida}</p>
              )}

              {/* Metricas de Impacto */}
              {(projeto.horas_economizadas || projeto.impacto_financeiro_estimado) && (
                <div className={styles.impactSection}>
                  <div className={styles.impactHeader}>
                    <TrendingUp size={14} className={styles.impactIcon} />
                    <h4 className={styles.impactTitle}>Impacto</h4>
                  </div>
                  <div className={styles.impactGrid}>
                    {projeto.horas_economizadas && (
                      <div className={`${styles.impactItem} ${styles.impactItemHours}`}>
                        <span className={styles.impactValue}>
                          {formatHours(projeto.horas_economizadas)}h
                        </span>
                        <span className={styles.impactLabel}>Horas economizadas</span>
                      </div>
                    )}
                    {projeto.impacto_financeiro_estimado && (
                      <div className={`${styles.impactItem} ${styles.impactItemMoney}`}>
                        <span className={styles.impactValue}>
                          {formatCurrency(projeto.impacto_financeiro_estimado)}
                        </span>
                        <span className={styles.impactLabel}>Economia estimada</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tecnologias */}
              {projeto.tecnologias && projeto.tecnologias.length > 0 && (
                <div className={styles.techSection}>
                  <div className={styles.techList}>
                    {projeto.tecnologias.slice(0, 4).map((tech) => (
                      <span key={tech} className={styles.techBadge}>{tech}</span>
                    ))}
                    {projeto.tecnologias.length > 4 && (
                      <span className={styles.techMore}>+{projeto.tecnologias.length - 4}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Setores */}
              {projeto.setores_beneficiados && projeto.setores_beneficiados.length > 0 && (
                <div className={styles.setoresSection}>
                  {projeto.setores_beneficiados.slice(0, 3).map((setor) => (
                    <span key={setor} className={styles.setorBadge}>
                      <Building2 size={10} className={styles.setorIcon} />
                      {setor}
                    </span>
                  ))}
                  {projeto.setores_beneficiados.length > 3 && (
                    <span className={styles.techMore}>+{projeto.setores_beneficiados.length - 3}</span>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className={styles.cardMeta}>
                <div className={styles.cardMetaLeft}>
                  {projeto.data_conclusao && (
                    <div className={styles.cardMetaItem}>
                      <Calendar size={14} />
                      <span>{new Date(projeto.data_conclusao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                <span className={`${styles.publishedBadge} ${projeto.publicado ? styles.published : styles.draft}`}>
                  {projeto.publicado ? <Eye size={12} /> : <EyeOff size={12} />}
                  {projeto.publicado ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
