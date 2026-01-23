import { TaskList } from '../../../widgets/task-list/ui/task-list'
//import './task-list-page.scss';

export const TaskListPage = () => {
  return (
    <div className="task-list-page">
      <div className="task-list-page__container">
        <TaskList />
      </div>
    </div>
  );
};