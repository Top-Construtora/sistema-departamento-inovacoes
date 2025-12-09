import { useState, useEffect, FormEvent } from 'react';
import { Button, Input, Select, Modal } from '../ui';
import { Demanda, CreateDemandaDTO, TipoDemanda, PrioridadeDemanda, Projeto, Usuario } from '../../types';
import { projetoService, usuarioService } from '../../services';
import styles from './styles.module.css';

interface DemandaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDemandaDTO) => Promise<void>;
  demanda?: Demanda | null;
}

const tipoOptions = [
  { value: TipoDemanda.BUG, label: 'Bug' },
  { value: TipoDemanda.MELHORIA, label: 'Melhoria' },
  { value: TipoDemanda.NOVA_FEATURE, label: 'Nova Feature' },
  { value: TipoDemanda.ESTUDO, label: 'Estudo' },
  { value: TipoDemanda.SUPORTE_INTERNO, label: 'Suporte Interno' },
  { value: TipoDemanda.DOCUMENTACAO, label: 'Documentacao' },
  { value: TipoDemanda.OUTRO, label: 'Outro' },
];

const prioridadeOptions = [
  { value: PrioridadeDemanda.BAIXA, label: 'Baixa' },
  { value: PrioridadeDemanda.MEDIA, label: 'Media' },
  { value: PrioridadeDemanda.ALTA, label: 'Alta' },
  { value: PrioridadeDemanda.CRITICA, label: 'Critica' },
];

export function DemandaForm({ isOpen, onClose, onSubmit, demanda }: DemandaFormProps) {
  const [loading, setLoading] = useState(false);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState<CreateDemandaDTO>({
    titulo: '',
    descricao: '',
    tipo: TipoDemanda.OUTRO,
    prioridade: PrioridadeDemanda.MEDIA,
    projeto_id: '',
    responsavel_id: '',
    prazo: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadProjetos();
      loadUsuarios();
      if (demanda) {
        setFormData({
          titulo: demanda.titulo,
          descricao: demanda.descricao || '',
          tipo: demanda.tipo,
          prioridade: demanda.prioridade,
          projeto_id: demanda.projeto_id || '',
          responsavel_id: demanda.responsavel_id || '',
          prazo: demanda.prazo ? demanda.prazo.split('T')[0] : '',
        });
      } else {
        setFormData({
          titulo: '',
          descricao: '',
          tipo: TipoDemanda.OUTRO,
          prioridade: PrioridadeDemanda.MEDIA,
          projeto_id: '',
          responsavel_id: '',
          prazo: '',
        });
      }
    }
  }, [isOpen, demanda]);

  async function loadProjetos() {
    try {
      const data = await projetoService.listar();
      setProjetos(data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  }

  async function loadUsuarios() {
    try {
      const data = await usuarioService.listar();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar demanda:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={demanda ? 'Editar Demanda' : 'Nova Demanda'}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Titulo"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          placeholder="Titulo da demanda"
          required
        />

        <div className={styles.textarea}>
          <label className={styles.label}>Descricao</label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Descreva a demanda..."
            rows={3}
          />
        </div>

        <div className={styles.row}>
          <Select
            label="Tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoDemanda })}
            options={tipoOptions}
          />

          <Select
            label="Prioridade"
            value={formData.prioridade}
            onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as PrioridadeDemanda })}
            options={prioridadeOptions}
          />
        </div>

        <div className={styles.row}>
          <Select
            label="Projeto (opcional)"
            value={formData.projeto_id || ''}
            onChange={(e) => setFormData({ ...formData, projeto_id: e.target.value })}
            options={[
              { value: '', label: 'Selecione um projeto' },
              ...projetos.map((p) => ({ value: p.id, label: p.nome }))
            ]}
          />

          <Select
            label="Responsável (opcional)"
            value={formData.responsavel_id || ''}
            onChange={(e) => setFormData({ ...formData, responsavel_id: e.target.value })}
            options={[
              { value: '', label: 'Selecione um responsável' },
              ...usuarios.map((u) => ({ value: u.id, label: u.nome }))
            ]}
          />
        </div>

        <Input
          label="Prazo (opcional)"
          type="date"
          value={formData.prazo || ''}
          onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
        />

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {demanda ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
