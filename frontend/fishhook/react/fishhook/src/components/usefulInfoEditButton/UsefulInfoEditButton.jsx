import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import AdminEditForm from '../adminEditForm/AdminEditForm';
import { api } from '../../context/AuthContext';
import '../adminEditButton/AdminEditButton.scss';

const UsefulInfoEditButton = ({ info, onInfoUpdated }) => {
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
      const response = await api.put(`/UsefulInformation/${info.id}`, formData);
      
      if (onInfoUpdated) {
        onInfoUpdated(response.data);
      }
      
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating useful information:', err);
      setError(err.response?.data || 'Failed to update information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoFields = [
    {
      name: 'name',
      label: 'Title',
      placeholder: 'Enter information title',
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
        <span>Edit Information</span>
      </button>

      {showEditForm && (
        <AdminEditForm
          title={`Edit Information: ${info.name}`}
          item={info}
          fields={infoFields}
          onClose={handleCloseEditForm}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </>
  );
};

export default UsefulInfoEditButton;