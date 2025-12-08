import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Demanda, StatusDemanda } from '../../../types';
import { KanbanCard } from '../KanbanCard';
import styles from './styles.module.css';

interface KanbanColumnProps {
  status: StatusDemanda;
  title: string;
  demandas: Demanda[];
  onCardClick?: (demanda: Demanda) => void;
}

const statusColors: Record<StatusDemanda, string> = {
  A_FAZER: '#6b7280',
  EM_ANDAMENTO: '#3b82f6',
  EM_VALIDACAO: '#f59e0b',
  CONCLUIDA: '#22c55e',
};

export function KanbanColumn({ status, title, demandas, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <span className={styles.indicator} style={{ background: statusColors[status] }} />
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.count}>{demandas.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`${styles.cards} ${isOver ? styles.cardsOver : ''}`}
      >
        <SortableContext items={demandas.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {demandas.map((demanda) => (
            <KanbanCard
              key={demanda.id}
              demanda={demanda}
              onClick={() => onCardClick?.(demanda)}
            />
          ))}
        </SortableContext>

        {demandas.length === 0 && (
          <div className={styles.empty}>Nenhuma demanda</div>
        )}
      </div>
    </div>
  );
}
