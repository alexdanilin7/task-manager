import type { Task } from '../../../entities/task/model/types';
interface TaskEditFormProps {
    task: Task;
    onSuccess?: () => void;
    onCancel?: () => void;
}
export declare const TaskEditForm: ({ task, onSuccess, onCancel }: TaskEditFormProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=task-edit-form.d.ts.map