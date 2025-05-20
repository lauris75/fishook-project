import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";
import InfoCard from "../components/infoCard/InfoCard";
import SearchFilter from "../components/searchFilter/SearchFilter";
import LakeEditButton from "../components/lakeEditButton/LakeEditButton";
import LakeFishManager from "../components/lakeFishManager/LakeFishManager";
import "./Lake.scss";

const Lake = () => {
  const { id } = useParams();
  const { isAdmin } = useAdmin();
  const [lakeData, setLakeData] = useState(null);
  const [relatedFish, setRelatedFish] = useState([]);
  const [lakes, setLakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20; // Number of lakes to load at once
  
  const observer = useRef();
  const searchTimeout = useRef(null);

  // Handle search query debounce
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset when search changes
      setLakes([]);
      setOffset(0);
      setHasMore(true);
    }, 500); // 500ms debounce
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  // Fetch data for single lake or lake list
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          // Single lake view - unchanged
          const response = await api.get(`/lake/${id}/withFish`);
          setLakeData(response.data);
          
          if (response.data.fishes && Array.isArray(response.data.fishes)) {
            const sortedFish = [...response.data.fishes].sort((a, b) => 
              a.name.localeCompare(b.name)
            );
            setRelatedFish(sortedFish);
          } else {
            try {
              const lakeFishResponse = await api.get(`/lakeFish/lake/${id}`);
              if (lakeFishResponse.data && lakeFishResponse.data.length > 0) {
                const fishPromises = lakeFishResponse.data.map(lakeFish => 
                  api.get(`/fish/${lakeFish.fishId}`)
                );
                const fishResponses = await Promise.all(fishPromises);
                const fishList = fishResponses.map(res => res.data);
                
                const sortedFish = [...fishList].sort((a, b) => 
                  a.name.localeCompare(b.name)
                );
                setRelatedFish(sortedFish);
              }
            } catch (lakeFishErr) {
              console.error("Error fetching lake-fish associations:", lakeFishErr);
            }
          }
          setLoading(false);
        } else if (hasMore && !loadingMore) {
          // Only fetch more if we aren't already loading and there are more to load
          setLoadingMore(true);
          
          // Use the original lake endpoint but modify the implementation to add "load more" functionality
          let endpoint = "/lake";
          let params = {};
          
          // Add search functionality
          if (debouncedSearchQuery) {
            endpoint = "/lake/search";
            params = { query: debouncedSearchQuery, offset, limit: LIMIT };
          } else {
            params = { offset, limit: LIMIT };
          }
          
          const response = await api.get(endpoint, { params });
          
          const newLakes = response.data.lakes || response.data;
          
          // If we got fewer lakes than the limit, there are no more to load
          if (newLakes.length < LIMIT) {
            setHasMore(false);
          }
          
          // Append new lakes to existing ones
          setLakes(prev => [...prev, ...newLakes]);
          setLoadingMore(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching lake data:", err);
        setError(err.message || "Failed to fetch lake information");
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchData();
  }, [id, offset, debouncedSearchQuery, hasMore, loadingMore]);

  // Intersection Observer setup for infinite scrolling
  const lastLakeElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prevOffset => prevOffset + LIMIT);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Handle lake update from admin
  const handleLakeUpdated = (updatedLake) => {
    setLakeData(prev => ({
      ...prev,
      name: updatedLake.name,
      summary: updatedLake.summary,
      description: updatedLake.description,
      latitude: updatedLake.latitude,
      longitude: updatedLake.longitude
    }));
  };
  
  // Handle fish associations changes
  const handleAssociationsChanged = (action, changedFish) => {
    if (action === 'add') {
      setRelatedFish(prev => {
        const updated = [...prev, changedFish];
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
    } else if (action === 'remove') {
      setRelatedFish(prev => 
        prev.filter(fish => fish.id !== changedFish.id)
      );
    }
    
    setLakeData(prev => {
      if (!prev.fishes) {
        prev.fishes = [];
      }
      
      if (action === 'add') {
        const updatedFishes = [...prev.fishes, changedFish];
        return {
          ...prev,
          fishes: updatedFishes
        };
      } else if (action === 'remove') {
        return {
          ...prev,
          fishes: prev.fishes.filter(fish => fish.id !== changedFish.id)
        };
      }
      
      return prev;
    });
  };

  if (loading && lakes.length === 0) {
    return (
      <div className="lake-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading lakes data...</p>
        </div>
      </div>
    );
  }

  if (error && lakes.length === 0) {
    return <div className="lake-page">Error: {error}</div>;
  }

  // Detail view (single lake)
  if (id && lakeData) {
    return (
      <div className="lake-page single-view">
        <InfoCard
          image={lakeData.photoURL}
          title={lakeData.summary.split(' ').slice(0, 3).join(' ')}
          name={lakeData.name}
          summary={lakeData.summary}
          description={lakeData.description}
          coords={{
            latitude: lakeData.latitude,
            longitude: lakeData.longitude
          }}
          area={lakeData.area}
          coastlineLength={lakeData.coastlineLength}
        />
        
        {/* Admin Buttons */}
        {isAdmin && (
          <div className="admin-actions">
            <LakeEditButton lake={lakeData} onLakeUpdated={handleLakeUpdated} />
            <LakeFishManager 
              lake={{...lakeData, fishes: relatedFish}} 
              onAssociationsChanged={handleAssociationsChanged} 
            />
          </div>
        )}
        
        {/* Related Fish Section */}
        <div className="related-section">
          <h2>Fish species found in this lake:</h2>
          
          {relatedFish.length === 0 ? (
            <p className="no-related-items">No fish species recorded for this lake yet.</p>
          ) : (
            <div className="related-items-grid">
              {relatedFish.map((fish) => (
                <div className="fish-card" key={fish.id} onClick={() => window.location.href = `/fish/${fish.id}`}>
                  <div className="fish-image">
                    <img src={fish.photoURL} alt={fish.name} />
                  </div>
                  <div className="fish-info">
                    <h3>{fish.name}</h3>
                    <p>{fish.summary.substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view (all lakes with infinite scrolling)
  return (
    <div className="lake-page list-view">
      <h1>Fishing Lakes</h1>
      <p className="page-description">Discover great lakes for fishing, their locations, and what fish you might catch there.</p>
      
      <SearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search lakes by name, location or description..."
      />
      
      {lakes.length === 0 && !loadingMore ? (
        <div className="no-results">
          <p>No lakes found matching "{debouncedSearchQuery}"</p>
          <button onClick={() => setSearchQuery("")}>Clear search</button>
        </div>
      ) : (
        <div className="lake-grid">
          {lakes.map((lake, index) => {
            // Add ref to last item for infinite scrolling
            if (lakes.length === index + 1) {
              return (
                <div 
                  ref={lastLakeElementRef}
                  className="lake-card" 
                  key={lake.id} 
                  onClick={() => window.location.href = `/lake/${lake.id}`}
                >
                  <div className="lake-image">
                    <img src={lake.photoURL} alt={lake.name} />
                  </div>
                  <div className="lake-info">
                    <h3>{lake.name}</h3>
                    <p>{lake.summary.substring(0, 100)}...</p>
                    <div className="lake-coords">
                      <span>Lat: {lake.latitude}</span> • <span>Long: {lake.longitude}</span>
                      {lake.area && <span> • Area: {lake.area} sq ha</span>}
                      {lake.coastlineLength && <span> • Coastline: {lake.coastlineLength} km</span>}
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div 
                  className="lake-card" 
                  key={lake.id} 
                  onClick={() => window.location.href = `/lake/${lake.id}`}
                >
                  <div className="lake-image">
                    <img src={lake.photoURL} alt={lake.name} />
                  </div>
                  <div className="lake-info">
                    <h3>{lake.name}</h3>
                    <p>{lake.summary.substring(0, 100)}...</p>
                    <div className="lake-coords">
                      <span>Lat: {lake.latitude}</span> • <span>Long: {lake.longitude}</span>
                      {lake.area && <span> • Area: {lake.area} sq ha</span>}
                      {lake.coastlineLength && <span> • Coastline: {lake.coastlineLength} km</span>}
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
      
      {loadingMore && (
        <div className="loading-more">
          <div className="loading-spinner"></div>
          <p>Loading more lakes...</p>
        </div>
      )}
    </div>
  );
};

export default Lake;