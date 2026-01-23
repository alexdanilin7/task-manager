import { createBrowserRouter } from "react-router-dom";
import { TaskListPage } from "../../pages/task-list";
import { TaskDetailsPage } from "../../pages/task-details";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <TaskListPage />,
  },
  {
    path: "/tasks/:id",
    element: <TaskDetailsPage />,
  }

]);