import React, { useState } from 'react';
import WaterIcon from '@mui/icons-material/Water';
import AdminAssociationManager from '../adminAssociation/AdminAssociationManager';
import '../adminEditButton/AdminEditButton.scss';

const FishLakeManager = ({ fish, onAssociationsChanged }) => {
  const [showAssociationManager, setShowAssociationManager] = useState(false);

  const handleOpenManager = () => {
    setShowAssociationManager(true);
  };

  const handleCloseManager = () => {
    setShowAssociationManager(false);
  };

  const handleAssociationChange = (action, changedItem) => {
    if (onAssociationsChanged) {
      onAssociationsChanged(action, changedItem);
    }
  };

  return (
    <>
      <button className="admin-edit-button" onClick={handleOpenManager}>
        <WaterIcon />
        <span>Manage Lakes</span>
      </button>

      {showAssociationManager && (
        <AdminAssociationManager
          title={`Manage Lakes for ${fish.name}`}
          sourceType="Fish"
          sourceId={fish.id}
          targetType="Lake"
          currentAssociations={fish.lakes || []}
          onAssociationChange={handleAssociationChange}
          onClose={handleCloseManager}
        />
      )}
    </>
  );
};

export default FishLakeManager;