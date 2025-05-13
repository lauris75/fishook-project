import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import AdminEditForm from '../adminEditForm/AdminEditForm';
import { api } from '../../context/AuthContext';
import '../adminEditButton/AdminEditButton.scss';

const LakeEditButton = ({ lake, onLakeUpdated }) => {
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
      const response = await api.put(`/lake/${lake.id}`, formData);
      
      if (onLakeUpdated) {
        onLakeUpdated(response.data);
      }
      
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating lake:', err);
      setError(err.response?.data || 'Failed to update lake information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const lakeFields = [
    {
      name: 'name',
      label: 'Lake Name',
      placeholder: 'Enter lake name',
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
    },
    {
      name: 'latitude',
      label: 'Latitude',
      placeholder: 'Enter latitude coordinates',
      required: true
    },
    {
      name: 'longitude',
      label: 'Longitude',
      placeholder: 'Enter longitude coordinates',
      required: true
    }
  ];

  return (
    <>
      <button className="admin-edit-button" onClick={handleOpenEditForm}>
        <EditIcon />
        <span>Edit Lake</span>
      </button>

      {showEditForm && (
        <AdminEditForm
          title={`Edit Lake: ${lake.name}`}
          item={lake}
          fields={lakeFields}
          onClose={handleCloseEditForm}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </>
  );
};

export default LakeEditButton;