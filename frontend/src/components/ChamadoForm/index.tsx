import { useState, FormEvent } from 'react';
import { Button, Input, Select, Modal } from '../ui';
import { CreateChamadoDTO, CategoriaChamado, PrioridadeDemanda } from '../../types';
import styles from './styles.module.css';

interface ChamadoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChamadoDTO) => Promise<void>;
}

const categoriaOptions = [
  { value: CategoriaChamado.PROBLEMA, label: 'Problema' },
  { value: CategoriaChamado.MELHORIA, label: 'Melhoria' },
  { value: CategoriaChamado.REQUISICAO_ACESSO, label: 'Requisicao de Acesso' },
  { value: CategoriaChamado.AUTOMACAO, label: 'Automacao' },
  { value: CategoriaChamado.CONSULTORIA, label: 'Consultoria' },
  { value: CategoriaChamado.OUTROS, label: 'Outros' },
];

const prioridadeOptions = [
  { value: PrioridadeDemanda.BAIXA, label: 'Baixa' },
  { value: PrioridadeDemanda.MEDIA, label: 'Media' },
  { value: PrioridadeDemanda.ALTA, label: 'Alta' },
  { value: PrioridadeDemanda.CRITICA, label: 'Critica' },
];

export function ChamadoForm({ isOpen, onClose, onSubmit }: ChamadoFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateChamadoDTO>({
    titulo: '',
    descricao: '',
    categoria: CategoriaChamado.OUTROS,
    prioridade: PrioridadeDemanda.MEDIA,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      setFormData({
        titulo: '',
        descricao: '',
        categoria: CategoriaChamado.OUTROS,
        prioridade: PrioridadeDemanda.MEDIA,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Abrir Chamado"
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Titulo"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          placeholder="Resumo do seu problema ou solicitacao"
          required
        />

        <div className={styles.textarea}>
          <label className={styles.label}>Descricao</label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Descreva detalhadamente sua solicitacao..."
            rows={5}
            required
          />
        </div>

        <div className={styles.row}>
          <Select
            label="Categoria"
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaChamado })}
            options={categoriaOptions}
          />

          <Select
            label="Prioridade"
            value={formData.prioridade}
            onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as PrioridadeDemanda })}
            options={prioridadeOptions}
          />
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Abrir Chamado
          </Button>
        </div>
      </form>
    </Modal>
  );
}
