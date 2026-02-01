import type { Task } from '../../model/types';
interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
    onDelete?: (id: number) => void;
    truncateDescription?: boolean;
}
export declare const TaskCard: ({ task, onEdit, onDelete, truncateDescription, }: TaskCardProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=task-card.d.ts.map