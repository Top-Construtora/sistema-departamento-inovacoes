import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  User,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Lock,
} from 'lucide-react';
import { Button, Select } from '../../components/ui';
import {
  Chamado,
  StatusChamado,
  CategoriaChamado,
  PrioridadeDemanda,
  Usuario,
  PerfilUsuario,
} from '../../types';
import { chamadoService, usuarioService } from '../../services';
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

const prioridadeLabels: Record<PrioridadeDemanda, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Critica',
};

// Transicoes de status permitidas
const transicoesPermitidas: Record<StatusChamado, StatusChamado[]> = {
  NOVO: [StatusChamado.EM_TRIAGEM, StatusChamado.CANCELADO],
  EM_TRIAGEM: [StatusChamado.EM_ATENDIMENTO, StatusChamado.CANCELADO],
  EM_ATENDIMENTO: [StatusChamado.AGUARDANDO_USUARIO, StatusChamado.EM_VALIDACAO, StatusChamado.CONCLUIDO, StatusChamado.CANCELADO],
  AGUARDANDO_USUARIO: [StatusChamado.EM_ATENDIMENTO, StatusChamado.CANCELADO],
  EM_VALIDACAO: [StatusChamado.CONCLUIDO, StatusChamado.EM_ATENDIMENTO],
  CONCLUIDO: [StatusChamado.REABERTO],
  CANCELADO: [StatusChamado.REABERTO],
  REABERTO: [StatusChamado.EM_TRIAGEM, StatusChamado.EM_ATENDIMENTO],
};

export function ChamadoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [loading, setLoading] = useState(true);
  const [usuariosInternos, setUsuariosInternos] = useState<Usuario[]>([]);

  // Form states
  const [novoComentario, setNovoComentario] = useState('');
  const [comentarioInterno, setComentarioInterno] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  // Avaliacao
  const [avaliacaoNota, setAvaliacaoNota] = useState(0);
  const [avaliacaoComentario, setAvaliacaoComentario] = useState('');
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [showAvaliacao, setShowAvaliacao] = useState(false);

  const isInterno = usuario?.perfil === PerfilUsuario.LIDER || usuario?.perfil === PerfilUsuario.ANALISTA;

  useEffect(() => {
    if (id) {
      loadChamado();
      if (isInterno) {
        loadUsuariosInternos();
      }
    }
  }, [id, isInterno]);

  async function loadChamado() {
    try {
      setLoading(true);
      const data = await chamadoService.buscarPorId(id!);
      setChamado(data);
    } catch (error) {
      console.error('Erro ao carregar chamado:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsuariosInternos() {
    try {
      const data = await usuarioService.listarInternos();
      setUsuariosInternos(data);
    } catch (error) {
      console.error('Erro ao carregar usuarios:', error);
    }
  }

  async function handleMudarStatus(novoStatus: StatusChamado) {
    if (!chamado) return;
    try {
      const updated = await chamadoService.atualizarStatus(chamado.id, novoStatus);
      setChamado(updated);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  async function handleAtribuirResponsavel(responsavelId: string) {
    if (!chamado) return;
    try {
      const updated = await chamadoService.atribuirResponsavel(chamado.id, responsavelId || null);
      setChamado(updated);
    } catch (error) {
      console.error('Erro ao atribuir responsavel:', error);
    }
  }

  async function handleMudarPrioridade(prioridade: PrioridadeDemanda) {
    if (!chamado) return;
    try {
      const updated = await chamadoService.atualizarPrioridade(chamado.id, prioridade);
      setChamado(updated);
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
    }
  }

  async function handleEnviarComentario(e: FormEvent) {
    e.preventDefault();
    if (!chamado || !novoComentario.trim()) return;

    try {
      setEnviandoComentario(true);
      await chamadoService.adicionarComentario(chamado.id, novoComentario, comentarioInterno);
      setNovoComentario('');
      setComentarioInterno(false);
      await loadChamado();
    } catch (error) {
      console.error('Erro ao enviar comentario:', error);
    } finally {
      setEnviandoComentario(false);
    }
  }

  async function handleEnviarAvaliacao(e: FormEvent) {
    e.preventDefault();
    if (!chamado || avaliacaoNota === 0) return;

    try {
      setEnviandoAvaliacao(true);
      const updated = await chamadoService.avaliar(chamado.id, {
        nota: avaliacaoNota,
        comentario: avaliacaoComentario || undefined,
      });
      setChamado(updated);
      setShowAvaliacao(false);
    } catch (error) {
      console.error('Erro ao enviar avaliacao:', error);
    } finally {
      setEnviandoAvaliacao(false);
    }
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

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  if (!chamado) {
    return (
      <div className={styles.notFound}>
        <AlertCircle size={48} />
        <h2>Chamado nao encontrado</h2>
        <Button onClick={() => navigate('/chamados')}>Voltar</Button>
      </div>
    );
  }

  const podeAvaliar = !isInterno && chamado.status === StatusChamado.CONCLUIDO && !chamado.avaliacao_nota;
  const podeResponder = !isInterno && chamado.status === StatusChamado.AGUARDANDO_USUARIO;
  const statusDisponiveis = transicoesPermitidas[chamado.status] || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/chamados')}>
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className={styles.headerInfo}>
          <span className={styles.protocolo}>#{chamado.numero_protocolo}</span>
          <span
            className={styles.status}
            style={{ background: statusColors[chamado.status] }}
          >
            {getStatusIcon(chamado.status)}
            {statusLabels[chamado.status]}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.main}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{chamado.titulo}</h1>
            <div className={styles.meta}>
              <span className={styles.categoria}>{categoriaLabels[chamado.categoria]}</span>
              <span className={`${styles.prioridade} ${styles[`prioridade${chamado.prioridade}`]}`}>
                {chamado.prioridade}
              </span>
            </div>
          </div>

          <div className={styles.descricaoSection}>
            <h3>Descricao</h3>
            <p className={styles.descricao}>{chamado.descricao}</p>
          </div>

          {/* Alerta para usuario responder */}
          {podeResponder && (
            <div className={styles.alertWarning}>
              <AlertCircle size={20} />
              <span>A equipe esta aguardando sua resposta. Por favor, adicione um comentario abaixo.</span>
            </div>
          )}

          {/* Alerta para avaliar */}
          {podeAvaliar && !showAvaliacao && (
            <div className={styles.alertSuccess}>
              <CheckCircle size={20} />
              <span>Seu chamado foi concluido! </span>
              <button onClick={() => setShowAvaliacao(true)}>Avaliar atendimento</button>
            </div>
          )}

          {/* Formulario de avaliacao */}
          {showAvaliacao && (
            <div className={styles.avaliacaoSection}>
              <h3>Avalie o atendimento</h3>
              <form onSubmit={handleEnviarAvaliacao}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((nota) => (
                    <button
                      key={nota}
                      type="button"
                      className={`${styles.starButton} ${nota <= avaliacaoNota ? styles.starActive : ''}`}
                      onClick={() => setAvaliacaoNota(nota)}
                    >
                      <Star size={32} fill={nota <= avaliacaoNota ? '#f59e0b' : 'none'} />
                    </button>
                  ))}
                </div>
                <textarea
                  className={styles.avaliacaoInput}
                  value={avaliacaoComentario}
                  onChange={(e) => setAvaliacaoComentario(e.target.value)}
                  placeholder="Deixe um comentario sobre o atendimento (opcional)"
                  rows={3}
                />
                <div className={styles.avaliacaoActions}>
                  <Button type="button" variant="ghost" onClick={() => setShowAvaliacao(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" loading={enviandoAvaliacao} disabled={avaliacaoNota === 0}>
                    Enviar Avaliacao
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Avaliacao ja feita */}
          {chamado.avaliacao_nota && (
            <div className={styles.avaliacaoFeita}>
              <h3>Avaliacao do Atendimento</h3>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((nota) => (
                  <Star
                    key={nota}
                    size={24}
                    className={nota <= chamado.avaliacao_nota! ? styles.starFilled : styles.starEmpty}
                    fill={nota <= chamado.avaliacao_nota! ? '#f59e0b' : 'none'}
                  />
                ))}
              </div>
              {chamado.avaliacao_comentario && (
                <p className={styles.avaliacaoComentario}>{chamado.avaliacao_comentario}</p>
              )}
            </div>
          )}

          {/* Timeline de comentarios */}
          <div className={styles.timelineSection}>
            <h3>
              <MessageSquare size={20} />
              Timeline
            </h3>

            <div className={styles.timeline}>
              {/* Evento de abertura */}
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon} style={{ background: '#6b7280' }}>
                  <AlertCircle size={16} />
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <strong>Chamado aberto</strong>
                    <span className={styles.timelineDate}>
                      {new Date(chamado.data_abertura).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p>Por {chamado.solicitante?.nome || 'Usuario'}</p>
                </div>
              </div>

              {/* Comentarios */}
              {chamado.comentarios?.map((comentario) => (
                <div key={comentario.id} className={styles.timelineItem}>
                  <div
                    className={styles.timelineIcon}
                    style={{ background: comentario.interno ? '#8b5cf6' : '#3b82f6' }}
                  >
                    {comentario.interno ? <Lock size={16} /> : <MessageSquare size={16} />}
                  </div>
                  <div className={`${styles.timelineContent} ${comentario.interno ? styles.interno : ''}`}>
                    <div className={styles.timelineHeader}>
                      <strong>{comentario.autor?.nome || 'Usuario'}</strong>
                      {comentario.interno && <span className={styles.badgeInterno}>Interno</span>}
                      <span className={styles.timelineDate}>
                        {new Date(comentario.data).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p>{comentario.mensagem}</p>
                  </div>
                </div>
              ))}

              {chamado.data_fechamento && (
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIcon} style={{ background: '#22c55e' }}>
                    <CheckCircle size={16} />
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <strong>Chamado finalizado</strong>
                      <span className={styles.timelineDate}>
                        {new Date(chamado.data_fechamento).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario de novo comentario */}
            {chamado.status !== StatusChamado.CONCLUIDO && chamado.status !== StatusChamado.CANCELADO && (
              <form onSubmit={handleEnviarComentario} className={styles.comentarioForm}>
                <textarea
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  rows={3}
                  required
                />
                <div className={styles.comentarioActions}>
                  {isInterno && (
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={comentarioInterno}
                        onChange={(e) => setComentarioInterno(e.target.checked)}
                      />
                      <Lock size={14} />
                      Comentario interno (nao visivel para o solicitante)
                    </label>
                  )}
                  <Button type="submit" loading={enviandoComentario}>
                    <Send size={16} />
                    Enviar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar com informacoes e acoes */}
        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3>Informacoes</h3>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Solicitante</span>
              <span className={styles.infoValue}>
                <User size={14} />
                {chamado.solicitante?.nome}
              </span>
            </div>

            {chamado.setor_solicitante && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Setor</span>
                <span className={styles.infoValue}>{chamado.setor_solicitante}</span>
              </div>
            )}

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Data de Abertura</span>
              <span className={styles.infoValue}>
                {new Date(chamado.data_abertura).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {chamado.data_fechamento && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Data de Fechamento</span>
                <span className={styles.infoValue}>
                  {new Date(chamado.data_fechamento).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Responsavel</span>
              <span className={styles.infoValue}>
                {chamado.responsavel?.nome || 'Nao atribuido'}
              </span>
            </div>
          </div>

          {/* Controles para usuarios internos */}
          {isInterno && (
            <div className={styles.controlsCard}>
              <h3>Gerenciar</h3>

              <div className={styles.controlItem}>
                <label>Responsavel</label>
                <Select
                  value={chamado.responsavel_id || ''}
                  onChange={(e) => handleAtribuirResponsavel(e.target.value)}
                  options={[
                    { value: '', label: 'Nao atribuido' },
                    ...usuariosInternos.map((u) => ({ value: u.id, label: u.nome })),
                  ]}
                />
              </div>

              <div className={styles.controlItem}>
                <label>Prioridade</label>
                <Select
                  value={chamado.prioridade}
                  onChange={(e) => handleMudarPrioridade(e.target.value as PrioridadeDemanda)}
                  options={Object.entries(prioridadeLabels).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </div>

              {statusDisponiveis.length > 0 && (
                <div className={styles.controlItem}>
                  <label>Mudar Status</label>
                  <div className={styles.statusButtons}>
                    {statusDisponiveis.map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMudarStatus(status)}
                        style={{ borderColor: statusColors[status], color: statusColors[status] }}
                      >
                        {statusLabels[status]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
