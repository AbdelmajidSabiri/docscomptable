import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const TasksPage = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="tasks-container">
      <h1>Tasks</h1>
      <p>Your tasks will be displayed here.</p>
    </div>
  );
};

export default TasksPage;
