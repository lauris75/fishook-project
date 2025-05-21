import React, { useState } from 'react';
import PetsIcon from '@mui/icons-material/Pets';
import AdminAssociationManager from '../adminAssociation/AdminAssociationManager';
import '../adminEditButton/AdminEditButton.scss';

const LakeFishManager = ({ lake, onAssociationsChanged }) => {
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
        <PetsIcon />
        <span>Manage Fish</span>
      </button>

      {showAssociationManager && (
        <AdminAssociationManager
          title={`Manage Fish in ${lake.name}`}
          sourceType="Lake"
          sourceId={lake.id}
          targetType="Fish"
          currentAssociations={lake.fishes || []}
          onAssociationChange={handleAssociationChange}
          onClose={handleCloseManager}
        />
      )}
    </>
  );
};

export default LakeFishManager;