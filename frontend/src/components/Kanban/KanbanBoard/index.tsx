import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { Demanda, StatusDemanda } from '../../../types';
import { KanbanColumn } from '../KanbanColumn';
import { KanbanCard } from '../KanbanCard';
import styles from './styles.module.css';

interface KanbanBoardProps {
  demandas: Demanda[];
  onStatusChange: (id: string, status: StatusDemanda) => Promise<void>;
  onCardClick?: (demanda: Demanda) => void;
}

const columns: { status: StatusDemanda; title: string }[] = [
  { status: StatusDemanda.A_FAZER, title: 'A Fazer' },
  { status: StatusDemanda.EM_ANDAMENTO, title: 'Em Andamento' },
  { status: StatusDemanda.EM_VALIDACAO, title: 'Em Validacao' },
  { status: StatusDemanda.CONCLUIDA, title: 'Concluida' },
];

export function KanbanBoard({ demandas, onStatusChange, onCardClick }: KanbanBoardProps) {
  const [activeDemanda, setActiveDemanda] = useState<Demanda | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function getDemandaById(id: string) {
    return demandas.find((d) => d.id === id);
  }

  function handleDragStart(event: DragStartEvent) {
    const demanda = getDemandaById(event.active.id as string);
    if (demanda) {
      setActiveDemanda(demanda);
    }
  }

  function handleDragOver(_event: DragOverEvent) {
    // Opcional: feedback visual ao arrastar
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDemanda(null);

    const { active, over } = event;

    if (!over) return;

    const demandaId = active.id as string;
    const overId = over.id as string;

    // Verificar se soltou em uma coluna
    const targetStatus = columns.find((col) => col.status === overId)?.status;

    if (targetStatus) {
      const demanda = getDemandaById(demandaId);
      if (demanda && demanda.status !== targetStatus) {
        await onStatusChange(demandaId, targetStatus);
      }
    }
  }

  function getDemandasByStatus(status: StatusDemanda) {
    return demandas.filter((d) => d.status === status);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            demandas={getDemandasByStatus(column.status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDemanda && <KanbanCard demanda={activeDemanda} />}
      </DragOverlay>
    </DndContext>
  );
}
