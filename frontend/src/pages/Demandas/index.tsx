import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  Filter,
  ClipboardList,
  FolderKanban,
  Calendar,
  X
} from 'lucide-react';
import { KanbanBoard } from '../../components/Kanban';
import { DemandaForm } from '../../components/DemandaForm';
import { useAuth } from '../../contexts/AuthContext';
import { Demanda, StatusDemanda, TipoDemanda, PrioridadeDemanda, CreateDemandaDTO } from '../../types';
import { demandaService, DemandaFiltros } from '../../services';
import styles from './styles.module.css';

type ViewMode = 'kanban' | 'list';

const tipoLabels: Record<TipoDemanda, string> = {
  BUG: 'Bug',
  MELHORIA: 'Melhoria',
  NOVA_FEATURE: 'Nova Feature',
  ESTUDO: 'Estudo',
  SUPORTE_INTERNO: 'Suporte',
  DOCUMENTACAO: 'Documentação',
  OUTRO: 'Outro',
};

const statusLabels: Record<StatusDemanda, string> = {
  A_FAZER: 'A Fazer',
  EM_ANDAMENTO: 'Em Andamento',
  EM_VALIDACAO: 'Em Validação',
  CONCLUIDA: 'Concluída',
};

const prioridadeLabels: Record<PrioridadeDemanda, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

export function Demandas() {
  const { usuario } = useAuth();
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDemanda, setSelectedDemanda] = useState<Demanda | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState<DemandaFiltros>({});

  useEffect(() => {
    loadDemandas();
  }, [filtros, usuario]);

  async function loadDemandas() {
    if (!usuario) return;
    try {
      setLoading(true);
      const data = await demandaService.listar({ ...filtros, responsavel_id: usuario.id });
      setDemandas(data);
    } catch (error) {
      console.error('Erro ao carregar demandas:', error);
    } finally {
      setLoading(false);
    }
  }

  // Estatísticas
  const stats = useMemo(() => {
    const aFazer = demandas.filter(d => d.status === 'A_FAZER').length;
    const emAndamento = demandas.filter(d => d.status === 'EM_ANDAMENTO').length;
    const emValidacao = demandas.filter(d => d.status === 'EM_VALIDACAO').length;
    const concluidas = demandas.filter(d => d.status === 'CONCLUIDA').length;
    return { aFazer, emAndamento, emValidacao, concluidas, total: demandas.length };
  }, [demandas]);

  // Verifica se tem filtros ativos
  const hasActiveFilters = filtros.tipo || filtros.prioridade || filtros.status;

  async function handleStatusChange(id: string, status: StatusDemanda) {
    try {
      await demandaService.atualizarStatus(id, status);
      setDemandas((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  async function handleCreateDemanda(data: CreateDemandaDTO) {
    await demandaService.criar(data);
    loadDemandas();
  }

  async function handleUpdateDemanda(data: CreateDemandaDTO) {
    if (selectedDemanda) {
      await demandaService.atualizar(selectedDemanda.id, data);
      loadDemandas();
    }
  }

  function handleCardClick(demanda: Demanda) {
    setSelectedDemanda(demanda);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setSelectedDemanda(null);
  }

  function getInitials(nome: string): string {
    return nome.split(' ').slice(0, 2).map(n => n.charAt(0).toUpperCase()).join('');
  }

  function isPrazoAtrasado(prazo: string): boolean {
    return new Date(prazo) < new Date();
  }

  function isPrazoProximo(prazo: string): boolean {
    const prazoDate = new Date(prazo);
    const hoje = new Date();
    const diffDays = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <span className={styles.loadingText}>Carregando demandas...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Demandas</h1>
            <p className={styles.subtitle}>
              Gerencie as demandas e tarefas dos projetos
            </p>
          </div>

          <div className={styles.actions}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewButton} ${viewMode === 'kanban' ? styles.active : ''}`}
                onClick={() => setViewMode('kanban')}
                title="Visualização Kanban"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
                title="Visualização em Lista"
              >
                <List size={18} />
              </button>
            </div>

            <button
              className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filtros
              {hasActiveFilters && <span style={{ marginLeft: '0.25rem' }}>•</span>}
            </button>

            <button className={styles.newButton} onClick={() => setIsFormOpen(true)}>
              <Plus size={18} />
              Nova Demanda
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className={styles.stats}>
          <div className={styles.statBadge}>
            <span className={styles.statDot} style={{ background: '#6b7280' }} />
            <span>A Fazer</span>
            <span className={styles.statValue}>{stats.aFazer}</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statDot} style={{ background: '#3b82f6' }} />
            <span>Em Andamento</span>
            <span className={styles.statValue}>{stats.emAndamento}</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statDot} style={{ background: '#f59e0b' }} />
            <span>Em Validação</span>
            <span className={styles.statValue}>{stats.emValidacao}</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statDot} style={{ background: '#22c55e' }} />
            <span>Concluídas</span>
            <span className={styles.statValue}>{stats.concluidas}</span>
          </div>
        </div>
      </div>

      {/* Painel de Filtros */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tipo</label>
            <select
              className={styles.filterSelect}
              value={filtros.tipo || ''}
              onChange={(e) => setFiltros({ ...filtros, tipo: (e.target.value as TipoDemanda) || undefined })}
            >
              <option value="">Todos os tipos</option>
              {Object.entries(tipoLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Prioridade</label>
            <select
              className={styles.filterSelect}
              value={filtros.prioridade || ''}
              onChange={(e) => setFiltros({ ...filtros, prioridade: (e.target.value as PrioridadeDemanda) || undefined })}
            >
              <option value="">Todas</option>
              {Object.entries(prioridadeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              className={styles.filterSelect}
              value={filtros.status || ''}
              onChange={(e) => setFiltros({ ...filtros, status: (e.target.value as StatusDemanda) || undefined })}
            >
              <option value="">Todos</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              className={styles.clearFiltersButton}
              onClick={() => setFiltros({})}
            >
              <X size={14} />
              Limpar
            </button>
          )}
        </div>
      )}

      {/* Conteúdo Principal */}
      {demandas.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <ClipboardList size={36} />
          </div>
          <h3 className={styles.emptyTitle}>
            {hasActiveFilters ? 'Nenhuma demanda encontrada' : 'Nenhuma demanda cadastrada'}
          </h3>
          <p className={styles.emptyText}>
            {hasActiveFilters
              ? 'Tente ajustar os filtros para encontrar demandas'
              : 'Crie sua primeira demanda para começar a organizar as tarefas'}
          </p>
          {!hasActiveFilters && (
            <button className={styles.emptyButton} onClick={() => setIsFormOpen(true)}>
              <Plus size={18} />
              Criar Demanda
            </button>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        <div className={styles.kanbanContainer}>
          <KanbanBoard
            demandas={demandas}
            onStatusChange={handleStatusChange}
            onCardClick={handleCardClick}
          />
        </div>
      ) : (
        <div className={styles.listContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {demandas.map((demanda) => (
                <tr key={demanda.id} onClick={() => handleCardClick(demanda)}>
                  <td>
                    <div className={styles.titleCell}>
                      <span className={styles.demandaTitulo}>{demanda.titulo}</span>
                      {demanda.projeto && (
                        <span className={styles.demandaProjeto}>
                          <FolderKanban size={12} />
                          {demanda.projeto.nome}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.tipoBadge} ${styles[`tipo${demanda.tipo}`]}`}>
                      {tipoLabels[demanda.tipo]}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.prioridadeBadge} ${styles[`prioridade${demanda.prioridade}`]}`}>
                      <span className={styles.dot} />
                      {prioridadeLabels[demanda.prioridade]}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${demanda.status}`]}`}>
                      {statusLabels[demanda.status]}
                    </span>
                  </td>
                  <td>
                    {demanda.responsavel ? (
                      <div className={styles.responsavelCell}>
                        <div className={styles.responsavelAvatar}>
                          {getInitials(demanda.responsavel.nome)}
                        </div>
                        <span className={styles.responsavelNome}>
                          {demanda.responsavel.nome.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.semResponsavel}>Não atribuído</span>
                    )}
                  </td>
                  <td>
                    {demanda.prazo ? (
                      <span
                        className={`${styles.prazoCell} ${
                          isPrazoAtrasado(demanda.prazo)
                            ? styles.prazoAtrasado
                            : isPrazoProximo(demanda.prazo)
                            ? styles.prazoProximo
                            : ''
                        }`}
                      >
                        <Calendar size={14} />
                        {new Date(demanda.prazo).toLocaleDateString('pt-BR')}
                      </span>
                    ) : (
                      <span className={styles.prazoCell}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Formulário */}
      <DemandaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={selectedDemanda ? handleUpdateDemanda : handleCreateDemanda}
        demanda={selectedDemanda}
      />
    </div>
  );
}
