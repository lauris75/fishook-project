import React, { useState, useEffect, useRef } from 'react';
import { api } from "../context/AuthContext";
import './Map.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import SearchFilter from "../components/searchFilter/SearchFilter";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [lakes, setLakes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLakes, setFilteredLakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [markersLayer, setMarkersLayer] = useState(null);

  // Lithuania's center coordinates
  const lithuaniaCenter = [55.1694, 23.8813];
  
  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Create map instance centered on Lithuania
      mapInstanceRef.current = L.map(mapRef.current).setView(lithuaniaCenter, 8);
      
      // Add OpenStreetMap tile layer (free to use)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
      
      // Create a layer group for markers
      const markersLayerGroup = L.layerGroup().addTo(mapInstanceRef.current);
      setMarkersLayer(markersLayerGroup);
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch lakes data
  useEffect(() => {
    const fetchLakes = async () => {
      try {
        const response = await api.get("/lake");
        setLakes(response.data);
        setFilteredLakes(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lakes:", err);
        setError(err.message || "Failed to fetch lakes");
        setLoading(false);
      }
    };

    fetchLakes();
  }, []);

  // Filter lakes based on search
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const filtered = lakes.filter(
        lake =>
          lake.name.toLowerCase().includes(query) ||
          lake.summary.toLowerCase().includes(query) ||
          lake.latitude.toLowerCase().includes(query) ||
          lake.longitude.toLowerCase().includes(query)
      );
      setFilteredLakes(filtered);
    } else {
      setFilteredLakes(lakes);
    }
  }, [searchQuery, lakes]);

  // Update markers when filtered lakes change
  useEffect(() => {
    if (markersLayer && filteredLakes.length > 0) {
      // Clear existing markers
      markersLayer.clearLayers();
      
      // Add markers for each lake
      filteredLakes.forEach(lake => {
        try {
          // Convert string coordinates to numbers
          const lat = parseFloat(lake.latitude);
          const lng = parseFloat(lake.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng])
              .addTo(markersLayer)
              .bindPopup(`
                <div class="lake-popup">
                  <h3>${lake.name}</h3>
                  <p>${lake.summary.substring(0, 100)}...</p>
                  <a href="/lake/${lake.id}" class="view-lake-btn">View Details</a>
                </div>
              `);
              
            // Add click handler
            marker.on('click', () => {
              setActiveLocation(lake);
            });
          }
        } catch (error) {
          console.error(`Error adding marker for lake ${lake.name}:`, error);
        }
      });
    }
  }, [filteredLakes, markersLayer]);

  return (
    <div className="map-page">
      <div className="map-container">
        <div className="map-header">
          <h1>Fishing Map</h1>
          <p className="map-description">Explore fishing lakes around Lithuania</p>

          <div className="search-container">
            <SearchFilter 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search lakes by name or location..."
            />
          </div>

          {loading ? (
            <div className="loading">Loading map data...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="lakes-count">
              Showing {filteredLakes.length} of {lakes.length} lakes
            </div>
          )}
        </div>

        <div className="map-content">
          <div className="map-wrapper" ref={mapRef}></div>
          
          {activeLocation && (
            <div className="lake-details-panel">
              <div className="panel-header">
                <h2>{activeLocation.name}</h2>
                <button className="close-panel" onClick={() => setActiveLocation(null)}>×</button>
              </div>
              
              <div className="panel-content">
                <img 
                  src={activeLocation.photoURL} 
                  alt={activeLocation.name} 
                  className="lake-image" 
                />
                
                <p className="lake-summary">{activeLocation.summary}</p>
                
                <div className="lake-coords">
                  <div>Latitude: {activeLocation.latitude}</div>
                  <div>Longitude: {activeLocation.longitude}</div>
                </div>
                
                <a 
                  href={`/lake/${activeLocation.id}`} 
                  className="view-details-btn"
                >
                  View Full Details
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;