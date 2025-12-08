import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Headphones,
  FileText,
  Search,
  MessageSquare,
  RotateCcw,
  Calendar,
  Star,
  X,
  Inbox
} from 'lucide-react';
import { ChamadoForm } from '../../components/ChamadoForm';
import {
  Chamado,
  StatusChamado,
  CategoriaChamado,
  PrioridadeDemanda,
  CreateChamadoDTO,
  PerfilUsuario
} from '../../types';
import { chamadoService, ChamadoFiltros } from '../../services';
import { useAuth } from '../../contexts';
import styles from './styles.module.css';

const statusLabels: Record<StatusChamado, string> = {
  NOVO: 'Novo',
  EM_TRIAGEM: 'Em Triagem',
  EM_ATENDIMENTO: 'Em Atendimento',
  AGUARDANDO_USUARIO: 'Aguardando',
  EM_VALIDACAO: 'Em Validacao',
  CONCLUIDO: 'Concluido',
  CANCELADO: 'Cancelado',
  REABERTO: 'Reaberto',
};

const categoriaLabels: Record<CategoriaChamado, string> = {
  PROBLEMA: 'Problema',
  MELHORIA: 'Melhoria',
  REQUISICAO_ACESSO: 'Requisicao de Acesso',
  AUTOMACAO: 'Automacao',
  CONSULTORIA: 'Consultoria',
  OUTROS: 'Outros',
};

const prioridadeLabels: Record<PrioridadeDemanda, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Critica',
};

export function Chamados() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState<ChamadoFiltros>({});

  const isInterno = usuario?.perfil === PerfilUsuario.LIDER || usuario?.perfil === PerfilUsuario.ANALISTA;

  useEffect(() => {
    loadChamados();
  }, [filtros]);

  async function loadChamados() {
    try {
      setLoading(true);
      const data = await chamadoService.listar(filtros);
      setChamados(data);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateChamado(data: CreateChamadoDTO) {
    await chamadoService.criar(data);
    loadChamados();
  }

  function getStatusIcon(status: StatusChamado) {
    switch (status) {
      case StatusChamado.NOVO:
        return <Inbox size={14} />;
      case StatusChamado.EM_TRIAGEM:
        return <Search size={14} />;
      case StatusChamado.EM_ATENDIMENTO:
        return <Headphones size={14} />;
      case StatusChamado.AGUARDANDO_USUARIO:
        return <Clock size={14} />;
      case StatusChamado.EM_VALIDACAO:
        return <FileText size={14} />;
      case StatusChamado.CONCLUIDO:
        return <CheckCircle size={14} />;
      case StatusChamado.CANCELADO:
        return <XCircle size={14} />;
      case StatusChamado.REABERTO:
        return <RotateCcw size={14} />;
      default:
        return <MessageSquare size={14} />;
    }
  }

  // Contadores de chamados por status
  const contadores = useMemo(() => {
    const novos = chamados.filter((c) => c.status === StatusChamado.NOVO).length;
    const emTriagem = chamados.filter((c) => c.status === StatusChamado.EM_TRIAGEM).length;
    const emAtendimento = chamados.filter((c) => c.status === StatusChamado.EM_ATENDIMENTO).length;
    const aguardando = chamados.filter((c) => c.status === StatusChamado.AGUARDANDO_USUARIO).length;
    const concluidos = chamados.filter((c) => c.status === StatusChamado.CONCLUIDO).length;
    return { novos, emTriagem, emAtendimento, aguardando, concluidos, total: chamados.length };
  }, [chamados]);

  // Verifica se tem filtros ativos
  const hasActiveFilters = filtros.status || filtros.categoria || filtros.prioridade;

  function getInitials(nome: string): string {
    return nome.split(' ').slice(0, 2).map(n => n.charAt(0).toUpperCase()).join('');
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Carregando chamados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            {isInterno ? 'Chamados' : 'Meus Chamados'}
          </h1>
          <p className={styles.subtitle}>
            {contadores.total} {contadores.total === 1 ? 'chamado encontrado' : 'chamados encontrados'}
          </p>
        </div>

        <div className={styles.actions}>
          {isInterno && (
            <button
              className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filtros
              {hasActiveFilters && <span style={{ marginLeft: '0.25rem' }}>•</span>}
            </button>
          )}

          <button className={styles.newButton} onClick={() => setIsFormOpen(true)}>
            <Plus size={18} />
            Novo Chamado
          </button>
        </div>
      </div>

      {/* Stats Cards - apenas para usuarios internos */}
      {isInterno && (
        <div className={styles.stats}>
          <div
            className={`${styles.statCard} ${styles.statCardNovos}`}
            onClick={() => setFiltros({ status: StatusChamado.NOVO })}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Inbox size={18} />
              </div>
            </div>
            <span className={styles.statValue}>{contadores.novos}</span>
            <span className={styles.statLabel}>Novos</span>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardTriagem}`}
            onClick={() => setFiltros({ status: StatusChamado.EM_TRIAGEM })}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Search size={18} />
              </div>
            </div>
            <span className={styles.statValue}>{contadores.emTriagem}</span>
            <span className={styles.statLabel}>Em Triagem</span>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardAtendimento}`}
            onClick={() => setFiltros({ status: StatusChamado.EM_ATENDIMENTO })}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Headphones size={18} />
              </div>
            </div>
            <span className={styles.statValue}>{contadores.emAtendimento}</span>
            <span className={styles.statLabel}>Em Atendimento</span>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardAguardando}`}
            onClick={() => setFiltros({ status: StatusChamado.AGUARDANDO_USUARIO })}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Clock size={18} />
              </div>
            </div>
            <span className={styles.statValue}>{contadores.aguardando}</span>
            <span className={styles.statLabel}>Aguardando</span>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCardConcluido}`}
            onClick={() => setFiltros({ status: StatusChamado.CONCLUIDO })}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <CheckCircle size={18} />
              </div>
            </div>
            <span className={styles.statValue}>{contadores.concluidos}</span>
            <span className={styles.statLabel}>Concluidos</span>
          </div>
        </div>
      )}

      {/* Painel de Filtros */}
      {showFilters && isInterno && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              className={styles.filterSelect}
              value={filtros.status || ''}
              onChange={(e) => setFiltros({ ...filtros, status: (e.target.value as StatusChamado) || undefined })}
            >
              <option value="">Todos os status</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Categoria</label>
            <select
              className={styles.filterSelect}
              value={filtros.categoria || ''}
              onChange={(e) => setFiltros({ ...filtros, categoria: (e.target.value as CategoriaChamado) || undefined })}
            >
              <option value="">Todas as categorias</option>
              {Object.entries(categoriaLabels).map(([value, label]) => (
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

      {/* Lista de Chamados */}
      {chamados.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Headphones size={36} />
          </div>
          <h3 className={styles.emptyTitle}>
            {hasActiveFilters ? 'Nenhum chamado encontrado' : 'Nenhum chamado cadastrado'}
          </h3>
          <p className={styles.emptyText}>
            {hasActiveFilters
              ? 'Tente ajustar os filtros para encontrar chamados'
              : 'Clique em "Novo Chamado" para abrir uma solicitacao'}
          </p>
          {!hasActiveFilters && (
            <button className={styles.emptyButton} onClick={() => setIsFormOpen(true)}>
              <Plus size={18} />
              Novo Chamado
            </button>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {chamados.map((chamado) => (
            <div
              key={chamado.id}
              className={`${styles.card} ${styles[`card${chamado.status}`]}`}
              onClick={() => navigate(`/chamados/${chamado.id}`)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.protocolo}>
                  <FileText size={14} className={styles.protocoloIcon} />
                  #{chamado.numero_protocolo}
                </span>
                <span className={`${styles.status} ${styles[`status${chamado.status}`]}`}>
                  {getStatusIcon(chamado.status)}
                  {statusLabels[chamado.status]}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{chamado.titulo}</h3>

              <p className={styles.cardDescricao}>
                {chamado.descricao.substring(0, 150)}
                {chamado.descricao.length > 150 ? '...' : ''}
              </p>

              <div className={styles.cardFooter}>
                <div className={styles.cardMeta}>
                  <span className={`${styles.categoria} ${styles[`categoria${chamado.categoria}`]}`}>
                    {categoriaLabels[chamado.categoria]}
                  </span>
                  <span className={`${styles.prioridade} ${styles[`prioridade${chamado.prioridade}`]}`}>
                    <span className={styles.prioridadeDot} />
                    {prioridadeLabels[chamado.prioridade]}
                  </span>
                </div>

                <div className={styles.cardInfo}>
                  {isInterno && chamado.solicitante && (
                    <div className={styles.solicitante}>
                      <div className={styles.solicitanteAvatar}>
                        {getInitials(chamado.solicitante.nome)}
                      </div>
                      <span className={styles.solicitanteNome}>
                        {chamado.solicitante.nome.split(' ').slice(0, 2).join(' ')}
                        {chamado.setor_solicitante && ` - ${chamado.setor_solicitante}`}
                      </span>
                    </div>
                  )}
                  <span className={styles.data}>
                    <Calendar size={14} />
                    {new Date(chamado.data_abertura).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {chamado.status === StatusChamado.AGUARDANDO_USUARIO && !isInterno && (
                <div className={styles.alert}>
                  <AlertCircle size={16} className={styles.alertIcon} />
                  Aguardando sua resposta
                </div>
              )}

              {chamado.status === StatusChamado.CONCLUIDO && !chamado.avaliacao_nota && !isInterno && (
                <div className={styles.alertSuccess}>
                  <Star size={16} className={styles.alertIcon} />
                  Avalie o atendimento
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulario */}
      <ChamadoForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateChamado}
      />
    </div>
  );
}
