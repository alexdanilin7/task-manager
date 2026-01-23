import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Task } from '../../../entities/task/model/types';
import { TaskCard } from '../../../entities/task/ui/task-card/task-card';
import './task-list.scss';

interface VirtualizedTaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export const VirtualizedTaskList = ({
  tasks,
  onEdit,
  onDelete,
}: VirtualizedTaskListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  const virtualTasks = virtualizer.getVirtualItems();

  // Если нет задач, показываем сообщение
  if (tasks.length === 0) {
    return (
      <div className="task-list-widget__empty">
        Нет задач для отображения
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="task-list-widget__virtual-container"
      style={{
        height: '600px',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualTasks[0]?.start ?? 0}px)`,
          }}
        >
          {virtualTasks.map((virtualTask) => {
            const task = tasks[virtualTask.index];
            
            // Проверяем, что задача существует
            if (!task || !task.id) {
              return (
                <div
                  key={`empty-${virtualTask.index}`}
                  data-index={virtualTask.index}
                  ref={virtualizer.measureElement}
                  style={{
                    padding: '0 16px',
                    marginBottom: '12px',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                  }}
                >
                  Загрузка...
                </div>
              );
            }

            return (
              <div
                key={task.id}
                data-index={virtualTask.index}
                ref={virtualizer.measureElement}
                style={{
                  padding: '0 16px',
                  marginBottom: '12px',
                }}
              >
                <TaskCard
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  truncateDescription
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};