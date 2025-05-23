import React, { useState, useEffect, useRef } from 'react';
import { api } from "../context/AuthContext";
import './Map.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import SearchFilter from "../components/searchFilter/SearchFilter";
import WeatherForecast from "../components/weatherForecast/WeatherForecast";

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
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);
  const [markersLayer, setMarkersLayer] = useState(null);
  const [showWeather, setShowWeather] = useState(false);

  const lithuaniaCenter = [55.1694, 23.8813];
  
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(lithuaniaCenter, 8);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
      
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

  useEffect(() => {
    const fetchAllLakes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let estimatedTotal = 100;
        setLoadingProgress({ current: 0, total: estimatedTotal });
        
        let allLakes = [];
        let offset = 0;
        const limit = 50;
        let hasMore = true;
        
        while (hasMore) {
          const response = await api.get("/lake", {
            params: { offset, limit }
          });
          
          const batch = response.data;
          
          if (batch && batch.length > 0) {
            allLakes = [...allLakes, ...batch];
            
            offset += batch.length;
            setLoadingProgress({ 
              current: allLakes.length, 
              total: Math.max(estimatedTotal, allLakes.length + (batch.length === limit ? limit : 0))
            });
            
            hasMore = batch.length === limit;
          } else {
            hasMore = false;
          }
        }
        
        setLakes(allLakes);
        setFilteredLakes(allLakes);
        setLoadingProgress({ current: allLakes.length, total: allLakes.length });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lakes:", err);
        setError(err.message || "Failed to fetch lakes");
        setLoading(false);
      }
    };

    fetchAllLakes();
  }, []);

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

  useEffect(() => {
    if (markersLayer && filteredLakes.length > 0) {
      markersLayer.clearLayers();
      
      filteredLakes.forEach(lake => {
        try {
          const lat = parseFloat(lake.latitude);
          const lng = parseFloat(lake.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng]).addTo(markersLayer);
            
            marker.on('click', () => {
              setActiveLocation(lake);
              setShowWeather(false);
              
              if (mapInstanceRef.current) {
                mapInstanceRef.current.panTo([lat, lng]);
              }
            });
          }
        } catch (error) {
          console.error(`Error adding marker for lake ${lake.name}:`, error);
        }
      });
    }
  }, [filteredLakes, markersLayer]);

  const toggleWeather = () => {
    setShowWeather(!showWeather);
  };

  return (
    <div className="map-page full-width">
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
            <div className="loading">
              <div className="loading-progress">
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                  ></div>
                </div>
                <span>
                  Loading lakes: {loadingProgress.current} / {loadingProgress.total}
                  {loadingProgress.current < loadingProgress.total ? "..." : " complete!"}
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="lakes-count">
              Showing {filteredLakes.length} of {lakes.length} lakes
              {searchQuery && <span> matching "{searchQuery}"</span>}
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
                  {activeLocation.area && <div>Area: {activeLocation.area} sq ha</div>}
                  {activeLocation.coastlineLength && <div>Coastline: {activeLocation.coastlineLength} km</div>}
                </div>
                
                <div className="panel-actions">
                  <button 
                    className={`weather-toggle-btn ${showWeather ? 'active' : ''}`}
                    onClick={toggleWeather}
                  >
                    {showWeather ? 'Hide Weather' : 'Show Weather Forecast'}
                  </button>
                  
                  <a 
                    href={`/lake/${activeLocation.id}`} 
                    className="view-details-btn"
                  >
                    View Full Details
                  </a>
                </div>
                
                {showWeather && (
                  <WeatherForecast 
                    latitude={parseFloat(activeLocation.latitude)} 
                    longitude={parseFloat(activeLocation.longitude)} 
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;