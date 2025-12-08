import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, Filter } from 'lucide-react';
import { Button, Select } from '../../components/ui';
import { KanbanBoard } from '../../components/Kanban';
import { DemandaForm } from '../../components/DemandaForm';
import { Demanda, StatusDemanda, TipoDemanda, PrioridadeDemanda, CreateDemandaDTO } from '../../types';
import { demandaService, DemandaFiltros } from '../../services';
import styles from './styles.module.css';

type ViewMode = 'kanban' | 'list';

export function Demandas() {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDemanda, setSelectedDemanda] = useState<Demanda | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState<DemandaFiltros>({});

  useEffect(() => {
    loadDemandas();
  }, [filtros]);

  async function loadDemandas() {
    try {
      setLoading(true);
      const data = await demandaService.listar(filtros);
      setDemandas(data);
    } catch (error) {
      console.error('Erro ao carregar demandas:', error);
    } finally {
      setLoading(false);
    }
  }

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

  const tipoOptions = [
    { value: '', label: 'Todos os tipos' },
    ...Object.values(TipoDemanda).map((t) => ({ value: t, label: t.replace('_', ' ') })),
  ];

  const prioridadeOptions = [
    { value: '', label: 'Todas as prioridades' },
    ...Object.values(PrioridadeDemanda).map((p) => ({ value: p, label: p })),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Demandas</h1>
          <p className={styles.subtitle}>{demandas.length} demandas encontradas</p>
        </div>

        <div className={styles.actions}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'kanban' ? styles.active : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>

          <Button variant="ghost" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            Filtros
          </Button>

          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} />
            Nova Demanda
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filters}>
          <Select
            placeholder="Tipo"
            value={filtros.tipo || ''}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value || undefined })}
            options={tipoOptions}
          />
          <Select
            placeholder="Prioridade"
            value={filtros.prioridade || ''}
            onChange={(e) => setFiltros({ ...filtros, prioridade: e.target.value || undefined })}
            options={prioridadeOptions}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltros({})}
          >
            Limpar
          </Button>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          demandas={demandas}
          onStatusChange={handleStatusChange}
          onCardClick={handleCardClick}
        />
      ) : (
        <div className={styles.list}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Tipo</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Responsavel</th>
                <th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {demandas.map((demanda) => (
                <tr key={demanda.id} onClick={() => handleCardClick(demanda)}>
                  <td>
                    <span className={styles.demandaTitulo}>{demanda.titulo}</span>
                    {demanda.projeto && (
                      <span className={styles.demandaProjeto}>{demanda.projeto.nome}</span>
                    )}
                  </td>
                  <td>{demanda.tipo.replace('_', ' ')}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge${demanda.prioridade}`]}`}>
                      {demanda.prioridade}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badgeStatus${demanda.status}`]}`}>
                      {demanda.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{demanda.responsavel?.nome || '-'}</td>
                  <td>
                    {demanda.prazo
                      ? new Date(demanda.prazo).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DemandaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={selectedDemanda ? handleUpdateDemanda : handleCreateDemanda}
        demanda={selectedDemanda}
      />
    </div>
  );
}
