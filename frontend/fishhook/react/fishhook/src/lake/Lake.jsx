import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";
import InfoCard from "../components/infoCard/InfoCard";
import SearchIcon from '@mui/icons-material/Search';
import SearchFilter from "../components/searchFilter/SearchFilter";
import LakeEditButton from "../components/lakeEditButton/LakeEditButton";
import LakeFishManager from "../components/lakeFishManager/LakeFishManager";
import { formatDecimal } from "../utils/formatters";
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
  
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 15;
  
  const lastLakeRef = useRef(null);
  
  const isLoading = useRef(false);
  
  console.log("Lake component rendering, id:", id, "lakes count:", lakes.length);

  const fetchSingleLake = async (lakeId) => {
    console.log("Fetching single lake with ID:", lakeId);
    setLoading(true);
    
    try {
      const response = await api.get(`/lake/${lakeId}/withFish`);
      console.log("Single lake response:", response.data);
      
      setLakeData(response.data);
      
      if (response.data.fishes && Array.isArray(response.data.fishes)) {
        const sortedFish = [...response.data.fishes].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setRelatedFish(sortedFish);
      } else {
        try {
          const lakeFishResponse = await api.get(`/lakeFish/lake/${lakeId}`);
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
        } catch (error) {
          console.error("Error fetching lake-fish associations:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching single lake:", error);
      setError("Failed to load lake details");
    } finally {
      setLoading(false);
    }
  };
    
  const fetchLakes = async (isInitialFetch = false) => {
    if (isLoading.current) {
      console.log("Already loading, skipping fetch");
      return;
    }
    
    if (!isInitialFetch && !hasMore) {
      console.log("No more lakes to load");
      return;
    }
    
    try {
      isLoading.current = true;
      
      if (isInitialFetch) {
        setLoading(true);
        setLakes([]);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }
      
      const currentOffset = isInitialFetch ? 0 : offset;
      
      console.log(`Fetching lakes with params: offset=${currentOffset}, limit=${LIMIT}${searchQuery ? `, query=${searchQuery}` : ''}`);
      
      let endpoint = "/lake";
      let params = { offset: currentOffset, limit: LIMIT };
      
      if (searchQuery) {
        endpoint = "/lake/search";
        params.query = searchQuery;
      }
      
      const response = await api.get(endpoint, { params });
      console.log(`API response for ${isInitialFetch ? 'initial' : 'more'} lakes:`, response);
      
      let newLakes = [];
      if (Array.isArray(response.data)) {
        newLakes = response.data;
      } else if (response.data && Array.isArray(response.data.lakes)) {
        newLakes = response.data.lakes;
      } else {
        console.error("Unexpected API response format:", response.data);
      }
      
      console.log(`Received ${newLakes.length} lakes`);
      
      setHasMore(newLakes.length === LIMIT);
      
      if (isInitialFetch) {
        setLakes(newLakes);
      } else {
        setLakes(prevLakes => [...prevLakes, ...newLakes]);
      }
      
      if (!isInitialFetch) {
        setOffset(currentOffset + LIMIT);
      }
    } catch (error) {
      console.error("Error fetching lakes:", error);
      setError("Failed to load lakes");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoading.current = false;
    }
  };
    
  useEffect(() => {
    console.log("Initial setup effect running");
    
    if (id) {
      fetchSingleLake(id);
    } else {
      fetchLakes(true);
    }
    
    const setupObserver = () => {
      if (id) return;
      
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };
      
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading.current && hasMore) {
          console.log("Last element visible, loading more lakes");
          fetchLakes(false);
        }
      }, options);
      
      if (lastLakeRef.current) {
        observer.observe(lastLakeRef.current);
      }
      
      return () => {
        if (lastLakeRef.current) {
          observer.unobserve(lastLakeRef.current);
        }
        observer.disconnect();
      };
    };
    
    const cleanup = setupObserver();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [id]);
  
  useEffect(() => {
    console.log("Search query changed to:", searchQuery);
    
    const timer = setTimeout(() => {
      if (!id) {
        if (searchQuery.length === 0 || searchQuery.length >= 3) {
          fetchLakes(true);
        }
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  useEffect(() => {
    console.log("Lakes list updated, lakes count:", lakes.length);
    
    if (id) return;
    
    if (lakes.length === 0 || loading) return;
    
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading.current && hasMore) {
        console.log("Last element visible, loading more lakes");
        fetchLakes(false);
      }
    }, options);
    
    if (lastLakeRef.current) {
      console.log("Starting to observe last lake element");
      observer.observe(lastLakeRef.current);
    }
    
    return () => {
      if (lastLakeRef.current) {
        observer.unobserve(lastLakeRef.current);
      }
      observer.disconnect();
    };
  }, [lakes, id, loading, hasMore]);
  
  const handleLakeUpdated = (updatedLake) => {
    setLakeData(prev => ({
      ...prev,
      name: updatedLake.name,
      summary: updatedLake.summary,
      description: updatedLake.description,
      latitude: updatedLake.latitude,
      longitude: updatedLake.longitude,
      area: updatedLake.area,
      coastlineLength: updatedLake.coastlineLength
    }));
  };
  
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
    
  if (loading) {
    return (
      <div className="lake-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading lakes data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lake-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

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
        
        {isAdmin && (
          <div className="admin-actions">
            <LakeEditButton lake={lakeData} onLakeUpdated={handleLakeUpdated} />
            <LakeFishManager 
              lake={{...lakeData, fishes: relatedFish}} 
              onAssociationsChanged={handleAssociationsChanged} 
            />
          </div>
        )}
        
        <div className="related-section">
          <h2>Fish species found in this lake:</h2>
          
          {relatedFish.length === 0 ? (
            <p className="no-related-items">No fish species recorded for this lake yet.</p>
          ) : (
            <div className="related-items-grid">
              {relatedFish.map((fish) => (
                <div 
                  className="fish-card" 
                  key={fish.id} 
                  onClick={() => window.location.href = `/fish/${fish.id}`}
                >
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

  return (
    <div className="lake-page list-view">
      <h1>Fishing Lakes</h1>
      <p className="page-description">Discover great lakes for fishing, their locations, and what fish you might catch there.</p>
      
      <SearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search lakes by name, location or description..."
      />
      
      {lakes.length === 0 ? (
        <div className="no-results">
          <p>No lakes found {searchQuery ? `matching "${searchQuery}"` : ''}</p>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>Clear search</button>
          )}
        </div>
      ) : (
        <div className="lake-grid">
          {lakes.map((lake, index) => (
            <div 
              ref={index === lakes.length - 1 ? lastLakeRef : null}
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
                  {lake.area && <span> • Area: {formatDecimal(lake.area)} sq ha</span>}
                  {lake.coastlineLength && <span> • Coastline: {formatDecimal(lake.coastlineLength)} km</span>}
                </div>
              </div>
            </div>
          ))}
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