import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, ExternalLink, Plus, Pencil } from 'lucide-react';
import { Button, Input, Select, Modal } from '../../components/ui';
import { KanbanBoard } from '../../components/Kanban';
import { DemandaForm } from '../../components/DemandaForm';
import { Projeto, Demanda, StatusDemanda, StatusProjeto, TipoProjeto, NivelRisco, CreateDemandaDTO, CreateProjetoDTO, Usuario } from '../../types';
import { projetoService, demandaService, usuarioService } from '../../services';
import { formatDateBR } from '../../utils';
import styles from './styles.module.css';

const statusLabels: Record<StatusProjeto, string> = {
  IDEIA: 'Ideia',
  EM_ANALISE: 'Em Análise',
  EM_DESENVOLVIMENTO: 'Em Desenvolvimento',
  EM_TESTES: 'Em Testes',
  EM_PRODUCAO: 'Em Produção',
  ARQUIVADO: 'Arquivado',
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

export function ProjetoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Estados para edição do projeto
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
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
    if (id) {
      loadData();
    }
    loadUsuarios();
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

  async function loadUsuarios() {
    try {
      const data = await usuarioService.listarInternos();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuarios:', error);
    }
  }

  function openEditForm() {
    if (!projeto) return;
    setFormData({
      nome: projeto.nome,
      descricao: projeto.descricao || '',
      objetivo: projeto.objetivo || '',
      tipo: projeto.tipo,
      status: projeto.status,
      lider_id: projeto.lider_id,
      data_inicio: projeto.data_inicio || '',
      data_fim_prevista: projeto.data_fim_prevista || '',
      risco: projeto.risco || NivelRisco.BAIXO,
      tags: projeto.tags || [],
    });
    setTagsInput(projeto.tags?.join(', ') || '');
    setIsEditOpen(true);
  }

  function closeEditForm() {
    setIsEditOpen(false);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!projeto) return;
    setEditLoading(true);

    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await projetoService.atualizar(projeto.id, {
        ...formData,
        tags,
      });

      closeEditForm();
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
    } finally {
      setEditLoading(false);
    }
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
        <Button variant="secondary" onClick={openEditForm}>
          <Pencil size={16} />
          Editar Projeto
        </Button>
      </div>

      {projeto.descricao && (
        <p className={styles.descricao}>{projeto.descricao}</p>
      )}

      <div className={styles.meta}>
        {projeto.lider && (
          <div className={styles.metaItem}>
            <Users size={16} />
            <span>Responsável: {projeto.lider.nome}</span>
          </div>
        )}

        {projeto.data_inicio && (
          <div className={styles.metaItem}>
            <Calendar size={16} />
            <span>Início: {formatDateBR(projeto.data_inicio)}</span>
          </div>
        )}

        {projeto.data_fim_prevista && (
          <div className={styles.metaItem}>
            <Calendar size={16} />
            <span>Previsao: {formatDateBR(projeto.data_fim_prevista)}</span>
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

      {/* Modal de edição do projeto */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEditForm}
        title="Editar Projeto"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className={styles.form}>
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
              label="Status"
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
              value={formData.data_inicio ? formData.data_inicio.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
            />

            <Input
              label="Previsão de Conclusão"
              type="date"
              value={formData.data_fim_prevista ? formData.data_fim_prevista.split('T')[0] : ''}
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
            <Button type="button" variant="ghost" onClick={closeEditForm}>
              Cancelar
            </Button>
            <Button type="submit" loading={editLoading}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
