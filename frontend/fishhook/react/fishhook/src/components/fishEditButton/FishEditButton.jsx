import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import AdminEditForm from '../adminEditForm/AdminEditForm';
import { api } from '../../context/AuthContext';
import '../adminEditButton/AdminEditButton.scss';

const FishEditButton = ({ fish, onFishUpdated }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenEditForm = () => {
    setShowEditForm(true);
    setError(null);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.put(`/fish/${fish.id}`, formData);
      
      if (onFishUpdated) {
        onFishUpdated(response.data);
      }
      
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating fish:', err);
      setError(err.response?.data || 'Failed to update fish information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fishFields = [
    {
      name: 'name',
      label: 'Fish Name',
      placeholder: 'Enter fish name',
      required: true
    },
    {
      name: 'summary',
      label: 'Summary',
      placeholder: 'Enter a brief summary',
      type: 'textarea',
      required: true
    },
    {
      name: 'description',
      label: 'Description',
      placeholder: 'Enter a detailed description',
      type: 'textarea',
      required: true
    }
  ];

  return (
    <>
      <button className="admin-edit-button" onClick={handleOpenEditForm}>
        <EditIcon />
        <span>Edit Fish</span>
      </button>

      {showEditForm && (
        <AdminEditForm
          title={`Edit Fish: ${fish.name}`}
          item={fish}
          fields={fishFields}
          onClose={handleCloseEditForm}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </>
  );
};

export default FishEditButton;