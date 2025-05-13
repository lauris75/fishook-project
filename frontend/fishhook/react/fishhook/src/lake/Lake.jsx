import React, { useState, useEffect } from "react";
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
  const [allLakes, setAllLakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLakes, setFilteredLakes] = useState([]);

  // Fetch data based on whether we're viewing a list or a single lake
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          // Get lake with related fish
          const response = await api.get(`/lake/${id}/withFish`);
          setLakeData(response.data);
          
          // If lake has fishes property and it's an array
          if (response.data.fishes && Array.isArray(response.data.fishes)) {
            // Sort fish alphabetically by name
            const sortedFish = [...response.data.fishes].sort((a, b) => 
              a.name.localeCompare(b.name)
            );
            setRelatedFish(sortedFish);
          } else {
            // Alternatively fetch lake-fish associations
            try {
              const lakeFishResponse = await api.get(`/lakeFish/lake/${id}`);
              if (lakeFishResponse.data && lakeFishResponse.data.length > 0) {
                // Get fish details for each association
                const fishPromises = lakeFishResponse.data.map(lakeFish => 
                  api.get(`/fish/${lakeFish.fishId}`)
                );
                const fishResponses = await Promise.all(fishPromises);
                const fishList = fishResponses.map(res => res.data);
                
                // Sort fish alphabetically by name
                const sortedFish = [...fishList].sort((a, b) => 
                  a.name.localeCompare(b.name)
                );
                setRelatedFish(sortedFish);
              }
            } catch (lakeFishErr) {
              console.error("Error fetching lake-fish associations:", lakeFishErr);
            }
          }
        } else {
          // Fetch all lakes for the list view
          const response = await api.get("/lake");
          setAllLakes(response.data);
          setFilteredLakes(response.data);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch lake information");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter lakes based on search query (only for list view)
  useEffect(() => {
    if (!id && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const filtered = allLakes.filter(
        lake =>
          lake.name.toLowerCase().includes(query) ||
          lake.summary.toLowerCase().includes(query) ||
          lake.latitude.toLowerCase().includes(query) ||
          lake.longitude.toLowerCase().includes(query)
      );
      setFilteredLakes(filtered);
    } else if (!id) {
      setFilteredLakes(allLakes);
    }
  }, [searchQuery, allLakes, id]);

  const handleLakeUpdated = (updatedLake) => {
    // Update the lake data while preserving fishes data
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
      // Add the new fish to the related fish list
      setRelatedFish(prev => {
        const updated = [...prev, changedFish];
        // Sort alphabetically
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
    } else if (action === 'remove') {
      // Remove the fish from the related fish list
      setRelatedFish(prev => 
        prev.filter(fish => fish.id !== changedFish.id)
      );
    }
    
    // Also update the lake data to reflect the change
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

  if (loading) return <div className="lake-page">Loading lake information...</div>;
  if (error) return <div className="lake-page">Error: {error}</div>;

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

  // List view (all lakes)
  return (
    <div className="lake-page list-view">
      <h1>Fishing Lakes</h1>
      <p className="page-description">Discover great lakes for fishing, their locations, and what fish you might catch there.</p>
      
      <SearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search lakes by name, location or description..."
      />
      
      {filteredLakes.length === 0 ? (
        <div className="no-results">
          <p>No lakes found matching "{searchQuery}"</p>
          <button onClick={() => setSearchQuery("")}>Clear search</button>
        </div>
      ) : (
        <div className="lake-grid">
          {filteredLakes.map((lake) => (
            <div className="lake-card" key={lake.id} onClick={() => window.location.href = `/lake/${lake.id}`}>
              <div className="lake-image">
                <img src={lake.photoURL} alt={lake.name} />
              </div>
              <div className="lake-info">
                <h3>{lake.name}</h3>
                <p>{lake.summary.substring(0, 100)}...</p>
                <div className="lake-coords">
                  <span>Lat: {lake.latitude}</span> • <span>Long: {lake.longitude}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lake;