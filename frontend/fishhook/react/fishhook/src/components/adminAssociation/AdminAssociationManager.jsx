import React, { useState, useEffect } from 'react';
import './AdminAssociationManager.scss';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../../context/AuthContext';

const AdminAssociationManager = ({ 
  title, 
  sourceType, 
  sourceId, 
  targetType, 
  currentAssociations, 
  onAssociationChange,
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const currentAssociationIds = currentAssociations.map(item => item.id);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = `/${targetType.toLowerCase()}`;
        const response = await api.get(endpoint);
        
        const filtered = response.data.filter(item => 
          (item.name.toLowerCase().includes(searchQuery.toLowerCase())) && 
          !currentAssociationIds.includes(item.id)
        );
        
        setSearchResults(filtered);
      } catch (err) {
        console.error(`Error fetching ${targetType}:`, err);
        setError(`Failed to search for ${targetType}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [searchQuery, targetType, currentAssociationIds]);

  const handleAddAssociation = async (itemId) => {
    try {
      const response = await api.post(`/${sourceType.toLowerCase()}/${sourceId}/${targetType.toLowerCase()}/${itemId}`);
      
      const addedItem = searchResults.find(item => item.id === itemId);
      
      if (addedItem && onAssociationChange) {
        onAssociationChange('add', addedItem);
      }
      
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error(`Error adding ${targetType} association:`, err);
      setError(`Failed to add ${targetType}. Please try again.`);
    }
  };

  const handleRemoveAssociation = async (itemId) => {
    try {
      const response = await api.delete(`/${sourceType.toLowerCase()}/${sourceId}/${targetType.toLowerCase()}/${itemId}`);
      
      if (onAssociationChange) {
        onAssociationChange('remove', { id: itemId });
      }
    } catch (err) {
      console.error(`Error removing ${targetType} association:`, err);
      setError(`Failed to remove ${targetType}. Please try again.`);
    }
  };

  return (
    <div className="admin-association-overlay">
      <div className="admin-association-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="search-section">
            <h3>Add {targetType}</h3>
            <div className="search-container">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                placeholder={`Search ${targetType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {loading && <div className="loading-indicator">Searching...</div>}
            
            {error && <div className="error-message">{error}</div>}
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(item => (
                  <div className="result-item" key={item.id}>
                    <div className="result-info">
                      <img 
                        src={item.photoURL} 
                        alt={item.name} 
                        className="item-image" 
                      />
                      <span className="item-name">{item.name}</span>
                    </div>
                    <button 
                      className="add-button"
                      onClick={() => handleAddAssociation(item.id)}
                      title={`Add ${item.name}`}
                    >
                      <AddIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery.trim().length >= 2 && searchResults.length === 0 && !loading && (
              <div className="no-results">
                No matching {targetType} found
              </div>
            )}
          </div>
          
          <div className="current-associations">
            <h3>Current {targetType} ({currentAssociations.length})</h3>
            {currentAssociations.length === 0 ? (
              <div className="no-associations">
                No {targetType} associations yet
              </div>
            ) : (
              <div className="associations-list">
                {currentAssociations.map(item => (
                  <div className="association-item" key={item.id}>
                    <div className="association-info">
                      <img 
                        src={item.photoURL} 
                        alt={item.name} 
                        className="item-image" 
                      />
                      <span className="item-name">{item.name}</span>
                    </div>
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveAssociation(item.id)}
                      title={`Remove ${item.name}`}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssociationManager;