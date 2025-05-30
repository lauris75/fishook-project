import React from 'react';
import "./InfoCard.scss";
import { formatDecimal } from '../../utils/formatters';

const InfoCard = ({ image, title, name, summary, description, coords, area, coastlineLength }) => {
  return (
    <div className="info-card">
      <div className="info-image">
        <img src={image} alt={title} />
      </div>
      
      <div className="info-header">
        <h1 className="info-title">{name || title}</h1>
        <div className="info-summary">
          <p>{summary}</p>
        </div>
        
        {coords && (
          <div className="info-coords">
            <span>Latitude: {coords.latitude}</span>
            <span>Longitude: {coords.longitude}</span>
            {area && <span>Area: {formatDecimal(area)} sq ha</span>}
            {coastlineLength && <span>Coastline: {formatDecimal(coastlineLength)} km</span>}
          </div>
        )}
      </div>
      
      <div className="info-description">
        <h3>Description</h3>
        <div className="description-content">
          {description}
        </div>
        <div className="data-attribution">
          Lake data source: UETK
        </div>
      </div>
    </div>
  );
};

export default InfoCard;