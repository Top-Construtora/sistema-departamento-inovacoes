import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, Flag } from 'lucide-react';
import { Demanda, PrioridadeDemanda } from '../../../types';
import styles from './styles.module.css';

interface KanbanCardProps {
  demanda: Demanda;
  onClick?: () => void;
}

const prioridadeColors: Record<PrioridadeDemanda, string> = {
  BAIXA: '#22c55e',
  MEDIA: '#eab308',
  ALTA: '#f97316',
  CRITICA: '#ef4444',
};

const prioridadeLabels: Record<PrioridadeDemanda, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Critica',
};

export function KanbanCard({ demanda, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: demanda.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.card}
      onClick={onClick}
    >
      <div className={styles.header}>
        <span className={styles.tipo}>{demanda.tipo.replace('_', ' ')}</span>
        <span
          className={styles.prioridade}
          style={{ background: prioridadeColors[demanda.prioridade] }}
        >
          <Flag size={10} />
          {prioridadeLabels[demanda.prioridade]}
        </span>
      </div>

      <h4 className={styles.titulo}>{demanda.titulo}</h4>

      {demanda.descricao && (
        <p className={styles.descricao}>
          {demanda.descricao.substring(0, 80)}
          {demanda.descricao.length > 80 ? '...' : ''}
        </p>
      )}

      <div className={styles.footer}>
        {demanda.responsavel && (
          <div className={styles.responsavel}>
            <User size={14} />
            <span>{demanda.responsavel.nome.split(' ')[0]}</span>
          </div>
        )}

        {demanda.prazo && (
          <div className={styles.prazo}>
            <Calendar size={14} />
            <span>{new Date(demanda.prazo).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>

      {demanda.projeto && (
        <div className={styles.projeto}>
          {demanda.projeto.nome}
        </div>
      )}
    </div>
  );
}
