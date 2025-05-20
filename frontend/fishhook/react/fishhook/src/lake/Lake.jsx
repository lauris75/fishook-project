import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../context/AuthContext";
import { useAdmin } from "../hooks/useAdmin";
import InfoCard from "../components/infoCard/InfoCard";
import SearchIcon from '@mui/icons-material/Search';
import SearchFilter from "../components/searchFilter/SearchFilter"; // Added missing import
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
  
  // For infinite scrolling
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 15;
  
  // Ref for last lake element (for infinite scrolling)
  const lastLakeRef = useRef(null);
  
  // Flag to ensure we're not making multiple API calls when not needed
  const isLoading = useRef(false);
  
  // Log component renders for debugging
  console.log("Lake component rendering, id:", id, "lakes count:", lakes.length);
  
  // PART 1: SINGLE LAKE VIEW HANDLING
  // Function to fetch a single lake
  const fetchSingleLake = async (lakeId) => {
    console.log("Fetching single lake with ID:", lakeId);
    setLoading(true);
    
    try {
      const response = await api.get(`/lake/${lakeId}/withFish`);
      console.log("Single lake response:", response.data);
      
      setLakeData(response.data);
      
      // Handle fish data
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
  
  // PART 2: LAKE LIST HANDLING
  
  // Function to fetch lakes (initial or more)
  const fetchLakes = async (isInitialFetch = false) => {
    // Prevent concurrent fetches
    if (isLoading.current) {
      console.log("Already loading, skipping fetch");
      return;
    }
    
    // Don't fetch more if we're at the end
    if (!isInitialFetch && !hasMore) {
      console.log("No more lakes to load");
      return;
    }
    
    try {
      isLoading.current = true;
      
      // Set appropriate loading state
      if (isInitialFetch) {
        setLoading(true);
        setLakes([]); // Clear existing lakes for initial fetch
        setOffset(0);
      } else {
        setLoadingMore(true);
      }
      
      // Use the current offset for pagination
      const currentOffset = isInitialFetch ? 0 : offset;
      
      console.log(`Fetching lakes with params: offset=${currentOffset}, limit=${LIMIT}${searchQuery ? `, query=${searchQuery}` : ''}`);
      
      // Determine endpoint and params based on search query
      let endpoint = "/lake";
      let params = { offset: currentOffset, limit: LIMIT };
      
      if (searchQuery) {
        endpoint = "/lake/search";
        params.query = searchQuery;
      }
      
      // Make the API call with axios
      const response = await api.get(endpoint, { params });
      console.log(`API response for ${isInitialFetch ? 'initial' : 'more'} lakes:`, response);
      
      // Process the response data
      let newLakes = [];
      if (Array.isArray(response.data)) {
        newLakes = response.data;
      } else if (response.data && Array.isArray(response.data.lakes)) {
        newLakes = response.data.lakes;
      } else {
        console.error("Unexpected API response format:", response.data);
      }
      
      console.log(`Received ${newLakes.length} lakes`);
      
      // Update hasMore flag
      setHasMore(newLakes.length === LIMIT);
      
      // Update lakes list
      if (isInitialFetch) {
        setLakes(newLakes);
      } else {
        setLakes(prevLakes => [...prevLakes, ...newLakes]);
      }
      
      // Update offset for next page (if this wasn't initial fetch)
      if (!isInitialFetch) {
        setOffset(currentOffset + LIMIT);
      }
    } catch (error) {
      console.error("Error fetching lakes:", error);
      setError("Failed to load lakes");
    } finally {
      // Reset loading states
      setLoading(false);
      setLoadingMore(false);
      isLoading.current = false;
    }
  };
  
  // PART 3: COMPONENT LIFECYCLE
  
  // Initial setup - runs once when component mounts
  useEffect(() => {
    console.log("Initial setup effect running");
    
    if (id) {
      // Single lake view
      fetchSingleLake(id);
    } else {
      // Lakes list view - initial fetch
      fetchLakes(true);
    }
    
    // Set up intersection observer for infinite scrolling
    const setupObserver = () => {
      if (id) return; // No need for observer in single lake view
      
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // 10% of the element is visible
      };
      
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading.current && hasMore) {
          console.log("Last element visible, loading more lakes");
          fetchLakes(false);
        }
      }, options);
      
      // Start observing the last element if it exists
      if (lastLakeRef.current) {
        observer.observe(lastLakeRef.current);
      }
      
      // Cleanup function
      return () => {
        if (lastLakeRef.current) {
          observer.unobserve(lastLakeRef.current);
        }
        observer.disconnect();
      };
    };
    
    // Call setupObserver immediately and whenever lakes list changes
    const cleanup = setupObserver();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [id]); // Only depend on id to avoid re-running on other state changes
  
  // Handle search query changes
  useEffect(() => {
    console.log("Search query changed to:", searchQuery);
    
    // Use a timer to debounce search
    const timer = setTimeout(() => {
      if (!id) { // Only if we're in list view
        // Only fetch if we have at least 3 characters or empty query
        if (searchQuery.length === 0 || searchQuery.length >= 3) {
          fetchLakes(true); // Reset and fetch with new search
        }
      }
    }, 800); // Increased debounce time to 800ms
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Update observer when lakes list changes
  useEffect(() => {
    console.log("Lakes list updated, lakes count:", lakes.length);
    
    // If we're in single lake view, do nothing
    if (id) return;
    
    // If there are no lakes or we're still loading, do nothing
    if (lakes.length === 0 || loading) return;
    
    // Setup observer for the last lake element
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
    
    // Start observing the last element if it exists
    if (lastLakeRef.current) {
      console.log("Starting to observe last lake element");
      observer.observe(lastLakeRef.current);
    }
    
    // Cleanup function
    return () => {
      if (lastLakeRef.current) {
        observer.unobserve(lastLakeRef.current);
      }
      observer.disconnect();
    };
  }, [lakes, id, loading, hasMore]);
  
  // PART 4: EVENT HANDLERS
  
  // Handle lake update from admin
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
  
  // PART 5: COMPONENT RENDERING
  
  // Loading state for initial load
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

  // Error state
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
              // Assign ref to last element for infinite scrolling
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
                  {lake.area && <span> • Area: {lake.area} sq ha</span>}
                  {lake.coastlineLength && <span> • Coastline: {lake.coastlineLength} km</span>}
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