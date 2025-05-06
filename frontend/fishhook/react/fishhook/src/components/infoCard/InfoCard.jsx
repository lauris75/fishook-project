import React from 'react';
import "./InfoCard.scss";

const InfoCard = ({ image, title, summary, description, coords }) => {
  return (
    <div className="info-card">
      <div className="info-image">
        <img src={image} alt={title} />
      </div>
      
      <div className="info-content">
        <h1 className="info-title">{title}</h1>
        
        <div className="info-summary">
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
        
        {coords && (
          <div className="info-coords">
            <h3>Location</h3>
            <p>Latitude: {coords.latitude}</p>
            <p>Longitude: {coords.longitude}</p>
          </div>
        )}
        
        <div className="info-description">
          <h3>Description</h3>
          <div className="description-content">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;