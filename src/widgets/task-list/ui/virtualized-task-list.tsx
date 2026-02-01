import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Task } from '../../../entities/task/model/types';
import { TaskCard } from '../../../entities/task/ui/task-card/task-card';
import styles from './task-list.module.scss';
import { useInfiniteScroll } from '../../../shared/hooks/useInfiniteScroll';

interface VirtualizedTaskListProps {
  tasks: Task[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export const VirtualizedTaskList = ({
  tasks,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  onEdit,
  onDelete,
}: VirtualizedTaskListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Виртуализация строк
  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // --- Подключаем бесконечный скролл через ref ---
  const { lastElementRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: fetchNextPage!,
    threshold: 0.5,
    rootMargin: '100px', // раньше грузит — лучше UX
  });

  // Если нет задач и идёт загрузка
  if (tasks.length === 0 && isFetchingNextPage) {
    return (
      <div className={styles.empty}>
        Загрузка задач...
      </div>
    );
  }

  // Если нет задач
  if (tasks.length === 0) {
    return (
      <div className={styles.empty}>
        Задачи не найдены
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={styles.virtualContainer}
      style={{
        height: '600px',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
          }}
        >
          {virtualItems.map((virtualItem) => {
            const task = tasks[virtualItem.index];
            const isLastItem = virtualItem.index === tasks.length - 1;

            return (
              <div
                key={task?.id ?? `placeholder-${virtualItem.index}`}
                data-index={virtualItem.index}
                ref={(el) => {
                  // Привязываем к измерению виртуализатора
                  rowVirtualizer.measureElement(el);
                  // И если это последний элемент — цепляем реф для бесконечного скролла
                  if (isLastItem) lastElementRef(el);
                }}
                style={{
                  padding: '0 16px',
                  marginBottom: '12px',
                }}
              >
                {task ? (
                  <TaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    truncateDescription
                  />
                ) : (
                  <div
                    style={{
                      height: '140px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                    }}
                  >
                    Загрузка задачи...
                  </div>
                )}
              </div>
            );
          })}

          {/* Альтернатива: отдельный индикатор (лучше видимость для observer) */}
          {hasNextPage && (
            <div
              ref={lastElementRef}
              style={{
                padding: '0 16px',
                marginBottom: '12px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div className={styles.loadingIndicator}>
                {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
