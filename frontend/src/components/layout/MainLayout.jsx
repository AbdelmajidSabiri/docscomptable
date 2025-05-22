import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ComptableDashboard from './ComptableDashboard';
import ClientDetailModal from '../components/ClientDetailModal';
import './MainLayout.css';

const MainLayout = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  return (
    <div className="main-layout">
      <Sidebar />
      
      <div className="main-content">
        <ComptableDashboard onClientSelect={handleClientSelect} />
      </div>
      
      {modalOpen && selectedClient && (
        <ClientDetailModal 
          client={selectedClient} 
          open={modalOpen} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default MainLayout;