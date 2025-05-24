import React, { useState, useEffect, useRef } from 'react';
import { api } from "../context/AuthContext";
import './Map.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchFilter from "../components/searchFilter/SearchFilter";
import WeatherForecast from "../components/weatherForecast/WeatherForecast";
import { formatDecimal } from "../utils/formatters";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
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
      mapInstanceRef.current = L.map(mapRef.current, {
        center: lithuaniaCenter,
        zoom: 8,
        zoomControl: true,
        attributionControl: true
      });
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 6
      }).addTo(mapInstanceRef.current);
      
      const markersLayerGroup = L.layerGroup().addTo(mapInstanceRef.current);
      setMarkersLayer(markersLayerGroup);
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMarkersLayer(null);
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
    if (markersLayer && filteredLakes.length > 0 && mapInstanceRef.current) {
      markersLayer.clearLayers();
      
      let successfulMarkers = 0;
      let failedMarkers = 0;
      
      filteredLakes.forEach((lake, index) => {
        try {
          const lat = parseFloat(lake.latitude);
          const lng = parseFloat(lake.longitude);
          
          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Invalid coordinates for lake ${lake.name}: lat=${lake.latitude}, lng=${lake.longitude}`);
            failedMarkers++;
            return;
          }
          
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.warn(`Coordinates out of bounds for lake ${lake.name}: lat=${lat}, lng=${lng}`);
            failedMarkers++;
            return;
          }
          
          const marker = L.marker([lat, lng], {
            title: lake.name
          });
          

          
          marker.on('click', (e) => {
            setActiveLocation(lake);
            setShowWeather(false);
            
            if (mapInstanceRef.current) {
              mapInstanceRef.current.panTo([lat, lng]);
            }
          });
          
          marker.addTo(markersLayer);
          successfulMarkers++;
          
        } catch (error) {
          console.error(`Error adding marker for lake ${lake.name}:`, error);
          failedMarkers++;
        }
      });
      
      if (successfulMarkers > 0 && filteredLakes.length <= 50) {
        try {
          const group = new L.featureGroup(markersLayer.getLayers());
          if (group.getBounds().isValid()) {
            mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
          }
        } catch (error) {
          console.warn('Could not fit bounds to markers:', error);
        }
      }
    } else if (markersLayer) {
      markersLayer.clearLayers();
    }
  }, [filteredLakes, markersLayer]);

  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        setTimeout(() => {
          mapInstanceRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleWeather = () => {
    setShowWeather(!showWeather);
  };

  const closeLocationPanel = () => {
    setActiveLocation(null);
    setShowWeather(false);
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
                <button className="close-panel" onClick={closeLocationPanel}>×</button>
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
                  {activeLocation.area && <div>Area: {formatDecimal(activeLocation.area)} sq ha</div>}
                  {activeLocation.coastlineLength && <div>Coastline: {formatDecimal(activeLocation.coastlineLength)} km</div>}
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