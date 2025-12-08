import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, ExternalLink, Plus } from 'lucide-react';
import { Button } from '../../components/ui';
import { KanbanBoard } from '../../components/Kanban';
import { DemandaForm } from '../../components/DemandaForm';
import { Projeto, Demanda, StatusDemanda, StatusProjeto, CreateDemandaDTO } from '../../types';
import { projetoService, demandaService } from '../../services';
import styles from './styles.module.css';

const statusLabels: Record<StatusProjeto, string> = {
  IDEIA: 'Ideia',
  EM_ANALISE: 'Em Analise',
  EM_DESENVOLVIMENTO: 'Em Desenvolvimento',
  EM_TESTES: 'Em Testes',
  EM_PRODUCAO: 'Em Producao',
  ARQUIVADO: 'Arquivado',
};

export function ProjetoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const [projetoData, demandasData] = await Promise.all([
        projetoService.buscarPorId(id!),
        demandaService.listar({ projeto_id: id }),
      ]);
      setProjeto(projetoData);
      setDemandas(demandasData);
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(demandaId: string, status: StatusDemanda) {
    try {
      await demandaService.atualizarStatus(demandaId, status);
      setDemandas((prev) =>
        prev.map((d) => (d.id === demandaId ? { ...d, status } : d))
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  async function handleCreateDemanda(data: CreateDemandaDTO) {
    await demandaService.criar({ ...data, projeto_id: id });
    loadData();
  }

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  if (!projeto) {
    return <div className={styles.loading}>Projeto nao encontrado</div>;
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate('/projetos')}>
        <ArrowLeft size={18} />
        Voltar para projetos
      </button>

      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <span className={styles.tipo}>{projeto.tipo.replace('_', ' ')}</span>
          <h1 className={styles.title}>{projeto.nome}</h1>
          <span className={styles.status}>
            {statusLabels[projeto.status]}
          </span>
        </div>
      </div>

      {projeto.descricao && (
        <p className={styles.descricao}>{projeto.descricao}</p>
      )}

      <div className={styles.meta}>
        {projeto.lider && (
          <div className={styles.metaItem}>
            <Users size={16} />
            <span>Lider: {projeto.lider.nome}</span>
          </div>
        )}

        {projeto.data_inicio && (
          <div className={styles.metaItem}>
            <Calendar size={16} />
            <span>Inicio: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        {projeto.data_fim_prevista && (
          <div className={styles.metaItem}>
            <Calendar size={16} />
            <span>Previsao: {new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>

      {projeto.equipe && projeto.equipe.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Equipe</h3>
          <div className={styles.equipe}>
            {projeto.equipe.map((membro) => (
              <div key={membro.id} className={styles.membro}>
                <div className={styles.membroAvatar}>
                  {membro.nome.charAt(0).toUpperCase()}
                </div>
                <span>{membro.nome}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {projeto.links_externos && projeto.links_externos.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Links</h3>
          <div className={styles.links}>
            {projeto.links_externos.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <ExternalLink size={14} />
                {link.titulo}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Demandas ({demandas.length})</h3>
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} />
            Nova Demanda
          </Button>
        </div>

        <KanbanBoard
          demandas={demandas}
          onStatusChange={handleStatusChange}
        />
      </div>

      <DemandaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateDemanda}
      />
    </div>
  );
}
