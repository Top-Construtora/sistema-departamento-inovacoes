import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ExternalLink,
  Server,
  Cloud,
  Database,
  Code,
  BookOpen,
  MessageSquare,
  BarChart,
  Wrench,
  Link2,
  Search,
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../../components/ui';
import { SistemaAcesso, TipoSistemaAcesso, CreateSistemaAcessoDTO, Usuario } from '../../types';
import { sistemaAcessoService, usuarioService } from '../../services';
import styles from './styles.module.css';

const tipoLabels: Record<TipoSistemaAcesso, string> = {
  PLATAFORMA_CURSO: 'Plataforma de Curso',
  DESENVOLVIMENTO: 'Desenvolvimento',
  INFRA: 'Infraestrutura',
  COMUNICACAO: 'Comunicacao',
  ANALYTICS: 'Analytics',
  CLOUD: 'Cloud',
  BANCO_DADOS: 'Banco de Dados',
  API_EXTERNA: 'API Externa',
  FERRAMENTA_INTERNA: 'Ferramenta Interna',
  OUTRO: 'Outro',
};

const tipoIcons: Record<TipoSistemaAcesso, typeof Server> = {
  PLATAFORMA_CURSO: BookOpen,
  DESENVOLVIMENTO: Code,
  INFRA: Server,
  COMUNICACAO: MessageSquare,
  ANALYTICS: BarChart,
  CLOUD: Cloud,
  BANCO_DADOS: Database,
  API_EXTERNA: Link2,
  FERRAMENTA_INTERNA: Wrench,
  OUTRO: Server,
};

const tipoColors: Record<TipoSistemaAcesso, string> = {
  PLATAFORMA_CURSO: '#8b5cf6',
  DESENVOLVIMENTO: '#3b82f6',
  INFRA: '#6b7280',
  COMUNICACAO: '#22c55e',
  ANALYTICS: '#f59e0b',
  CLOUD: '#06b6d4',
  BANCO_DADOS: '#ec4899',
  API_EXTERNA: '#14b8a6',
  FERRAMENTA_INTERNA: '#f97316',
  OUTRO: '#6b7280',
};

export function SistemasAcesso() {
  const navigate = useNavigate();
  const [sistemas, setSistemas] = useState<SistemaAcesso[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Form state
  const [formData, setFormData] = useState<CreateSistemaAcessoDTO>({
    nome: '',
    url: '',
    tipo: TipoSistemaAcesso.OUTRO,
    observacoes: '',
    instrucoes_acesso: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadSistemas();
    loadUsuarios();
  }, []);

  async function loadSistemas() {
    try {
      setLoading(true);
      const data = await sistemaAcessoService.listar();
      setSistemas(data);
    } catch (error) {
      console.error('Erro ao carregar sistemas:', error);
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
      await sistemaAcessoService.criar(formData);
      setFormData({
        nome: '',
        url: '',
        tipo: TipoSistemaAcesso.OUTRO,
        observacoes: '',
        instrucoes_acesso: '',
      });
      setIsFormOpen(false);
      loadSistemas();
    } catch (error) {
      console.error('Erro ao criar sistema:', error);
    } finally {
      setFormLoading(false);
    }
  }

  // Filtrar sistemas
  const sistemasFiltrados = sistemas.filter((sistema) => {
    const matchBusca = sistema.nome.toLowerCase().includes(busca.toLowerCase()) ||
      sistema.observacoes?.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = !filtroTipo || sistema.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  // Agrupar por tipo
  const sistemasPorTipo = sistemasFiltrados.reduce((acc, sistema) => {
    const tipo = sistema.tipo;
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(sistema);
    return acc;
  }, {} as Record<TipoSistemaAcesso, SistemaAcesso[]>);

  const tipoOptions = [
    { value: '', label: 'Todos os tipos' },
    ...Object.entries(tipoLabels).map(([value, label]) => ({ value, label })),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sistemas & Acessos</h1>
          <p className={styles.subtitle}>Catalogo de sistemas e plataformas do departamento</p>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <Plus size={18} />
          Novo Sistema
        </Button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar sistemas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          options={tipoOptions}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : sistemasFiltrados.length === 0 ? (
        <div className={styles.empty}>
          <Server size={48} />
          <h3>Nenhum sistema encontrado</h3>
          <p>Adicione sistemas ao catalogo para gerenciar acessos</p>
        </div>
      ) : (
        <div className={styles.content}>
          {Object.entries(sistemasPorTipo).map(([tipo, sistemas]) => {
            const Icon = tipoIcons[tipo as TipoSistemaAcesso];
            const color = tipoColors[tipo as TipoSistemaAcesso];

            return (
              <div key={tipo} className={styles.section}>
                <div className={styles.sectionHeader} style={{ borderColor: color }}>
                  <Icon size={20} style={{ color }} />
                  <h2>{tipoLabels[tipo as TipoSistemaAcesso]}</h2>
                  <span className={styles.count}>{sistemas.length}</span>
                </div>

                <div className={styles.grid}>
                  {sistemas.map((sistema) => (
                    <div
                      key={sistema.id}
                      className={styles.card}
                      onClick={() => navigate(`/sistemas-acesso/${sistema.id}`)}
                    >
                      <div className={styles.cardHeader}>
                        <div
                          className={styles.cardIcon}
                          style={{ background: `${color}20`, color }}
                        >
                          <Icon size={24} />
                        </div>
                        {sistema.url && (
                          <a
                            href={sistema.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={styles.externalLink}
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>

                      <h3 className={styles.cardTitle}>{sistema.nome}</h3>

                      {sistema.observacoes && (
                        <p className={styles.cardDescription}>
                          {sistema.observacoes.substring(0, 80)}
                          {sistema.observacoes.length > 80 ? '...' : ''}
                        </p>
                      )}

                      {sistema.responsavel && (
                        <div className={styles.cardFooter}>
                          <span className={styles.responsavel}>
                            Responsavel: {sistema.responsavel.nome}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de novo sistema */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Novo Sistema"
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Nome do sistema"
            required
          />

          <Input
            label="URL"
            type="url"
            value={formData.url || ''}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://..."
          />

          <Select
            label="Tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoSistemaAcesso })}
            options={Object.entries(tipoLabels).map(([value, label]) => ({ value, label }))}
          />

          <Select
            label="Responsavel"
            value={formData.responsavel_id || ''}
            onChange={(e) => setFormData({ ...formData, responsavel_id: e.target.value || undefined })}
            options={[
              { value: '', label: 'Selecione...' },
              ...usuarios.map((u) => ({ value: u.id, label: u.nome })),
            ]}
          />

          <div className={styles.textareaWrapper}>
            <label>Observacoes</label>
            <textarea
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Descricao breve do sistema..."
              rows={3}
            />
          </div>

          <div className={styles.textareaWrapper}>
            <label>Instrucoes de Acesso</label>
            <textarea
              value={formData.instrucoes_acesso || ''}
              onChange={(e) => setFormData({ ...formData, instrucoes_acesso: e.target.value })}
              placeholder="Como solicitar acesso, passos necessarios..."
              rows={4}
            />
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={formLoading}>
              Criar Sistema
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
