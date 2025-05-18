import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const SettingsPage = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <p>Your settings will be displayed here.</p>
    </div>
  );
};

export default SettingsPage;
