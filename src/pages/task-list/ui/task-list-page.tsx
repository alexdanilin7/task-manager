import { TaskList } from '../../../widgets/task-list/ui/task-list';
import styles from './task-list-page.module.scss';

export const TaskListPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <TaskList />
      </div>
    </div>
  );
};