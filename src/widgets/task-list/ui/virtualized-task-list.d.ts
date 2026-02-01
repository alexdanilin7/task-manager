import type { Task } from '../../../entities/task/model/types';
interface VirtualizedTaskListProps {
    tasks: Task[];
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage?: () => void;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
}
export declare const VirtualizedTaskList: ({ tasks, hasNextPage, isFetchingNextPage, fetchNextPage, onEdit, onDelete, }: VirtualizedTaskListProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=virtualized-task-list.d.ts.map