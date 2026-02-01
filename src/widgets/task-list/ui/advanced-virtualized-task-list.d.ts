import type { Task } from '../../../entities/task/model/types';
interface AdvancedVirtualizedTaskListProps {
    tasks: Task[];
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage: () => void;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
}
export declare const AdvancedVirtualizedTaskList: ({ tasks, hasNextPage, isFetchingNextPage, fetchNextPage, onEdit, onDelete, }: AdvancedVirtualizedTaskListProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=advanced-virtualized-task-list.d.ts.map