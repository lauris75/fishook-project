import React, { useState } from 'react';
import './AdminEditForm.scss';
import CloseIcon from '@mui/icons-material/Close';

const AdminEditForm = ({ 
  title, 
  item, 
  fields, 
  onClose, 
  onSubmit, 
  isSubmitting,
  error
}) => {
  const [formData, setFormData] = useState(() => {
    // Initialize form data from item and fields configuration
    const initialData = {};
    fields.forEach(field => {
      initialData[field.name] = item[field.name] || '';
    });
    return initialData;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="admin-edit-overlay">
      <div className="admin-edit-form">
        <div className="form-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div className="form-group" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  rows={4}
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditForm;