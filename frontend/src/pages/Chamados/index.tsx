import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button, Select } from '../../components/ui';
import { ChamadoForm } from '../../components/ChamadoForm';
import { Chamado, StatusChamado, CategoriaChamado, PrioridadeDemanda, CreateChamadoDTO, PerfilUsuario } from '../../types';
import { chamadoService, ChamadoFiltros } from '../../services';
import { useAuth } from '../../contexts';
import styles from './styles.module.css';

const statusLabels: Record<StatusChamado, string> = {
  NOVO: 'Novo',
  EM_TRIAGEM: 'Em Triagem',
  EM_ATENDIMENTO: 'Em Atendimento',
  AGUARDANDO_USUARIO: 'Aguardando Usuario',
  EM_VALIDACAO: 'Em Validacao',
  CONCLUIDO: 'Concluido',
  CANCELADO: 'Cancelado',
  REABERTO: 'Reaberto',
};

const statusColors: Record<StatusChamado, string> = {
  NOVO: '#6b7280',
  EM_TRIAGEM: '#8b5cf6',
  EM_ATENDIMENTO: '#3b82f6',
  AGUARDANDO_USUARIO: '#f59e0b',
  EM_VALIDACAO: '#06b6d4',
  CONCLUIDO: '#22c55e',
  CANCELADO: '#ef4444',
  REABERTO: '#ec4899',
};

const categoriaLabels: Record<CategoriaChamado, string> = {
  PROBLEMA: 'Problema',
  MELHORIA: 'Melhoria',
  REQUISICAO_ACESSO: 'Requisicao de Acesso',
  AUTOMACAO: 'Automacao',
  CONSULTORIA: 'Consultoria',
  OUTROS: 'Outros',
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
      case StatusChamado.EM_TRIAGEM:
        return <AlertCircle size={16} />;
      case StatusChamado.EM_ATENDIMENTO:
      case StatusChamado.AGUARDANDO_USUARIO:
      case StatusChamado.EM_VALIDACAO:
        return <Clock size={16} />;
      case StatusChamado.CONCLUIDO:
        return <CheckCircle size={16} />;
      case StatusChamado.CANCELADO:
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  }

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    ...Object.values(StatusChamado).map((s) => ({ value: s, label: statusLabels[s] })),
  ];

  const categoriaOptions = [
    { value: '', label: 'Todas as categorias' },
    ...Object.values(CategoriaChamado).map((c) => ({ value: c, label: categoriaLabels[c] })),
  ];

  const prioridadeOptions = [
    { value: '', label: 'Todas as prioridades' },
    { value: PrioridadeDemanda.BAIXA, label: 'Baixa' },
    { value: PrioridadeDemanda.MEDIA, label: 'Media' },
    { value: PrioridadeDemanda.ALTA, label: 'Alta' },
    { value: PrioridadeDemanda.CRITICA, label: 'Critica' },
  ];

  // Contar chamados por status para o resumo
  const contadores = {
    novos: chamados.filter((c) => c.status === StatusChamado.NOVO).length,
    emTriagem: chamados.filter((c) => c.status === StatusChamado.EM_TRIAGEM).length,
    emAtendimento: chamados.filter((c) => c.status === StatusChamado.EM_ATENDIMENTO).length,
    aguardando: chamados.filter((c) => c.status === StatusChamado.AGUARDANDO_USUARIO).length,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isInterno ? 'Chamados' : 'Meus Chamados'}
          </h1>
          <p className={styles.subtitle}>{chamados.length} chamados encontrados</p>
        </div>

        <div className={styles.actions}>
          {isInterno && (
            <Button variant="ghost" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={18} />
              Filtros
            </Button>
          )}

          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} />
            Novo Chamado
          </Button>
        </div>
      </div>

      {isInterno && (
        <div className={styles.stats}>
          <div className={styles.statCard} onClick={() => setFiltros({ status: StatusChamado.NOVO })}>
            <span className={styles.statValue}>{contadores.novos}</span>
            <span className={styles.statLabel}>Novos</span>
          </div>
          <div className={styles.statCard} onClick={() => setFiltros({ status: StatusChamado.EM_TRIAGEM })}>
            <span className={styles.statValue}>{contadores.emTriagem}</span>
            <span className={styles.statLabel}>Em Triagem</span>
          </div>
          <div className={styles.statCard} onClick={() => setFiltros({ status: StatusChamado.EM_ATENDIMENTO })}>
            <span className={styles.statValue}>{contadores.emAtendimento}</span>
            <span className={styles.statLabel}>Em Atendimento</span>
          </div>
          <div className={styles.statCard} onClick={() => setFiltros({ status: StatusChamado.AGUARDANDO_USUARIO })}>
            <span className={styles.statValue}>{contadores.aguardando}</span>
            <span className={styles.statLabel}>Aguardando</span>
          </div>
        </div>
      )}

      {showFilters && isInterno && (
        <div className={styles.filters}>
          <Select
            value={filtros.status || ''}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value as StatusChamado || undefined })}
            options={statusOptions}
          />
          <Select
            value={filtros.categoria || ''}
            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value as CategoriaChamado || undefined })}
            options={categoriaOptions}
          />
          <Select
            value={filtros.prioridade || ''}
            onChange={(e) => setFiltros({ ...filtros, prioridade: e.target.value as PrioridadeDemanda || undefined })}
            options={prioridadeOptions}
          />
          <Button variant="ghost" size="sm" onClick={() => setFiltros({})}>
            Limpar
          </Button>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : chamados.length === 0 ? (
        <div className={styles.empty}>
          <AlertCircle size={48} />
          <h3>Nenhum chamado encontrado</h3>
          <p>Clique em "Novo Chamado" para abrir uma solicitacao</p>
        </div>
      ) : (
        <div className={styles.list}>
          {chamados.map((chamado) => (
            <div
              key={chamado.id}
              className={styles.card}
              onClick={() => navigate(`/chamados/${chamado.id}`)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.protocolo}>#{chamado.numero_protocolo}</span>
                <span
                  className={styles.status}
                  style={{ background: statusColors[chamado.status] }}
                >
                  {getStatusIcon(chamado.status)}
                  {statusLabels[chamado.status]}
                </span>
              </div>

              <h3 className={styles.cardTitle}>{chamado.titulo}</h3>

              <p className={styles.cardDescricao}>
                {chamado.descricao.substring(0, 120)}
                {chamado.descricao.length > 120 ? '...' : ''}
              </p>

              <div className={styles.cardFooter}>
                <div className={styles.cardMeta}>
                  <span className={styles.categoria}>{categoriaLabels[chamado.categoria]}</span>
                  <span className={`${styles.prioridade} ${styles[`prioridade${chamado.prioridade}`]}`}>
                    {chamado.prioridade}
                  </span>
                </div>

                <div className={styles.cardInfo}>
                  {isInterno && chamado.solicitante && (
                    <span className={styles.solicitante}>
                      {chamado.solicitante.nome}
                      {chamado.setor_solicitante && ` - ${chamado.setor_solicitante}`}
                    </span>
                  )}
                  <span className={styles.data}>
                    {new Date(chamado.data_abertura).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {chamado.status === StatusChamado.AGUARDANDO_USUARIO && !isInterno && (
                <div className={styles.alert}>
                  Aguardando sua resposta
                </div>
              )}

              {chamado.status === StatusChamado.CONCLUIDO && !chamado.avaliacao_nota && !isInterno && (
                <div className={styles.alertSuccess}>
                  Avalie o atendimento
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ChamadoForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateChamado}
      />
    </div>
  );
}
