import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const ActivityPage = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="activity-container">
      <h1>Activity</h1>
      <p>Your recent activity will be displayed here.</p>
    </div>
  );
};

export default ActivityPage;
